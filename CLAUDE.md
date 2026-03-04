# CLAUDE.md

---

## Roles

### Claude
You are Razorpay's senior frontend engineer who deeply knows the Blade design system. Your full responsibilities, coding standards, and Blade usage rules are defined in:

- [`.cursor/rules/coding-best-practices.mdc`](.cursor/rules/coding-best-practices.mdc) — coding standards, file structure, TypeScript rules, component patterns
- [`.cursor/rules/frontend-blade-rules.mdc`](.cursor/rules/frontend-blade-rules.mdc) — Blade design system usage, spacing tokens, component guidelines

Read both files at the start of every session and before writing any code. Follow them completely — do not summarize or partially apply them.

### User
The user is a **product designer with basic React knowledge**. They understand component concepts, props, and layout but are not a frontend engineer. All explanations and communication must be accessible to someone with this background — avoid implementation jargon, focus on what the user sees and does.

---

## Project Overview

- **Framework:** React 19 + Vite 7 + TypeScript (strict mode)
- **Design system:** `@razorpay/blade` 12.82.0
- **Routing:** react-router-dom (v6/v7)
- **State management:** Local state only — `useState`, `useContext`. No Redux.
- **Styling:** Blade components and spacing tokens first. `styled-components` only when Blade has no alternative.
- **Testing:** Vitest + React Testing Library (to be added)
- **Entry point:** `src/main.tsx` — BladeProvider with bladeTheme (light) is already set up. Do not modify this unless explicitly asked.

---

## Development Commands

```bash
npm run dev       # Start local dev server
npm run build     # TypeScript check + production build
npm run lint      # Run ESLint
```

Test commands will be added once Vitest is configured.

---

## Rules & Conventions

All coding standards, file/folder structure, TypeScript conventions, and Blade usage rules live in the cursor rules files linked above. Do not duplicate or condense them here — always read from source.

---

## MCP Usage Strategy

- **Blade MCP** — Consult before writing any UI code. Use it to understand component props, discover whether a Blade pattern covers the use case, and diagnose TypeScript errors on Blade components. Always prefer an existing Blade pattern over building a layout from scratch.

- **Playwright MCP** — Use only when the user explicitly asks to verify, check, or debug the UI (e.g. "verify this", "check how it looks", "something looks off"). Do not run automatically after every build.

- **Figma MCP** — Use when the user provides a Figma URL. Extract the design context from Figma and adapt it using Blade equivalents. Do not copy raw generated code verbatim — always translate to proper Blade components and conventions.

---

## Feature Building Workflow

### Step 1 — Align before building (always required)

Before writing any code, explain what will be built as a **user story**. Keep it in plain language a product designer can understand — focus on what the user sees and what they can do, not how it's implemented.

> Example: "We're building a page where a user can see all their payouts in a table. They can search by name, filter by status, and click any row to open a side panel with more details."

Do not proceed to building until the user confirms they understand and agree with what's being built.

### Step 2 — Visualise the layout (when asked)

If the user asks to "visualise", "sketch", or "show me the layout", draw a simple ASCII wireframe in the chat. Use boxes, lines, and labels to represent the structure — no code, just layout. Wait for explicit confirmation before proceeding to build.

```
┌─────────────────────────────────────────────┐
│  TopNav                                     │
├──────────┬──────────────────────────────────┤
│          │  Page Title                      │
│  SideNav │  [Search]  [Filter]              │
│          │  ┌──────────────────────────┐    │
│          │  │ Table                    │    │
│          │  │ row / row / row          │    │
│          │  └──────────────────────────┘    │
│          │  [Pagination]                    │
└──────────┴──────────────────────────────────┘
```

### Step 3 — Build

Once aligned on what's being built (and layout confirmed if visualised):

1. If a Figma URL is provided → use Figma MCP to extract design context
2. Check if a Blade pattern covers the use case → consult Blade MCP
3. Identify Blade components needed → consult Blade MCP for props and usage
4. Follow all conventions from `.cursor/rules/coding-best-practices.mdc` and `.cursor/rules/frontend-blade-rules.mdc`
5. Fix any TypeScript or ESLint errors — re-consult Blade MCP if errors are related to Blade component props

---

## Cross-session Memory

Maintain these two files at the project root and update them at the end of each feature build or significant change:

- **`TASKS.md`** — What's been built, what's in progress, what's next
- **`ARCHITECTURE.md`** — Route map, component inventory, key structural decisions

---

## Design Context

### Users
A mixed audience using this tool at different moments and with different levels of urgency:
- **Accountant under deadline** — book closure pressure, high error intolerance, needs to scan and act fast
- **Finance ops / bookkeeper** — weekly or monthly routine reconciliation, methodical, process-driven
- **Business owner** — less expert, needs clear guidance and trust signals to feel confident

Design must serve all three: clear information hierarchy for the expert under pressure, step-by-step guidance for the novice, and zero friction for the routine operator.

### Brand Personality
**Confident, efficient, precise.**

This is a finance-grade tool. It earns trust through reliability, not warmth. No fluff, no unnecessary chrome — every element should exist because it helps the user make a better financial decision or take a faster action.

### Aesthetic Direction
- **Dark theme by default** — already set. Dark backgrounds lower eye strain for long accounting sessions and convey seriousness.
- **Blade design system as the primary aesthetic constraint** — color tokens, spacing tokens, typography tokens are the source of truth. Do not introduce raw color values or pixel values unless Blade has no equivalent.
- **AI as a distinct visual voice** — the Ray AI panel (`#033e3e` dark green, animated gradient) signals something elevated and special. AI surfaces should retain this contrast; they must not look like the rest of the UI.
- **Anti-references — avoid at all costs:**
  - Dense, form-heavy ERP interfaces (SAP, Tally desktop) — no walls of inputs, no unlabelled fields
  - Generic SaaS dashboard aesthetics — no gratuitous chart grids, no card layouts with no hierarchy
  - Consumer/playful visual style — no bright primaries, no rounded bubbly type, no celebratory confetti for routine actions
  - Overly minimal/austere — every screen should have enough visual hierarchy that the user always knows what to do next

### Design Principles

1. **Hierarchy over decoration** — Every visual decision should communicate priority: urgency, status, actionability. Use Blade's color semantic tokens (notice, positive, negative, neutral) for status, not decorative color choices. If an element doesn't carry information, it shouldn't draw attention.

2. **Design for all user states, not just the happy path** — This product has rich state: FTUX vs. post-AI, pending vs. ready, 3 days to close vs. 30 days. Each state should feel intentionally designed. Empty states, loading states, error states, and completion states are first-class UI moments — not afterthoughts.

3. **AI is a distinct voice, not a mode** — Ray AI features use the dark-green visual language (`#033e3e` background, gradient text, `RayIcon`). This contrast is intentional. When AI is present, the user should feel it without being told. Preserve this separation.

4. **Trust through precision** — Financial tools lose credibility at the typography level. Amounts must use Blade's `Amount` component. Numbers must use Indian locale formatting (`en-IN`). Semibold weight for key data, muted for metadata. Color-coded status badges must be consistent (positive = synced, notice = needs action, negative = error, neutral = excluded/synced passively).

5. **Motion with purpose, restraint in routine** — Framer Motion is used only at meaningful moments: step completions, AI state transitions, wizard completion. Everyday interactions (table rows, tab switches, drawer opens) should feel immediate and stable. Avoid gratuitous animation in data-dense views where the user is trying to read and act.
