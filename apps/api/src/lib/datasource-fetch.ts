import { prisma } from '@orchestra/database';

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

/**
 * Check if a REST datasource is stale and needs a refresh.
 * If stale, fetches new data in-place and updates entries.
 * Returns silently on failure (preserves existing data).
 */
export async function refreshIfStale(datasourceId: string): Promise<void> {
  const ds = await prisma.datasource.findUnique({
    where: { id: datasourceId },
  });

  if (!ds || ds.sourceType !== 'rest' || !ds.sourceConfig) return;

  const config = ds.sourceConfig as any;
  const refreshInterval = config.refreshIntervalMinutes;

  // Skip if no refresh interval configured
  if (!refreshInterval || refreshInterval <= 0) return;

  // Check staleness
  if (ds.lastFetchAt) {
    const staleAfter = new Date(ds.lastFetchAt).getTime() + refreshInterval * 60 * 1000;
    if (Date.now() < staleAfter) return; // Still fresh
  }

  // Fetch data
  try {
    const url = new URL(config.url);
    if (config.queryParams) {
      for (const [k, v] of Object.entries(config.queryParams as Record<string, string>)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...config.headers,
    };

    const auth = config.auth || { type: 'none' };
    if (auth.type === 'bearer') {
      headers['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth.type === 'api_key') {
      if (auth.in === 'header') headers[auth.key] = auth.value;
      else url.searchParams.set(auth.key, auth.value);
    } else if (auth.type === 'basic') {
      headers['Authorization'] = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000); // Shorter timeout for lazy refresh

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: config.method || 'GET',
        headers,
        body: config.body && ['POST', 'PUT', 'PATCH'].includes(config.method) ? config.body : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.warn(`[lazy-refresh] HTTP ${response.status} for datasource ${datasourceId}`);
      return; // Keep existing data
    }

    const rawResponse = await response.json();
    let data = resolvePath(rawResponse, config.dataPath);
    if (!Array.isArray(data)) {
      if (Array.isArray(rawResponse)) data = rawResponse;
      else return; // Can't extract array
    }

    data = data.slice(0, 1000);

    const fields = (ds.fields as any[]) || [];
    const fieldKeys = new Set(fields.map((f: any) => f.key));

    await prisma.datasourceEntry.deleteMany({ where: { datasourceId } });

    const entries = data.map((item: any, index: number) => {
      const entryData: Record<string, any> = {};
      for (const key of fieldKeys) {
        if (item[key] !== undefined) entryData[key] = item[key];
      }
      return { datasourceId, data: entryData, sortOrder: index };
    });

    if (entries.length > 0) {
      await prisma.datasourceEntry.createMany({ data: entries });
    }

    await prisma.datasource.update({
      where: { id: datasourceId },
      data: {
        lastFetchAt: new Date(),
        lastFetchStatus: 'success',
        lastFetchError: null,
      },
    });
  } catch (err) {
    console.warn(`[lazy-refresh] Failed for datasource ${datasourceId}:`, err);
    // Silently fail — keep existing data
  }
}
