# Flow Editor Canvas Feels Flat

## Priority
P2

## Category
design-system

## Design Principle Violated
1. Visual Hierarchy — The canvas should feel like a workspace surface

## Description
The flow editor canvas area is the same background color as the rest of the app. It doesn't feel like a distinct "workspace" or "canvas" — it just feels like nodes floating on the page background. Compare to Figma's canvas (which has a distinct neutral surface) or React Flow demos that use a dotted/grid pattern to indicate the workspace area.

The side panel ("Add Node") also blends into the canvas without clear separation.

## Current State
![Flow editor dark](../screenshots/flow-editor-dark.png)
![Flow editor light](../screenshots/flow-editor-light.png)

## Proposed State
- Add a subtle dot grid pattern or very faint grid lines to the canvas background (React Flow supports this natively with `<Background />` component)
- Distinguish the side panel with a slightly different background shade and left border
- Consider a very subtle inner shadow on the canvas area to create an "inset workspace" feel

## Affected Pages
- Flow Editor

## Acceptance Criteria
- [ ] Canvas area feels like a distinct workspace
- [ ] Side panel is visually separated from canvas
- [ ] Grid/dots pattern visible but not distracting

## Estimated Complexity
Small

## Implementation Hints
- React Flow has a `<Background />` component with `variant="dots"` — likely just needs to be added/configured
- Side panel container styles
