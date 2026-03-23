# Full-Page AI Editor — ChatGPT-Style Experience

## Priority
P0

## Category
design-system | spacing | interaction

## Design Principle Violated
Visual Hierarchy, Spacing & Rhythm, Whitespace

## Description

The AI Editor is currently crammed into a narrow right-side flyout panel (~448px max-width) that it shares with the template picker via a tab toggle. This creates several critical UX problems visible in the screenshots:

1. **Suffocating width** — The chat area is ~380px usable width. Chat bubbles, suggestion cards, and the template preview card are all horizontally compressed, making the experience feel like texting on a feature phone rather than an AI-powered app builder.

2. **No room to breathe** — The empty state (icon + description + 4 suggestion cards) fills almost the entire flyout vertically, leaving no whitespace. There's no sense of space or invitation.

3. **Template preview is unreadable** — When a template is generated, the preview card showing datasources, screens, and connections is squeezed into the same narrow column. This is the most important moment (the AI just built your app!) and it gets zero visual celebration.

4. **Input bar feels like an afterthought** — A tiny text input docked at the bottom of a flyout, competing with the flyout's own close/cancel buttons.

5. **No conversation history visibility** — In a narrow flyout, even 3-4 messages push the context off-screen, making it hard to refine iteratively.

6. **Shared context with templates** — The tab toggle (Templates | AI Generate) implies these are equivalent options, but AI generation deserves its own dedicated space. Switching tabs loses AI chat state.

## Current State

The AI Editor lives inside `CreateProjectFlyout.tsx` as one of two tabs:
- Right-side flyout, `max-w-md` (~448px)
- Shares space with template selection via tab toggle
- Chat messages, suggestions, generation status, template preview, and input bar are all stacked vertically in this narrow column

![Current - Empty State](../../../ai-editor-empty-state.png)
![Current - Error State](../../../ai-editor-rate-limited.png)

## Proposed State — Full-Page ChatGPT-Style Layout

### Layout: Centered conversation with split preview

```
+------------------------------------------------------------------+
|  Orchestra          [Projects]  [AI Studio]          [theme] [?]  |
+------------------------------------------------------------------+
|                                                                    |
|                                                                    |
|              +------ max-w-2xl centered ------+                    |
|              |                                 |                    |
|              |   [gradient icon + sparkles]    |                    |
|              |                                 |                    |
|              |     What do you want to build?  |                    |
|              |                                 |                    |
|              |   +---------------------------+ |                    |
|              |   | A recipe app with...      | |                    |
|              |   +---------------------------+ |                    |
|              |   | A fitness tracker with...  | |                    |
|              |   +---------------------------+ |                    |
|              |   | A bookstore with...       | |                    |
|              |   +---------------------------+ |                    |
|              |   | A travel planner with...  | |                    |
|              |   +---------------------------+ |                    |
|              |                                 |                    |
|              +---------------------------------+                    |
|                                                                    |
|         +--------------------------------------------+             |
|         | Describe your app...                  [->] |             |
|         +--------------------------------------------+             |
|                    Powered by AI  |  Start from template            |
+------------------------------------------------------------------+
```

### After generation — Split view:

```
+------------------------------------------------------------------+
|  Orchestra          [Projects]  [AI Studio]          [theme] [?]  |
+------------------------------------------------------------------+
|                           |                                        |
|  Chat (scrollable)        |   App Preview (sticky)                 |
|                           |                                        |
|  [user] A recipe app...  |   +------------------------------+     |
|                           |   |  [icon] Recipe Master        |     |
|  [ai] I've generated     |   |  "Your personal cookbook"     |     |
|  Recipe Master...         |   |                              |     |
|                           |   |  3 datasources  5 screens    |     |
|                           |   |  4 connections               |     |
|                           |   |                              |     |
|                           |   |  DATA                        |     |
|                           |   |  - Recipes (8 fields)        |     |
|                           |   |  - Categories (3 fields)     |     |
|                           |   |                              |     |
|                           |   |  SCREENS                     |     |
|                           |   |  - Home          [list]      |     |
|                           |   |  - Recipe Detail  [detail]   |     |
|                           |   |  - Add Recipe     [form]     |     |
|                           |   |                              |     |
|                           |   |  [Create Project] [Refine]   |     |
|                           |   +------------------------------+     |
|                           |                                        |
|  +------------------------+                                        |
|  | Refine your app...  [->]                                        |
|  +------------------------+                                        |
+------------------------------------------------------------------+
```

### Key Design Decisions

1. **Dedicated route: `/ai`** — Not a flyout, not a modal. A full page at the top-level navigation, peer to "Projects". This signals AI generation is a first-class feature, not a secondary option.

2. **Centered empty state** — Large, generous layout inspired by ChatGPT/Claude. The suggestion cards become wider, more inviting. The input bar is prominent and centered.

3. **Split view on generation** — When a template is generated, the page splits: chat history on the left (continues the conversation), app preview on the right (sticky card with full details). This mirrors how Cursor/Copilot show code alongside chat.

4. **Streaming text visible** — With more width, we can show the AI's thinking/streaming text as it generates, giving the user confidence something is happening (similar to ChatGPT's streaming).

5. **Persistent conversation** — Full page means the chat history is always visible. Users can refine 5, 10, 20 times without losing context.

6. **Bottom-anchored input** — Like ChatGPT: a generous, rounded input bar anchored at the bottom of the viewport with the conversation scrolling above it.

7. **"Start from template" link** — Small text link below the input that takes you to the template picker, keeping the option available without polluting the AI experience.

### Visual Inspiration
- **ChatGPT** — Centered conversation, bottom input bar, clean empty state with suggestions
- **Claude.ai** — Generous whitespace, refined typography, artifact panel alongside chat
- **v0.dev** — AI generates UI, shows preview in split view alongside conversation
- **Vercel AI Playground** — Clean, focused AI interaction page

### Empty State Polish
- Larger gradient icon (w-16 h-16) with subtle animation (pulse or float)
- "What do you want to build?" as a hero heading (text-2xl)
- Suggestion cards in a 2x2 grid on desktop, single column on mobile
- Each suggestion card gets an icon + title + description (not just a text string)
- Subtle gradient background or pattern to distinguish from the rest of the app

### Input Bar Polish
- Larger input (h-12) with rounded-2xl
- Subtle shadow or border glow on focus
- Character count or "Enter to send" hint
- Model indicator badge (optional, like "Powered by Qwen")

## Affected Pages
- New page: `/ai` (AIStudioPage)
- Modified: App.tsx (add route)
- Modified: Top nav/header (add "AI Studio" link)
- Refactored: AIEditorChat.tsx (extract and redesign)
- Modified: CreateProjectFlyout.tsx (remove AI tab, simplify to templates only)
- Modified: ProjectsPage.tsx (optionally add "or generate with AI" CTA)

## Acceptance Criteria
- [ ] AI Editor is a full-page experience at `/ai` route
- [ ] Empty state is centered with generous whitespace, inspired by ChatGPT
- [ ] Suggestion cards are visually richer (icons, 2-column grid on desktop)
- [ ] Input bar is bottom-anchored, prominent, with focus glow
- [ ] After generation, layout splits into chat + preview panel
- [ ] Template preview card has full breathing room to display details
- [ ] Conversation history is always visible and scrollable
- [ ] Streaming text is visible during generation
- [ ] Navigation has "AI Studio" as a top-level item
- [ ] "Start from template" link available as alternative path
- [ ] CreateProjectFlyout simplified to templates-only
- [ ] Works well in both dark and light themes
- [ ] Responsive: stacks vertically on smaller viewports

## Estimated Complexity
Large

## Implementation Hints

### New files needed:
- `apps/admin/src/pages/AIStudioPage.tsx` — Full-page wrapper with layout
- Possibly `apps/admin/src/components/ai/` — Subfolder for AI-specific components

### Component breakdown:
1. `AIStudioPage` — Page shell with centered layout + bottom input
2. `AIEmptyState` — Hero empty state with suggestions grid
3. `AIConversation` — Message list (extracted from current AIEditorChat)
4. `AITemplatePreview` — Expanded template card for split view
5. `AIInputBar` — Redesigned bottom-anchored input

### CSS approach:
- Use `min-h-screen` and `flex flex-col` for full-page layout
- Input bar: `fixed bottom-0` or `sticky bottom-0`
- Split view: `grid grid-cols-1 lg:grid-cols-[1fr_420px]`
- Empty state centering: `flex items-center justify-center flex-1`

### Navigation:
- Add to the top header bar alongside "Orchestra" logo
- Could be a nav item like: `Orchestra | Projects | AI Studio`
- Or a prominent CTA button in the Projects page header
