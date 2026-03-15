# Orchestra AI — Architecture

## System Overview

Orchestra AI is a Server-Driven UI (SDUI) platform. An admin designs screen flows in a visual editor (React Flow), which produces a versioned JSON "Blueprint." A mobile client (Expo/React Native) interprets this JSON at runtime to render native screens.

## Design Decisions

### Color Palette
- **Primary:** Slate (Tailwind `slate-*`) — used for backgrounds, text, borders
- **Accent:** Indigo (`indigo-500` / `#6366f1`) — used for CTAs, active states, branding

### Component Pattern (Mobile)
Every UI component follows:
```
ComponentNode/
  index.tsx   — Logic (hooks, actions, context resolution)
  view.tsx    — Pure JSX (presentation only)
  types.ts    — Prop type definitions
```

### Condition Evaluation
Decision nodes use a safe expression parser (no `eval()`). Supports:
- Comparisons: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Boolean logic: `&&`, `||`
- Context path resolution: `context.user.age > 18`

### Secret Management
- API tokens are injected via the Capability Handshake (server → client), never hardcoded
- A `maskSecrets()` utility redacts tokens in log output

### Capability Handshake
On boot the mobile client sends `X-Client-Capabilities` and `X-App-Version` headers. The API prunes the flow JSON to match, ensuring unsupported nodes are never delivered.

## Monorepo Layout
```
/orchestra
├── apps/
│   ├── admin/       React + Vite + React Flow + Tailwind
│   ├── api/         Next.js API (Vercel-ready)
│   └── mobile/      Expo (React Native) + NativeWind
├── packages/
│   ├── shared/      Zod schemas, template engine, condition parser
│   └── database/    Prisma schema + client singleton
├── mcp-configs/     Playwright & Postgres MCP configs
└── docker-compose.yml
```
