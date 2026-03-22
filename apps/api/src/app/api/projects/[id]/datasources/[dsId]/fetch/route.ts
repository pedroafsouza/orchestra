import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@orchestra/database';
import { requireAuth } from '@/lib/session';

/** Resolve a dot-path like "data.items" from an object */
function resolvePath(obj: any, path: string | undefined): any {
  if (!path || !path.trim()) return obj;
  return path.split('.').reduce((o, key) => {
    if (o == null) return undefined;
    const match = key.match(/^(\w+)\[(\d+)\]$/);
    if (match) return o[match[1]]?.[Number(match[2])];
    return o[key];
  }, obj);
}

/** POST — fetch data from a REST source and sync entries */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string; dsId: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    // Load datasource with its config
    const ds = await prisma.datasource.findUnique({
      where: { id: params.dsId },
    });

    if (!ds || ds.projectId !== params.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (ds.sourceType !== 'rest' || !ds.sourceConfig) {
      return NextResponse.json(
        { error: 'Datasource is not a REST source' },
        { status: 400 }
      );
    }

    const config = ds.sourceConfig as any;

    // Mark as pending
    await prisma.datasource.update({
      where: { id: params.dsId },
      data: { lastFetchStatus: 'pending' },
    });

    // Build URL
    const url = new URL(config.url);
    if (config.queryParams) {
      for (const [k, v] of Object.entries(config.queryParams as Record<string, string>)) {
        url.searchParams.set(k, v);
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...config.headers,
    };

    // Apply auth
    const auth = config.auth || { type: 'none' };
    if (auth.type === 'bearer') {
      headers['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth.type === 'api_key') {
      if (auth.in === 'header') {
        headers[auth.key] = auth.value;
      } else {
        url.searchParams.set(auth.key, auth.value);
      }
    } else if (auth.type === 'basic') {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString(
        'base64'
      );
      headers['Authorization'] = `Basic ${encoded}`;
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: config.method || 'GET',
        headers,
        body:
          config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)
            ? config.body
            : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      await prisma.datasource.update({
        where: { id: params.dsId },
        data: {
          lastFetchAt: new Date(),
          lastFetchStatus: 'error',
          lastFetchError: `HTTP ${response.status}: ${response.statusText}`,
        },
      });
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        entriesCreated: 0,
        entriesUpdated: 0,
        entriesDeleted: 0,
      });
    }

    const rawResponse = await response.json();
    let data = resolvePath(rawResponse, config.dataPath);
    if (!Array.isArray(data)) {
      if (Array.isArray(rawResponse)) {
        data = rawResponse;
      } else {
        await prisma.datasource.update({
          where: { id: params.dsId },
          data: {
            lastFetchAt: new Date(),
            lastFetchStatus: 'error',
            lastFetchError: 'Response did not resolve to an array',
          },
        });
        return NextResponse.json({
          success: false,
          error: 'Response did not resolve to an array',
          entriesCreated: 0,
          entriesUpdated: 0,
          entriesDeleted: 0,
        });
      }
    }

    // Cap at 1000
    data = data.slice(0, 1000);

    // Get field keys to filter data
    const fields = (ds.fields as any[]) || [];
    const fieldKeys = new Set(fields.map((f: any) => f.key));

    // Delete existing entries and create new ones (replace strategy)
    const existingCount = await prisma.datasourceEntry.count({
      where: { datasourceId: params.dsId },
    });

    await prisma.datasourceEntry.deleteMany({
      where: { datasourceId: params.dsId },
    });

    // Map data to entries, only keeping fields that match the schema
    const entries = data.map((item: any, index: number) => {
      const entryData: Record<string, any> = {};
      for (const key of fieldKeys) {
        if (item[key] !== undefined) {
          entryData[key] = item[key];
        }
      }
      return {
        datasourceId: params.dsId,
        data: entryData,
        sortOrder: index,
      };
    });

    if (entries.length > 0) {
      await prisma.datasourceEntry.createMany({ data: entries });
    }

    // Update datasource fetch status
    await prisma.datasource.update({
      where: { id: params.dsId },
      data: {
        lastFetchAt: new Date(),
        lastFetchStatus: 'success',
        lastFetchError: null,
      },
    });

    return NextResponse.json({
      success: true,
      entriesCreated: entries.length,
      entriesUpdated: 0,
      entriesDeleted: existingCount,
      lastFetchAt: new Date().toISOString(),
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    await prisma.datasource.update({
      where: { id: params.dsId },
      data: {
        lastFetchAt: new Date(),
        lastFetchStatus: 'error',
        lastFetchError: message,
      },
    });

    return NextResponse.json({
      success: false,
      error: message.includes('abort') ? 'Request timed out (30s)' : message,
      entriesCreated: 0,
      entriesUpdated: 0,
      entriesDeleted: 0,
    });
  }
}
