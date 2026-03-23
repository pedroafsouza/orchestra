# Dashboard Stat Cards Feel Flat and Uniform

## Priority
P2

## Category
design-system

## Design Principle Violated
1. Visual Hierarchy — Important metrics should stand out
6. Softness & Comfort — Visual interest creates engagement

## Description
The 4 stat cards at the top of the dashboard (Screens, Datasources, Entries, Last Updated) all look identical — same background, same border, same size. The only differentiation is the icon color. They feel like a flat data table rather than visual metrics that draw the eye.

In premium dashboards (Vercel, Supabase), stat cards use subtle background tints, larger typography for the number, or icon backgrounds to create visual interest.

## Current State
![Flat stat cards](../screenshots/dashboard-dark.png)
![Light stat cards](../screenshots/dashboard-light.png)

## Proposed State
- Make the stat number larger and bolder (e.g., 32px font-size, font-weight 700)
- Add subtle colored background tints to each card matching their icon color (very light versions)
- Or add a colored left border accent to each card
- Consider making the icon sit in a colored circular badge rather than just being a standalone icon

## Affected Pages
- Project Dashboard

## Acceptance Criteria
- [ ] Stat numbers are immediately eye-catching
- [ ] Each stat card has subtle visual differentiation
- [ ] Cards still feel cohesive as a group

## Estimated Complexity
Small

## Implementation Hints
- Dashboard stat card component
- Can use Tailwind `bg-blue-500/5` style subtle tints
