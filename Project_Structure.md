Gemini said
This is the master Orchestra AI Design & Implementation Document. This document is formatted to be fed directly into Claude Code to provide it with the full architectural context, coding standards, and autonomous "Skills" required to build the system with minimal supervision.

PROJECT: ORCHESTRA AI
Goal: A Server-Driven UI (SDUI) Orchestrator where React Flow (Admin) maps to a dynamic React Native (Client) app experience.

1. System Architecture Overview
   The system follows a Producer-Consumer model via a versioned JSON "Blueprint."

The Brain (Admin): A React Flow-based web interface for designing application "graphs." Each node is a screen or a logical operation.

The Bridge (API): A Vercel-hosted Next.js backend providing versioned JSON payloads and state persistence.

The Body (Client): An Expo (React Native) "Dummy App" that interprets the JSON into high-performance native components.

2. Technical Stack & Modularity
   Claude, follow this stack strictly:

Monorepo Structure: Use Turborepo or a simple folder-based monorepo.

/apps/admin: React + Vite + React Flow + Tailwind.

/apps/mobile: Expo (React Native) + NativeWind (Tailwind) + @rnmapbox/maps.

/packages/shared: Zod Schemas + TypeScript types (The "Contract").

Backend: Next.js API routes on Vercel + Prisma (PostgreSQL).

State Management: Zustand for local client context.

Validation: Zod for runtime JSON validation.

3. The "Logical JSON" Specification
   Every flow returned by the server must adhere to this structure.

Component Structure
TypeScript
interface OrchestraNode {
id: string;
type: 'landing' | 'list' | 'form' | 'map' | 'photo_gallery';
props: Record<string, any>; // Component-specific data
actions: OrchestraAction[]; // Triggers for this node
}

interface OrchestraAction {
trigger: 'onLoad' | 'onPress' | 'onValueChange';
type: 'NAVIGATE' | 'SET_CONTEXT' | 'GET_GEO' | 'API_CALL';
payload: any;
}
Context & Data Injection
Components use a "Mustache" syntax {{context.key}} to reference the global state. The Client Engine must resolve these strings before rendering.

4. Claude Code: Instructions & Harness
   Claude, you are the Lead Engineer. Operate under these rules:

Modular Component Pattern: Every UI component in /apps/mobile/components/orchestra must be self-contained:

MapNode/index.tsx (Logic)

MapNode/view.tsx (JSX)

MapNode/types.ts (Prop definitions)

Capability Handshake: On boot, the Mobile app must send a capabilities object to the Backend (e.g., {"version": "1.0.0", "supported": ["mapbox", "camera"]}). The Backend must filter the JSON to match these capabilities.

Atomic Commits: Commit after finishing every individual Node type or Logic hook.

No-Question Policy: If a UI/UX decision is needed (e.g., "What color is the primary button?"), use a modern standard (Slate/Indigo palette) and document it in ARCHITECTURE.md. Only ask if a core business rule is missing.

5. Defined Skills for Self-Review
   Claude, execute these "Skills" before completing any task:

Skill: Registry_Validation
Check: Ensure the new component is added to componentRegistry.ts.

Check: Verify that the type string matches the Zod schema in /packages/shared.

Skill: State_Loop_Check
Check: When implementing an Action (like SET_CONTEXT), ensure it doesn't cause an infinite re-render loop in the SDUI Parser.

Skill: Mapbox_Sanity
Check: Ensure Mapbox tokens are handled via .env and that the OrchestraMap node handles "Permission Denied" states gracefully.

6. Implementation Roadmap
   Phase 1: The Shared Contract
   Setup packages/shared with Zod schemas for the "Logical JSON."

Define OrchestraNode and OrchestraAction types.

Phase 2: The Client Engine (Interpreter)
Build the useOrchestra hook in Expo.

Create the NodeRenderer (The recursive component that maps JSON to Native views).

Implement the State Store (Zustand) for pre-populating fields.

Phase 3: The Admin (Orchestrator)
Implement React Flow in the web app.

Create sidebars to edit props and actions for each node.

Add a "Deploy" button that pushes the JSON to the Vercel DB.

Phase 4: Integration
Mapbox integration for geolocalization.

Logic for "Decision Nodes" (If field X is empty, go to Node Y).

7. Logic Example for Claude
   Use this logic for the "Decision" nodes:

P→Q
Where P is a condition defined in JSON (e.g., context.user_age > 18) and Q is the navigation target. The parser must evaluate this logic locally on the device using a safe-eval or a simple logic parser.

Ready to Start
Claude, please initialize the monorepo structure and create the shared types package as the first step. Do not wait for further instructions; proceed through Phase 1 and Phase 2.

ORCHESTRA AI: AUTOMATION & INFRASTRUCTURE

1. MCP (Model Context Protocol) Integration
   To allow Claude to perform autonomous quality assurance, the following MCP servers must be active:

Playwright MCP: Used by Claude to boot the Admin UI (React Flow) and verify that nodes can be dragged, dropped, and that the resulting JSON matches the Zod Schema.

Task: Claude must write and run a smoke-test.spec.ts after every major Admin update.

Filesystem/Shell MCP: To allow Claude to manage the Docker lifecycle and inspect logs.

Postgres MCP: To allow Claude to inspect the database directly to verify that JSON "Blueprints" are being saved correctly with the right versioning.

2. Dockerized Environment (Admin & Backend)
   The Admin and Backend must be containerized to ensure Claude is developing in a reproducible environment.

docker-compose.yml Requirements:

Service: orchestra-admin: React/Vercel-like environment.

Service: orchestra-db: PostgreSQL 15+.

Service: orchestra-api: Next.js server.

Network: All services must share a bridge network so Claude can run Playwright tests against http://orchestra-admin:3000.

3. Secrets & API Key Management
   For Mapbox and other integrations, we use a Layered Injection strategy:

Development: Claude should look for a .env.example and create a .env.local.

Injection: \* Mapbox: The API Key must be passed from the Backend to the Client via the initial "Handshake" JSON.

Security: Claude must implement a "Secret Masking" utility in the logs so API keys are never leaked into the chat history/logs.

4. Enhanced Claude "Self-Iteration" Logic
   Copy this into the Claude Code harness to enable "Looping Feedback":

Instruction: The Iteration Loop
Implement: Write the code for a new feature (e.g., a "Photo Gallery" node).

Docker Check: Ensure docker-compose up still builds successfully.

Verify (Playwright): > \* Start the Playwright MCP.

Navigate to the Admin UI.

Programmatically create a "Photo Gallery" node.

Click "Export JSON" and verify the output schema against the Zod definition.

Review: If the test fails, analyze the console logs via the Shell MCP and fix the code. Repeat until the test passes.

5. Technical Design: The "Capability Handshake"
   This is the logic Claude must use to ensure the "Dummy App" stays dummy but functional.

Client Request: GET /flow/latest (Headers: X-Client-Capabilities: ["maps", "biometrics", "camera"], X-App-Version: 1.2.0).

Backend Logic:

Fetch the Flow graph from Postgres.

Pruning: Remove any nodes/edges that require "biometrics" if the client doesn't support it.

Mapping: If the client version is < 1.1.0, map the ModernMap node to LegacyMap node.

Client Response: A cleaned, optimized JSON payload tailored exactly to that specific device.

6. Project Directory Structure (Monorepo)
   Plaintext
   /orchestra-ai
   ├── /apps
   │ ├── admin/ # React Flow + Dockerfile
   │ └── mobile/ # Expo + NativeWind
   ├── /packages
   │ ├── shared/ # Zod Schemas + Playwright Helpers
   │ └── database/ # Prisma Schema + Migrations
   ├── /mcp-configs/ # Configuration for Playwright/Postgres servers
   ├── docker-compose.yml
   └── .env.example
   Final High-Value Step for Claude
   Claude, your first task is to set up the docker-compose.yml and the shared package. Once the environment is up, use the Playwright MCP to verify you can reach the Admin landing page before writing any SDUI logic.
