# Design QA Report — Orchestra Admin

**Date:** 2026-03-23 (updated)
**Theme modes tested:** Dark, Light
**Pages audited:** 5 (Projects List, Dashboard, Flow Editor, Datasources, Preview) + AI Editor
**Screenshots taken:** 14 + 3 (AI Editor states)
**Interactions tested:** 4 (card hovers, button hovers, theme toggles, collection clicks)

## Overall Design Score
**5.5 / 10**

Orchestra has a solid functional foundation — the layout is clean, the card-based UI is sensible, and both themes work without breaking. But it feels like an **early prototype** rather than a product ready to sell. The biggest gap is **visual depth and polish** — everything feels flat, static, and developer-oriented. Compare side-by-side with Linear, Notion, or Vercel Dashboard and the gap becomes clear. The good news: most issues are CSS-level fixes, not architectural problems.

## Summary
- 10 design issues found (9 previous + 1 new P0)
- 6 areas audited in both themes
- 17 screenshots captured
- 4 interaction states tested (hover, click)

## Top Issues (by visual impact)

1. **AI Editor trapped in a flyout** (P0) — The AI-powered app generation feature — potentially Orchestra's most compelling capability — is squeezed into a ~380px sidebar flyout sharing space with template selection. This needs to be a full-page, ChatGPT-style experience. See [001-full-page-ai-editor.md](./tasks/not_started/001-full-page-ai-editor.md).

2. **Background gradient too subtle** (P1) — The entire app feels flat because the body gradient is imperceptible. This is the single biggest lever for making the app feel softer and more premium.

3. **Cards lack depth and hover feedback** (P1) — Project cards and dashboard cards feel like stickers stuck on a wall rather than interactive, elevated surfaces. No visible hover state on project cards at all.

4. **Raw project IDs visible** (P1) — CUID strings like `cmn0s59rl0005zx2clre86tl6` shown on cards and headers make the app feel like a developer debug view, not a product.

5. **Excessive empty space** (P1) — More than half the viewport is unused on the Projects and Dashboard pages, creating a sparse, unfinished feel.

## Page-by-Page Assessment

### AI Editor (via CreateProjectFlyout)
- **Dark:** The empty state looks decent in isolation — gradient sparkle icon, suggestion cards — but everything is compressed into ~380px. Chat bubbles have tiny text (13px). The template preview card (when generated) shows datasources/screens/connections in a cramped list. Error state shows a red alert box that works but has no room.
- **Light:** Not captured in current screenshots but same structural issues apply.
- **Core Problem:** This is a flyout pretending to be a chat app. The pattern needs to change from "sidebar tab" to "full-page dedicated experience."
- **Screenshots:** `ai-editor-empty-state.png`, `ai-editor-working.png`, `ai-editor-rate-limited.png`

### Projects List (`/`)
- **Dark:** Gradient background barely perceptible. Cards have nice colorful gradient headers but the card body area is flat. No hover feedback. Raw CUIDs visible below project names. Huge empty space below the 4 cards.
- **Light:** Soft blue-gray tint is slightly better than dark. Cards look cleaner with white backgrounds. Same issues with hover, IDs, and empty space.
- **Screenshots:** `projects-list-dark-clean.png`, `projects-list-light.png`, `projects-card-hover-dark.png`

### Project Dashboard (`/project/:id`)
- **Dark:** Stat cards are flat and uniform. Nav cards (Flow Editor, Datasources, etc.) have a very subtle hover (text color change only). API endpoint section at the bottom is a nice touch. Lots of empty space.
- **Light:** Cleaner but same flatness issues. Cards in light mode look decent with subtle borders.
- **Screenshots:** `dashboard-dark.png`, `dashboard-light.png`, `dashboard-card-hover-dark.png`

### Flow Editor (`/project/:id/flow`)
- **Dark:** Canvas area has no grid/dots pattern — feels like nodes floating on the page background. Side panel blends into the canvas. Nodes themselves look good with color-coded top borders.
- **Light:** Better visual separation due to white canvas on gray-ish background. React Flow controls visible. Same side-panel blending issue.
- **Screenshots:** `flow-editor-dark.png`, `flow-editor-light.png`

### Datasources (`/project/:id/datasources`)
- **Dark:** Sidebar collections list blends into main area. Table is functional but has no row hover. Active collection has a highlight but it's subtle. Column headers are well-styled with type icons.
- **Light:** Similar issues. The sidebar/content boundary is even less clear in light mode.
- **Screenshots:** `datasources-dark.png`, `datasources-table-dark.png`, `datasources-table-light.png`

### Live Preview (`/project/:id/preview`)
- **Dark:** Phone frame chrome looks decent. Screen sidebar is clean. The iframe shows "localhost refused to connect" — functional issue, not design (Expo server not running).
- **Light:** Same. The background around the phone frame is clean and appropriate.
- **Screenshots:** `preview-dark.png`, `preview-light.png`

## Issues by Category
| Category | P0 | P1 | P2 | P3 | Total |
|----------|----|----|----|----|-------|
| Color    | 0  | 1  | 0  | 0  | 1     |
| Spacing  | 1  | 1  | 1  | 0  | 3     |
| Interaction | 0 | 1 | 1 | 0 | 2    |
| Consistency | 0 | 1 | 0 | 0 | 1    |
| Design System | 1 | 0 | 2 | 0 | 3  |
| **Total** | **2** | **4** | **4** | **0** | **10** |

## Theme Comparison
- **Dark mode:** Functional but flat. The gradient is invisible. Cards blend into the dark background. Hover states are hard to notice. Needs more shadow/depth work.
- **Light mode:** Slightly better due to natural contrast between white cards and the blue-gray background. But still lacks visual warmth and depth.
- **Parity:** Both themes are roughly equal in polish level — neither feels significantly more refined than the other. Both need the same types of improvements.

## Passed Checks
- [x] Both themes render without visual bugs
- [x] Typography hierarchy is functional (headings vs body)
- [x] Primary color (violet/blue) used consistently for CTAs
- [x] Icons are consistently sized (lucide-react)
- [x] Flow editor nodes are well-designed with color coding
- [x] Datasource table is functional and readable
- [x] Phone frame in preview looks realistic
- [ ] ~~Background feels soft and comfortable~~ — too flat
- [ ] ~~Cards have visible depth/layering~~ — insufficient shadows
- [ ] ~~Hover states visible on all interactive elements~~ — missing on project cards
- [ ] ~~Empty states are designed~~ — preview error state is raw browser text
- [ ] ~~No developer-oriented text in main UI~~ — raw CUIDs visible
- [ ] ~~AI Editor feels premium and spacious~~ — squeezed into flyout

## Recommendations (Priority Order)

1. **Promote AI Editor to full page** — biggest structural change, biggest impact on perceived product value. See task 001.
2. **Fix the background gradient** — biggest single-change visual impact. Switch to radial gradient with more visible warmth.
3. **Add card hover effects and shadows** — make the app feel interactive and alive.
4. **Hide raw project IDs** — instant polish boost. Replace with meaningful metadata.
5. **Address empty space** — center content or constrain max-width.
6. **Add flow editor canvas grid** — React Flow `<Background />` component, one line change.
7. **Improve stat cards** — larger numbers, subtle color tints.
8. **Add table row hover** — simple CSS addition.
9. **Improve header presence** — more padding, backdrop blur, stronger brand mark.
10. **Separate datasource sidebar** — right border or shadow.
