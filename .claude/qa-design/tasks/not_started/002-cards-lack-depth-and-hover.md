# Cards Lack Depth and Hover Feedback

## Priority
P1

## Category
interaction

## Design Principle Violated
7. Micro-interactions — Hover states should feel polished and intentional
1. Visual Hierarchy — Cards should feel like elevated surfaces

## Description
Project cards on the home page and navigation cards on the dashboard have almost no visual hover feedback. Hovering a project card produces NO visible change. Dashboard cards only change the title text color — easy to miss.

Cards also lack sufficient elevation/depth. They use a `box-shadow: 0 1px 2px rgba(0,0,0,0.05)` which is invisible in dark mode. They feel like they sit ON the surface rather than floating above it.

Compared to Notion's cards (which lift on hover with shadow increase) or Linear's sidebar items (which show a clear background tint), Orchestra's cards feel static and unresponsive.

## Current State
![Project card - no hover change](../screenshots/projects-card-hover-dark.png)
![Dashboard card - subtle text color change only](../screenshots/dashboard-card-hover-dark.png)

## Proposed State
- **Cards at rest**: Add a more visible box-shadow. Dark mode: `0 2px 8px rgba(0,0,0,0.3)`. Light mode: `0 2px 8px rgba(0,0,0,0.08)`.
- **Cards on hover**: Scale up slightly (`transform: scale(1.01)` or `translateY(-2px)`), increase shadow depth, and add a subtle border glow or background brightness change. Add `transition: all 150ms ease`.
- **Project cards specifically**: The colorful gradient header is a great design element — on hover, consider making it slightly brighter or adding a glow effect.
- **Dashboard nav cards**: Add a clear background color shift on hover (slightly lighter in dark mode, slightly darker in light mode).

## Affected Pages
- Projects List (project cards)
- Project Dashboard (Flow Editor, Datasources, Live Preview, Settings cards)

## Acceptance Criteria
- [ ] Hovering any card produces a clearly visible visual change
- [ ] Cards at rest have visible shadow/elevation in both themes
- [ ] Hover transition is smooth (not abrupt)
- [ ] Hover state matches across all card types on the same page

## Estimated Complexity
Small

## Implementation Hints
- Project card component — add `hover:shadow-lg hover:-translate-y-0.5 transition-all` or equivalent
- Dashboard card component — add hover background/shadow change
- Check `apps/admin/src/index.css` card shadow values
