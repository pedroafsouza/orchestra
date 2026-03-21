# Add Favicon

## Priority
P3

## Category
ux-bug

## Description
The app is missing a favicon, causing a 404 error in the browser console on every page load. This is a small polish issue that affects perceived quality.

## Current State
- Console error: `Failed to load resource: the server responded with a status of 404 (Not Found) @ http://localhost:5173/favicon.ico`
- Browser tab shows default blank icon

## Proposed State
- Orchestra-branded favicon (SVG or multi-size ICO)
- Matches the app's purple/blue color scheme
- Also add apple-touch-icon for mobile bookmarks

## Acceptance Criteria
- [ ] No 404 error for favicon in console
- [ ] Favicon visible in browser tab
- [ ] Favicon matches Orchestra branding

## Estimated Complexity
Small
