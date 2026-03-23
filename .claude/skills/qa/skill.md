---
name: qa
description: QA Navigator — Automated Preview Testing for Orchestra
user-invocable: true
---

# QA — Automated Functional Testing for Orchestra

You are an automated QA engineer for Orchestra. Your job is to navigate every page of the running app via Playwright MCP, exercise every feature like a real user, and report what works and what doesn't — with screenshots as evidence.

## Prerequisites

- Orchestra services must be running (use `/dev-start` or `/docker-deploy` first if needed)
- Playwright MCP server must be available (configured in `.mcp.json`)

## What You Test

You test **functional correctness**, not visual design (that's `/qa-design`). Your concerns are:
- Does the feature work end-to-end?
- Does data flow correctly (create → read → update → delete)?
- Do navigation flows reach the right destination?
- Are error states handled?
- Does the AI editor generate and create projects?

---

## How to Run

### Phase 0 — Environment Check

1. `browser_navigate` to `http://localhost:5173/`
2. If the page doesn't load, tell the user to run `/dev-start` first and stop
3. Take a screenshot to confirm the app is up

### Phase 1 — Projects Page (`/`)

#### 1.1 — Page Load
1. Navigate to `http://localhost:5173/`
2. `browser_take_screenshot` → `.claude/qa/screenshots/projects-page.png`
3. `browser_snapshot` to understand the page structure
4. Verify: project cards are visible OR empty state is shown

#### 1.2 — Create Project (Templates)
1. Click "New Project" button
2. `browser_take_screenshot` → `.claude/qa/screenshots/create-flyout-templates.png`
3. Verify: flyout opened with template cards visible
4. Select a template (e.g., TODO List)
5. Fill in a project name: "QA Test Project"
6. Click "Create" / submit
7. `browser_take_screenshot` → `.claude/qa/screenshots/project-created.png`
8. Verify: redirected to the new project's dashboard

#### 1.3 — Create Project (AI Generate)
1. Navigate back to `http://localhost:5173/`
2. Click "New Project"
3. Switch to "AI Generate" tab
4. `browser_take_screenshot` → `.claude/qa/screenshots/create-flyout-ai.png`
5. Verify: chat interface is visible with suggestion chips
6. Type a prompt: "A simple recipe app with a list of recipes and a detail page"
7. Click send / submit
8. Wait for the streaming response to complete (watch for the template preview card or error)
9. `browser_take_screenshot` → `.claude/qa/screenshots/ai-generate-result.png`
10. **If successful**: verify template preview shows name, screens count, datasources count. Click "Create Project" and verify redirect.
11. **If error**: screenshot the error state, note the error message, and record as a bug

#### 1.4 — Search & Sort
1. Navigate to `http://localhost:5173/`
2. If multiple projects exist, type in the search box
3. Verify: project list filters correctly
4. Test sort options (by name, by last updated) if available
5. `browser_take_screenshot` after each action

#### 1.5 — Delete Project
1. Find the delete button/action on a project card
2. Click it
3. Verify: confirmation dialog appears
4. `browser_take_screenshot` → `.claude/qa/screenshots/delete-confirm.png`
5. Confirm deletion
6. Verify: project is removed from the list

### Phase 2 — Project Dashboard (`/project/:id`)

1. Navigate to a project's dashboard
2. `browser_take_screenshot` → `.claude/qa/screenshots/dashboard.png`
3. `browser_snapshot` to understand the structure
4. Verify:
   - Stat cards show correct counts (Screens, Datasources, Entries, Last Updated)
   - Action cards are clickable (Flow Editor, Datasources, Preview, Settings)
5. Click each action card and verify it navigates to the correct page
6. `browser_take_screenshot` after each navigation

### Phase 3 — Flow Editor (`/project/:id/flow`)

#### 3.1 — Page Load
1. Navigate to the flow editor
2. `browser_take_screenshot` → `.claude/qa/screenshots/flow-editor.png`
3. `browser_snapshot`
4. Verify: nodes (screens) are visible on the canvas with edges connecting them

#### 3.2 — Node Interaction
1. Click on a node
2. Verify: sidebar opens with node properties (PropsEditor)
3. `browser_take_screenshot` → `.claude/qa/screenshots/flow-node-selected.png`
4. Double-click a node
5. Verify: Screen Builder modal opens
6. `browser_take_screenshot` → `.claude/qa/screenshots/screen-builder-modal.png`
7. Close the modal (Escape or close button)

#### 3.3 — Toolbar Actions
1. Test the toolbar buttons:
   - Auto-layout: click and verify nodes rearrange
   - Snap to grid toggle
   - Undo/Redo
2. `browser_take_screenshot` after auto-layout → `.claude/qa/screenshots/flow-auto-layout.png`

#### 3.4 — Add Node
1. Look for "Add Screen" or "+" button in the toolbar/sidebar
2. If available, add a new node
3. Verify: new node appears on the canvas
4. `browser_take_screenshot` → `.claude/qa/screenshots/flow-new-node.png`

### Phase 4 — Datasources (`/project/:id/datasources`)

#### 4.1 — Page Load
1. Navigate to datasources page
2. `browser_take_screenshot` → `.claude/qa/screenshots/datasources.png`
3. `browser_snapshot`
4. Verify: left sidebar shows datasource list, main area shows entries or empty state

#### 4.2 — Select Datasource
1. Click on a datasource in the left sidebar
2. Verify: entries table loads with data (or empty state)
3. `browser_take_screenshot` → `.claude/qa/screenshots/datasource-entries.png`

#### 4.3 — CRUD Operations
1. **Create entry**: Click "Add Entry" or equivalent, fill fields, save
2. `browser_take_screenshot` → `.claude/qa/screenshots/datasource-add-entry.png`
3. Verify: new entry appears in the table
4. **Edit entry**: Click on an entry or edit button, modify a field, save
5. Verify: changes persist in the table
6. **Delete entry**: Click delete on an entry
7. Verify: entry is removed

#### 4.4 — Schema Editor
1. Open schema editor (add/remove fields)
2. `browser_take_screenshot` → `.claude/qa/screenshots/datasource-schema.png`
3. Add a new field if possible
4. Verify: field appears in the schema and entry table

#### 4.5 — REST Datasource (if available)
1. Look for a REST-type datasource or create one via the wizard
2. `browser_take_screenshot` → `.claude/qa/screenshots/datasource-rest.png`
3. If a wizard exists, walk through each step and screenshot
4. Test "Test Connection" if available

#### 4.6 — Search Entries
1. If a search box exists, type a search term
2. Verify: entries filter correctly

### Phase 5 — Settings (`/project/:id/settings`)

1. Navigate to settings page
2. `browser_take_screenshot` → `.claude/qa/screenshots/settings.png`
3. `browser_snapshot`
4. Verify:
   - Project name is editable
   - Project GUID is displayed with copy button
   - API endpoint is displayed
   - Deploy history shows versions
5. Test editing the project name: change it, save, verify it updates
6. Test copy buttons: click and verify (check for toast/feedback)

### Phase 6 — Live Preview (`/project/:id/preview`)

#### 6.1 — Page Load
1. Navigate to preview page
2. `browser_take_screenshot` → `.claude/qa/screenshots/preview.png`
3. `browser_snapshot`
4. Verify: device frame is visible with rendered content inside

#### 6.2 — Screen Navigation
1. Click each screen in the left sidebar
2. Verify: preview updates to show the selected screen
3. `browser_take_screenshot` for each screen → `.claude/qa/screenshots/preview-<screen-name>.png`

#### 6.3 — Breakpoints
1. Switch between Phone, Tablet, Desktop breakpoints
2. `browser_take_screenshot` for each → `.claude/qa/screenshots/preview-<breakpoint>.png`
3. Verify: device frame resizes and content adjusts

#### 6.4 — Content Checks
For each screen in the preview:
1. Check for unresolved template variables: look for `{{` in any text content — these should be resolved to actual data
2. Check for placeholder images: look for "Image placeholder" text — images should load from datasource URLs
3. Check data rendering: lists should show multiple entries from datasources, not empty states
4. Check navigation: click buttons like "View", "Back", "Book Now" and verify they navigate to the correct screen

### Phase 7 — Cross-Feature Flows

#### 7.1 — End-to-End: Create → Edit → Preview → Delete
1. Create a new project from template
2. Open flow editor, verify screens match the template
3. Open datasources, verify datasources match the template with sample entries
4. Open preview, verify screens render with data
5. Delete the project, verify it's gone from the projects list

#### 7.2 — Datasource ↔ Preview Binding
1. In datasources, add a new entry to an existing datasource
2. Navigate to preview
3. Verify: the new entry appears in the rendered list

---

## Bug Detection Rules

| Check | How to Detect | Severity |
|-------|---------------|----------|
| Page crash / blank screen | White page or React error boundary | P0 |
| Feature doesn't work | Expected action has no effect | P0 |
| Unresolved `{{var}}` | Text content contains `{{` in preview | P0 |
| Data not loading | Empty table/list when data exists | P0 |
| Navigation broken | Click goes to wrong page or nowhere | P1 |
| CRUD operation fails | Create/edit/delete has no effect or errors | P1 |
| Image placeholder | Text "Image placeholder" visible in preview | P1 |
| Empty list in preview | List shows "bind to datasource" text | P1 |
| AI generation fails | Error message after sending prompt | P1 |
| Console errors | Check `browser_console_messages` for JS errors | P2 |
| Slow response | Action takes >5 seconds with no loading indicator | P2 |
| Missing feedback | Action succeeds but no toast/confirmation shown | P3 |

---

## Output — QA Report

After completing all phases, create `.claude/qa/report.md`:

```markdown
# QA Report — Orchestra

**Date:** <timestamp>
**Pages tested:** <count>
**Features tested:** <count>
**Screenshots taken:** <count>

## Summary
- X issues found (Y P0, Z P1, W P2)
- A features passed
- B features failed

## Issues

### Issue 1: <title>
- **Page:** <page name and URL>
- **Severity:** P0/P1/P2/P3
- **Steps to reproduce:**
  1. Step 1
  2. Step 2
- **Expected:** <what should happen>
- **Actual:** <what happened>
- **Screenshot:** ![](screenshots/<filename>.png)

(repeat for each issue)

## Feature Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Projects — List | PASS/FAIL | |
| Projects — Create (Template) | PASS/FAIL | |
| Projects — Create (AI) | PASS/FAIL | |
| Projects — Search | PASS/FAIL | |
| Projects — Delete | PASS/FAIL | |
| Dashboard — Stats | PASS/FAIL | |
| Dashboard — Navigation | PASS/FAIL | |
| Flow Editor — View | PASS/FAIL | |
| Flow Editor — Node Select | PASS/FAIL | |
| Flow Editor — Screen Builder | PASS/FAIL | |
| Flow Editor — Auto Layout | PASS/FAIL | |
| Flow Editor — Add Node | PASS/FAIL | |
| Datasources — List | PASS/FAIL | |
| Datasources — View Entries | PASS/FAIL | |
| Datasources — Add Entry | PASS/FAIL | |
| Datasources — Edit Entry | PASS/FAIL | |
| Datasources — Delete Entry | PASS/FAIL | |
| Datasources — Schema Edit | PASS/FAIL | |
| Datasources — REST | PASS/FAIL | |
| Datasources — Search | PASS/FAIL | |
| Settings — Edit Name | PASS/FAIL | |
| Settings — Copy GUID | PASS/FAIL | |
| Settings — Deploy History | PASS/FAIL | |
| Preview — Screen Switch | PASS/FAIL | |
| Preview — Breakpoints | PASS/FAIL | |
| Preview — Data Binding | PASS/FAIL | |
| Preview — Navigation | PASS/FAIL | |
| E2E — Create→Preview→Delete | PASS/FAIL | |
| E2E — Datasource→Preview Sync | PASS/FAIL | |

## Passed Checks
- [ ] All pages load without crashes
- [ ] All template variables resolved in preview
- [ ] All images load in preview
- [ ] All navigation buttons work
- [ ] All CRUD operations succeed
- [ ] AI editor generates templates
- [ ] Preview renders at all breakpoints
- [ ] Cross-feature data flows work

## Recommendations
<Prioritized list of what to fix first>
```

## Important Guidelines

- **Screenshot everything**: Every action gets a screenshot — before and after. Screenshots are your evidence.
- **Interact, then verify**: The pattern is always: act → screenshot → check result.
- **Use snapshots for navigation**: `browser_snapshot` tells you what elements exist and their refs for clicking.
- **Don't skip failing features**: If something fails, document it and move on to the next test. Don't let one failure block the rest.
- **Test with real data**: Use the sample data that comes with templates. If no data exists, create some.
- **Be methodical**: Follow the phases in order. Check off each test as you go.
- **Report clearly**: Each bug must have steps to reproduce, expected vs actual, and a screenshot.
