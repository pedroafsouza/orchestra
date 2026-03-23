# Fetch Status Display & Manual Refresh

## Priority
P0

## Category
datasource

## Description
When a REST-sourced datasource is selected, the UI should clearly show:
1. The source type (REST vs Manual) with a badge/icon
2. When data was last fetched
3. The fetch status (success/error)
4. A "Refresh" button to re-fetch data on demand
5. The REST configuration summary (URL, method)

### UI Changes to Collection View

```
┌──────────────────────────────────────────────────────┐
│  Properties  6 rows  🌐 REST                        │
│                                                      │
│  ┌─ Source ───────────────────────────────────────┐  │
│  │  GET https://api.example.com/v1/properties     │  │
│  │  Last fetched: 5 minutes ago  ✓ Success        │  │
│  │                                                │  │
│  │  [🔄 Refresh Now]  [⚙ Edit Config]            │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Search / Fields / Add Entry (disabled) ───────┐  │
│  ...existing table...                                │
└──────────────────────────────────────────────────────┘
```

### Key Behaviors

1. **Source badge** — Show "Manual" or "REST" badge next to the collection name in both the sidebar list and the header.
2. **Source info bar** — For REST datasources, show a collapsible info bar above the table with:
   - HTTP method + URL (truncated with tooltip for long URLs)
   - Last fetch timestamp (relative: "5 minutes ago")
   - Status indicator (green checkmark for success, red X for error with message)
3. **Refresh button** — Calls `POST /:dsId/fetch` and shows a loading spinner. On completion, refreshes the entry table.
4. **Edit Config button** — Opens the REST configuration form (Task 003) pre-filled with current `sourceConfig`, allowing users to modify the endpoint.
5. **Read-only entries** — For REST datasources, the inline editing on the table should be disabled (data comes from the API). The "Add Entry" button should be hidden or disabled with a tooltip: "Entries are managed by the REST source."
6. **Error state** — If last fetch failed, show the error prominently with a retry button.

### Sidebar Enhancement

In `DatasourceList.tsx`, add a small icon next to REST datasources:
```
Bookings     2 rows         (no icon — manual)
Properties   6 rows  🌐     (globe icon — REST)
```

## Current State
No indication of source type. All datasources look the same. No fetch/refresh capability.

![Current view](../screenshots/ds-02-properties-table.png)

## Proposed State
REST datasources are visually distinct with fetch status, refresh controls, and read-only entry tables.

## Acceptance Criteria
- [ ] Source type badge shown in sidebar and collection header
- [ ] REST datasources show source info bar with URL, method, last fetch time, and status
- [ ] "Refresh Now" button triggers fetch and shows loading state
- [ ] "Edit Config" button opens pre-filled REST configuration form
- [ ] Entry table is read-only for REST datasources (no inline edit, no Add Entry)
- [ ] Error state shown clearly with error message and retry option
- [ ] Relative time display for last fetch (e.g., "5 minutes ago", "2 hours ago")
- [ ] Loading spinner during fetch

## Estimated Complexity
Medium
