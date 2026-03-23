# Datasource Sidebar Lacks Visual Separation

## Priority
P2

## Category
spacing

## Design Principle Violated
1. Visual Hierarchy — Sidebar and content should be clearly distinct areas

## Description
On the Datasources page, the left sidebar (Collections list) blends into the main content area. In light mode especially, there's no clear visual boundary between the sidebar and the table area. The sidebar needs stronger visual framing to feel like a proper navigation panel.

## Current State
![Datasources dark - sidebar blends](../screenshots/datasources-table-dark.png)
![Datasources light - sidebar blends](../screenshots/datasources-table-light.png)

## Proposed State
- Add a right border or subtle shadow to the sidebar
- In dark mode: use a slightly different background shade for the sidebar (slightly lighter or darker than main content)
- In light mode: add a subtle right shadow or use white background with the main area having the gradient
- Add hover states to sidebar collection items (background color change on hover)
- Active collection should have a more prominent selected state (currently highlighted but could be stronger)

## Affected Pages
- Datasources page

## Acceptance Criteria
- [ ] Sidebar feels like a distinct panel from the main content
- [ ] Active collection is clearly highlighted
- [ ] Hover state visible on collection items

## Estimated Complexity
Small

## Implementation Hints
- Datasources layout component — sidebar container styles
- Collection button list — hover and active states
