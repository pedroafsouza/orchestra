# Auto-Refresh Interval Settings

## Priority
P2

## Category
datasource

## Description
Allow users to configure an optional auto-refresh interval for REST datasources. When set, data is automatically re-fetched at the specified interval.

### UI Addition to Fetch Status Bar

Add a "Refresh Settings" section (collapsible or in the Edit Config form):

```
Auto-refresh:  [Off ▼]
Options: Off, Every 5 min, Every 15 min, Every hour, Every 6 hours, Every day, Custom
Custom: [___] minutes
```

### Implementation

1. **Frontend** — Add `refreshIntervalMinutes` field to `RestConfigForm` (Task 003). Show current setting in the fetch status bar.

2. **Backend** — The auto-refresh doesn't need a cron job for MVP. Instead, use a **lazy refresh** strategy:
   - When data is requested (preview, flow API, or admin page load), check if `lastFetchAt + refreshInterval < now()`
   - If stale, trigger a background fetch
   - This avoids needing a scheduler while still keeping data reasonably fresh

3. **Future** — For real-time freshness, a cron or background worker could be added later.

## Current State
No refresh interval concept exists.

## Proposed State
Users can set a refresh interval. Data is lazily refreshed when accessed and the interval has elapsed.

## Acceptance Criteria
- [ ] Refresh interval field in REST config form
- [ ] Interval options: Off, 5m, 15m, 1h, 6h, 24h, Custom
- [ ] Lazy refresh logic in preview/flow endpoints
- [ ] Current interval displayed in fetch status bar
- [ ] "Last refreshed X ago" shows relative time

## Estimated Complexity
Small
