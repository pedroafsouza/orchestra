import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { z } from 'zod';

const TestRestSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('GET'),
  headers: z.record(z.string(), z.string()).optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  auth: z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('none') }),
      z.object({ type: z.literal('bearer'), token: z.string() }),
      z.object({
        type: z.literal('api_key'),
        key: z.string(),
        value: z.string(),
        in: z.enum(['header', 'query']),
      }),
      z.object({
        type: z.literal('basic'),
        username: z.string(),
        password: z.string(),
      }),
    ])
    .default({ type: 'none' }),
  dataPath: z.string().optional(),
});

/** Resolve a dot-path like "data.items" from an object */
function resolvePath(obj: any, path: string | undefined): any {
  if (!path || !path.trim()) return obj;
  return path.split('.').reduce((o, key) => {
    if (o == null) return undefined;
    // Support array index like "items[0]"
    const match = key.match(/^(\w+)\[(\d+)\]$/);
    if (match) return o[match[1]]?.[Number(match[2])];
    return o[key];
  }, obj);
}

/** Detect the field type from a JS value */
function detectFieldType(
  key: string,
  value: any
): 'text' | 'number' | 'boolean' | 'image_url' | 'url' {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|avif)/i.test(value))
      return 'image_url';
    if (/^https?:\/\//i.test(value)) return 'url';
  }
  return 'text';
}

function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** POST — test a REST endpoint and return a preview of the response */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const config = TestRestSchema.parse(body);

    // Build URL with query params
    const url = new URL(config.url);
    if (config.queryParams) {
      for (const [k, v] of Object.entries(config.queryParams)) {
        url.searchParams.set(k, v);
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...config.headers,
    };

    // Apply auth
    if (config.auth.type === 'bearer') {
      headers['Authorization'] = `Bearer ${config.auth.token}`;
    } else if (config.auth.type === 'api_key') {
      if (config.auth.in === 'header') {
        headers[config.auth.key] = config.auth.value;
      } else {
        url.searchParams.set(config.auth.key, config.auth.value);
      }
    } else if (config.auth.type === 'basic') {
      const encoded = Buffer.from(
        `${config.auth.username}:${config.auth.password}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
    }

    // Make the request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const start = Date.now();
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: config.method,
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
    const responseTime = Date.now() - start;

    const rawText = await response.text();
    let rawResponse: any;
    try {
      rawResponse = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          statusCode: response.status,
          responseTime,
          error: 'Response is not valid JSON',
          rawResponse: rawText.slice(0, 2000),
          data: [],
          detectedFields: [],
          totalItems: 0,
        },
        { status: 200 }
      );
    }

    // Extract data using dataPath
    let data = resolvePath(rawResponse, config.dataPath);
    if (!Array.isArray(data)) {
      // Try to detect if the response itself is an array
      if (Array.isArray(rawResponse)) {
        data = rawResponse;
      } else {
        return NextResponse.json(
          {
            success: true,
            statusCode: response.status,
            responseTime,
            error: config.dataPath
              ? `Path "${config.dataPath}" did not resolve to an array`
              : 'Response is not an array. Specify a data path to extract the array.',
            rawResponse:
              typeof rawResponse === 'object'
                ? Object.keys(rawResponse).slice(0, 20)
                : rawResponse,
            data: [],
            detectedFields: [],
            totalItems: 0,
          },
          { status: 200 }
        );
      }
    }

    // Cap at 1000 items
    const totalItems = data.length;
    data = data.slice(0, 1000);

    // Detect fields from first item
    const detectedFields: Array<{
      key: string;
      label: string;
      type: string;
    }> = [];
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      for (const [key, value] of Object.entries(data[0])) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) continue;
        if (Array.isArray(value)) continue;
        detectedFields.push({
          key,
          label: toTitleCase(key),
          type: detectFieldType(key, value),
        });
      }
    }

    return NextResponse.json({
      success: true,
      statusCode: response.status,
      responseTime,
      data: data.slice(0, 5), // Preview first 5 rows
      rawResponse: null,
      detectedFields,
      totalItems,
      error: null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        statusCode: 0,
        responseTime: 0,
        error: message.includes('abort')
          ? 'Request timed out (30s)'
          : message,
        data: [],
        detectedFields: [],
        totalItems: 0,
      },
      { status: 200 }
    );
  }
}
