# Update useDatasources Hook for Multi-Source Support

## Priority
P0

## Category
datasource

## Description
Update the `useDatasources` custom hook (`apps/admin/src/hooks/useDatasources.ts`) to handle multi-source datasources. The hook needs new state, actions, and API calls.

### New State & Actions

```typescript
// New state
wizardOpen: boolean;
wizardStep: number;                    // 0: type, 1: config, 2: mapping (REST only)
wizardSourceType: 'manual' | 'rest';
restConfig: RestSourceConfig | null;
testResult: TestRestResponse | null;
testLoading: boolean;
fetchLoading: boolean;

// New actions
setWizardOpen: (open: boolean) => void;
setWizardStep: (step: number) => void;
setWizardSourceType: (type: 'manual' | 'rest') => void;
setRestConfig: (config: RestSourceConfig) => void;

handleTestRest: (config: RestSourceConfig) => Promise<TestRestResponse>;
handleCreateRestDs: (name: string, config: RestSourceConfig, fields: DatasourceField[]) => Promise<void>;
handleFetchDs: (dsId: string) => Promise<void>;
handleUpdateRestConfig: (dsId: string, config: RestSourceConfig) => Promise<void>;

resetWizard: () => void;
```

### API Integration

- `handleTestRest` → `POST /api/projects/:id/datasources/test-rest`
- `handleCreateRestDs` → `POST /api/projects/:id/datasources` with `{ sourceType: 'rest', sourceConfig: { ... } }`
- `handleFetchDs` → `POST /api/projects/:id/datasources/:dsId/fetch`
- `handleUpdateRestConfig` → `PUT /api/projects/:id/datasources/:dsId` with updated `sourceConfig`

### Datasource Type Extension

```typescript
interface Datasource {
  id: string;
  name: string;
  fields: DatasourceField[];
  sourceType: 'manual' | 'rest';      // NEW
  sourceConfig?: RestSourceConfig;      // NEW
  lastFetchAt?: string;                 // NEW
  lastFetchStatus?: string;             // NEW
  lastFetchError?: string;              // NEW
  _count?: { entries: number };
}
```

## Current State
The hook manages only manual datasources with no concept of source type or external fetching.

## Proposed State
The hook supports wizard state management, REST config testing, fetch/refresh, and the full lifecycle of multi-source datasources.

## Acceptance Criteria
- [ ] Hook exposes wizard state (step, source type, REST config)
- [ ] `handleTestRest` calls test endpoint and returns response
- [ ] `handleCreateRestDs` creates datasource with REST source config
- [ ] `handleFetchDs` triggers data fetch and refreshes entries
- [ ] `handleUpdateRestConfig` updates REST configuration
- [ ] `resetWizard` clears all wizard state
- [ ] Loading states for test and fetch operations
- [ ] Datasource interface includes new source type fields
- [ ] Existing manual datasource operations unchanged

## Estimated Complexity
Medium
