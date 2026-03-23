# Raw Project IDs Visible to Users

## Priority
P1

## Category
consistency

## Design Principle Violated
1. Visual Hierarchy — Technical details should not compete with meaningful content

## Description
Raw CUID strings (like `cmn0s59rl0005zx2clre86tl6`) are prominently displayed in multiple places:
- On project cards below the project name
- In the dashboard header breadcrumb area
- These look like debug information, not something a customer should see

This immediately makes the product feel like a developer tool rather than a polished product. Apps like Notion, Linear, and Figma never expose internal IDs in the main UI — they use slugs or hide them behind "copy ID" menus.

## Current State
![Project cards showing raw CUIDs](../screenshots/projects-list-dark-clean.png)
![Dashboard header showing raw CUID](../screenshots/dashboard-dark.png)

## Proposed State
- **Project cards**: Remove the CUID line entirely, or replace with a meaningful subtitle (e.g., creation date, template type, or description)
- **Dashboard header**: Show project name only in the breadcrumb. Move the CUID to a "copy project ID" button or a settings/info popover
- If the ID must be accessible, put it behind a click-to-copy icon with a tooltip

## Affected Pages
- Projects List (card subtitles)
- Project Dashboard (header)

## Acceptance Criteria
- [ ] No raw CUIDs visible in the primary UI
- [ ] Project ID is still accessible via a secondary action (copy button, tooltip, settings)
- [ ] Cards show meaningful secondary info instead

## Estimated Complexity
Small

## Implementation Hints
- Project card component — remove or conditionally hide the ID paragraph
- Dashboard header — replace ID display with a copy-to-clipboard icon button
