# Excessive Empty Space Below Content

## Priority
P1

## Category
spacing

## Design Principle Violated
9. Whitespace — Generous but purposeful; avoid wasteful emptiness

## Description
Both the Projects List page and the Project Dashboard have massive empty areas below the content — more than half the viewport is just blank background. This makes the app feel unfinished and sparse rather than clean and intentional.

With only 4 projects, the projects grid takes up about 40% of the page height. The remaining 60% is empty gradient. Similarly, the dashboard with 4 stat cards + 4 nav cards + API bar occupies about 50% of the viewport.

Premium tools like Linear solve this with centered layouts, footer content, or simply constraining the max-width to keep content visually weighted.

## Current State
![Projects list with empty space](../screenshots/projects-list-dark-clean.png)
![Dashboard with empty space](../screenshots/dashboard-dark.png)

## Proposed State
- **Option A**: Center the content vertically when it doesn't fill the viewport — add `min-height: 100vh` with flexbox centering on the main content area
- **Option B**: Add subtle visual anchors at the bottom — a footer with version info, helpful links, or a "quick start" section
- **Option C**: Constrain the content area width to ~960px and center it, so the empty space feels like intentional margins rather than wasted area
- Consider max-width on the card grid container

## Affected Pages
- Projects List (`/`)
- Project Dashboard (`/project/:id`)

## Acceptance Criteria
- [ ] Empty space below content feels intentional, not wasteful
- [ ] Content feels visually balanced on the page
- [ ] Works well at various viewport heights

## Estimated Complexity
Medium

## Implementation Hints
- Main content area likely needs `max-w-5xl mx-auto` or similar constraint
- Or use flexbox with `justify-center` when content is shorter than viewport
