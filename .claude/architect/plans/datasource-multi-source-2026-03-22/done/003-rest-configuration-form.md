# REST API Configuration Form

## Priority
P0

## Category
datasource

## Description
Build the REST API configuration step of the datasource creation wizard. This form lets users define how to connect to an external REST endpoint.

### Form Layout

```
Step 2: Configure REST API
┌──────────────────────────────────────────────────┐
│                                                  │
│  Endpoint URL:                                   │
│  [https://api.example.com/v1/listings__________] │
│                                                  │
│  Method:  [GET ▼]                                │
│                                                  │
│  ── Authentication ──────────────────────        │
│  Type: [None ▼]                                  │
│    → None: (no extra fields)                     │
│    → Bearer Token: [token input]                 │
│    → API Key: [Key name] [Value] [In: header▼]  │
│    → Basic Auth: [Username] [Password]           │
│                                                  │
│  ── Headers ─────────────────────────────        │
│  [Key         ] [Value              ] [× ]       │
│  [Key         ] [Value              ] [× ]       │
│  [+ Add Header]                                  │
│                                                  │
│  ── Query Parameters ────────────────────        │
│  [Key         ] [Value              ] [× ]       │
│  [+ Add Parameter]                               │
│                                                  │
│  ── Request Body (POST/PUT only) ────────        │
│  [                                     ]         │
│  [   JSON editor / textarea            ]         │
│  [                                     ]         │
│                                                  │
│  ── Data Path (optional) ────────────────        │
│  JSONPath to array in response:                  │
│  [data.items________________________________]    │
│  Hint: Leave empty if the response is the array  │
│                                                  │
│  [← Back]              [Test Connection →]       │
└──────────────────────────────────────────────────┘
```

### Key Behaviors

1. **Method selector** — GET, POST, PUT, PATCH. Body field only shows for POST/PUT/PATCH.
2. **Auth type** — Discriminated union: selecting a type reveals the relevant fields.
3. **Headers** — Dynamic key-value list with add/remove.
4. **Query params** — Same dynamic key-value pattern.
5. **Data path** — User specifies where in the JSON response the data array lives (e.g., `data.results`, `items`, or empty for root array).
6. **Test Connection** button — Sends a test request via the API (Task 004) and shows a preview of the response.

### Component

`apps/admin/src/components/datasources/RestConfigForm.tsx`

Use shadcn/ui components: `Input`, `Select`, `Button`, `Label`, `Textarea`, `Accordion` or collapsible sections for Headers/Query Params/Body.

## Current State
No REST configuration UI exists. Datasources only support manual entry.

## Proposed State
A clean, well-organized form that guides users through REST API setup with dynamic sections that appear based on selections (auth type, HTTP method).

## Acceptance Criteria
- [ ] Form collects: URL, method, auth config, headers, query params, body, data path
- [ ] Auth type selector dynamically shows relevant fields
- [ ] Body textarea only visible for POST/PUT/PATCH methods
- [ ] Dynamic key-value rows for headers and query params (add/remove)
- [ ] Data path field with helper text
- [ ] Form validation (URL required, auth fields required when auth type selected)
- [ ] "Test Connection" button wired to API endpoint (Task 004)
- [ ] Form state integrates with the wizard (back preserves state)

## Estimated Complexity
Large
