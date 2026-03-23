# Table Row Hover State Missing

## Priority
P2

## Category
interaction

## Design Principle Violated
7. Micro-interactions — Interactive rows should respond to hover

## Description
The data table in the Datasources page shows no visible row hover effect. When browsing tabular data, row highlighting on hover is essential for readability — it helps the eye track across columns. Every modern data table (Notion, Airtable, Linear) highlights rows on hover.

## Current State
![Table without row hover](../screenshots/datasources-table-dark.png)

## Proposed State
- Add a subtle background color change on row hover
- Dark mode: `hover:bg-white/5` or similar very subtle lightening
- Light mode: `hover:bg-black/3` or `hover:bg-muted/50`
- Add `transition-colors duration-100` for smooth feel

## Affected Pages
- Datasources table view

## Acceptance Criteria
- [ ] Hovering a table row produces a visible background change
- [ ] Hover is subtle enough not to be distracting
- [ ] Works well in both themes

## Estimated Complexity
Small

## Implementation Hints
- Table row component — add hover background class
