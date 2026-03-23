# Header/Navbar Lacks Visual Presence

## Priority
P2

## Category
design-system

## Design Principle Violated
1. Visual Hierarchy — The header should anchor the top of the page

## Description
The top header bar is very thin and minimal. In dark mode it has a barely visible bottom border. In light mode it's almost indistinguishable from the background. It doesn't create a clear visual anchor at the top of the page.

The "Orchestra" brand text is small and uses primary color but doesn't feel like a strong brand mark. Compare to Linear's header (clear dark bar with logo) or Vercel's (clean white with strong logo mark).

## Current State
![Dark header](../screenshots/projects-list-dark-clean.png)
![Light header](../screenshots/projects-list-light.png)

## Proposed State
- Add slightly more vertical padding to the header (currently feels cramped)
- In dark mode: use a slightly lighter background than the body gradient, or add a subtle `backdrop-filter: blur(12px)` with semi-transparent background for a frosted glass effect
- In light mode: add a subtle bottom shadow instead of/in addition to border
- Consider making the "Orchestra" brand text slightly larger or adding a small logo icon

## Affected Pages
- All pages (shared header component)

## Acceptance Criteria
- [ ] Header feels like a clear, anchored top bar in both themes
- [ ] Brand presence is visible without being overbearing
- [ ] Clear visual separation between header and page content

## Estimated Complexity
Small

## Implementation Hints
- Header/banner component styles
- Consider `backdrop-filter: blur()` for frosted glass effect in dark mode
