# Background Gradient Too Subtle — Feels Nearly Flat

## Priority
P1

## Category
color

## Design Principle Violated
6. Softness & Comfort — The background should create visual depth and warmth

## Description
The body background gradient (135deg linear) is barely perceptible in both dark and light modes. The page feels flat and monotone rather than soft and layered. Compared to apps like Linear (which uses a subtle warm radial gradient) or Vercel Dashboard (layered surfaces), Orchestra's background doesn't create the sense of depth and comfort needed for a premium product.

In dark mode, the gradient goes from `rgb(13, 16, 28)` to `rgb(9, 11, 17)` — a difference so small it's invisible. Light mode similarly goes from near-white to slightly-less-white.

## Current State
![Dark mode projects list](../screenshots/projects-list-dark-clean.png)
![Light mode projects list](../screenshots/projects-list-light.png)

## Proposed State
- **Dark mode**: Use a more expressive gradient — consider a subtle radial gradient with a hint of blue/purple warmth in the center, like `radial-gradient(ellipse at top left, hsl(230 40% 12%) 0%, hsl(222 30% 5%) 70%)`. This creates visual interest without being distracting.
- **Light mode**: Add a subtle warm tint shift, like `linear-gradient(160deg, hsl(220 30% 97%) 0%, hsl(240 20% 95%) 50%, hsl(220 25% 94%) 100%)`. A three-stop gradient feels more organic.
- Consider adding a very subtle noise texture overlay (CSS `background-image` with a small SVG data URL) for tactile depth — Linear and Raycast both do this.

## Affected Pages
- All pages (body-level background)

## Acceptance Criteria
- [ ] Background gradient is visually perceptible in both themes without being distracting
- [ ] Gradient creates a sense of depth and warmth
- [ ] Background still feels soft and comfortable for extended use

## Estimated Complexity
Small

## Implementation Hints
- `apps/admin/src/index.css` — modify `--background-gradient-from` and `--background-gradient-to` CSS variables
- Consider switching from `linear-gradient` to `radial-gradient` for a more organic feel
- The gradient uses `background-attachment: fixed` which is correct
