# Support REST Datasources in Preview & Mobile Runtime

## Priority
P1

## Category
datasource

## Description
Ensure that REST-sourced datasources work correctly in the live preview and the mobile Expo app. The preview API already serves datasources with entries — but REST datasources may need a fresh fetch at preview/publish time.

### Changes Needed

1. **Preview API (`/api/preview/[guid]/route.ts`)** — When serving a flow that includes REST datasources, check if `lastFetchAt` is stale (older than `refreshIntervalMinutes` if configured). If stale, trigger a fetch before serving the data. If no refresh interval, serve the last fetched data as-is.

2. **Flow API (`/api/flow/[id]/latest/route.ts`)** — Same staleness check as preview. This is the endpoint the mobile app calls.

3. **Datasource serialization** — REST datasources should be serialized the same way as manual ones (entries array). The mobile app doesn't need to know the source type — it just receives data.

4. **No client-side fetching** — The mobile app should NOT make REST calls directly. All data flows through Orchestra's API. This keeps auth credentials secure and avoids CORS issues on mobile.

## Current State
Preview and flow APIs serve datasource entries without awareness of source type.

## Proposed State
REST datasources are automatically refreshed (if stale) when the preview or flow is requested. The mobile runtime receives fresh data transparently.

## Acceptance Criteria
- [ ] Preview endpoint checks staleness and triggers fetch if needed
- [ ] Flow endpoint checks staleness and triggers fetch if needed
- [ ] Stale threshold based on `refreshIntervalMinutes` from source config
- [ ] Falls back to existing data if fetch fails (with warning logged)
- [ ] Mobile app receives REST data in the same format as manual data
- [ ] No breaking changes to the preview/flow response format

## Estimated Complexity
Medium
