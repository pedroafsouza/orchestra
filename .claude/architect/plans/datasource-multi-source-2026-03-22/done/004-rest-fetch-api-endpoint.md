# REST Fetch API Endpoint (Server-Side Proxy)

## Priority
P0

## Category
datasource

## Description
Create API endpoints that execute REST requests on behalf of the user. This is needed for two reasons:
1. **CORS** — Browser can't call arbitrary APIs directly.
2. **Security** — Auth credentials (tokens, API keys) stay server-side and aren't exposed to the browser.

### Endpoints

#### Test Connection (used during wizard)
```
POST /api/projects/:id/datasources/test-rest
Body: { url, method, headers, queryParams, body, auth, dataPath }
Response: {
  success: boolean,
  statusCode: number,
  responseTime: number,       // ms
  data: any[],                // Extracted array using dataPath
  rawResponse: any,           // Full response (truncated if large)
  detectedFields: Array<{     // Auto-detected field schema
    key: string,
    label: string,
    type: 'text' | 'number' | 'boolean' | 'image_url' | 'url'
  }>,
  totalItems: number,
  error?: string
}
```

#### Fetch / Refresh (used for existing datasources)
```
POST /api/projects/:id/datasources/:dsId/fetch
Response: {
  success: boolean,
  entriesCreated: number,
  entriesUpdated: number,
  entriesDeleted: number,
  lastFetchAt: string,
  error?: string
}
```

### Implementation Details

1. **Server-side HTTP client** — Use `fetch` (native in Node 18+) or `undici` to make the request.
2. **Data path extraction** — Parse the `dataPath` string (e.g., `"data.items"`) and use lodash `_.get()` or a simple path resolver to extract the array from the response.
3. **Field detection** — Analyze the first item in the response array and infer field types:
   - String that looks like a URL → `url` or `image_url` (if ends in image extension)
   - Number → `number`
   - Boolean → `boolean`
   - Everything else → `text`
4. **Fetch & sync** — For the `/fetch` endpoint, replace all entries in the datasource with the freshly fetched data. Update `lastFetchAt`, `lastFetchStatus`, `lastFetchError` on the datasource.
5. **Timeout** — 30 second timeout on external requests.
6. **Size limit** — Cap response at 5MB, cap entries at 1000 rows.

### Security Considerations
- Validate URL is not a private/internal IP (prevent SSRF)
- Rate-limit the test endpoint
- Store auth credentials in `sourceConfig` (already JSON on the model)

## Current State
No server-side proxy for external API calls exists.

## Proposed State
Two API endpoints that safely execute REST requests, extract data, detect schemas, and sync entries.

## Acceptance Criteria
- [ ] `POST /test-rest` endpoint accepts REST config and returns response preview + detected fields
- [ ] `POST /:dsId/fetch` endpoint fetches data and syncs entries (replace strategy)
- [ ] Data path extraction works for nested responses (e.g., `data.results[0].items`)
- [ ] Field type auto-detection works for common types
- [ ] Timeout and size limits enforced
- [ ] SSRF protection (block private IPs)
- [ ] Updates `lastFetchAt`, `lastFetchStatus`, `lastFetchError` on the datasource record
- [ ] Error responses are descriptive (network error, timeout, invalid JSON, etc.)

## Estimated Complexity
Large
