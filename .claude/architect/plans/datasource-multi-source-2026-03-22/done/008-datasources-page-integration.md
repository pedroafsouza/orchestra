# Integrate Wizard & Fetch UI into DatasourcesPage

## Priority
P1

## Category
datasource

## Description
Wire up all the new components (wizard, REST config, field mapping, fetch status) into the existing `DatasourcesPage.tsx`. This is the integration task that brings everything together.

### Changes to DatasourcesPage.tsx

1. **Replace inline create form** — The current `showCreate` conditional block that renders the inline "New Datasource" form should be replaced with the `DatasourceWizard` component (Task 002).

2. **Add source info bar** — When a REST datasource is selected, render the fetch status bar (Task 006) between the header and the entry table.

3. **Conditional table editing** — Pass a `readOnly` prop to `EntryTable` when the selected datasource is REST-sourced. Hide "Add Entry" button for REST datasources.

4. **Edit Config flow** — When user clicks "Edit Config" on a REST datasource, open the `RestConfigForm` in edit mode (pre-filled with current config), allowing save.

5. **Sidebar badges** — Pass `sourceType` to `DatasourceList` so it can render source type indicators.

### Component Tree

```
DatasourcesPage
├── DatasourceList (sidebar — now with source type badges)
├── DatasourceWizard (replaces inline create form)
│   ├── Step 1: SourceTypeSelector
│   ├── Step 2a: SchemaEditor (manual)
│   ├── Step 2b: RestConfigForm (REST)
│   └── Step 3: FieldMappingStep (REST)
├── FetchStatusBar (new — REST datasources only)
├── SchemaEditor (existing field management)
└── EntryTable (existing — now with readOnly mode)
```

## Current State
The page renders an inline create form and assumes all datasources are manual.

## Proposed State
The page supports both manual and REST datasources with appropriate UI for each, integrated wizard for creation, and fetch controls for REST sources.

## Acceptance Criteria
- [ ] "New" button opens the wizard instead of inline form
- [ ] REST datasources show fetch status bar
- [ ] Entry table is read-only for REST datasources
- [ ] "Add Entry" hidden for REST datasources
- [ ] "Edit Config" opens REST config form in edit mode
- [ ] Source type badges visible in sidebar
- [ ] Page works correctly for both manual and REST datasources
- [ ] No regressions in existing manual datasource functionality

## Estimated Complexity
Medium
