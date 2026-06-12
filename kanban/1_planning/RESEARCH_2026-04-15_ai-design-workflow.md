# AI-Powered Web Design Workflow Research — 2026-04-15

> **Revision 2026-04-18:** Two changes landed today:
> 1. **Claude Design** launched 2026-04-17 (Anthropic Labs) — Google Stitch is **retired** from Phase 1 in favour of Claude Design's codebase-ingesting explore step. Full rationale in the [Claude Design section](#claude-design-anthropic-labs--new-2026-04-17) below.
> 2. **v0 paid tier dropped from baseline.** v0 restructured pricing (old $20 Pro tier is gone; entry paid tier is now $30/mo "Team"). Combined with Claude Design's handoff bundle reducing component-gen demand, the **lean path** starts on **v0 Free ($0)** and only upgrades to Team during active sprint weeks. **New baseline: $20/mo** (Gemini only), down from $40.
>
> **Revision 2026-04-19:** The recommendations above (Claude Design as lead, Stitch retired, v0 Free as baseline) have **not yet been empirically tested**. They are based on launch-day reviews, not hands-on A/B data. A **3-way head-to-head experiment** is planned on the FractionalBuddy commercial build — Claude Design vs v0 vs Google Stitch, each as the lead tool for identical pages — to either confirm or falsify this recommendation. See [PLAN_2026-04-18_ai-design-workflow-experiment.md](./PLAN_2026-04-18_ai-design-workflow-experiment.md). Results will be appended below as a "3-way experiment results" section once synthesis completes.

## Context

Research into the best tools and workflow for designing gwth.ai (a Next.js 16 + Tailwind v4 + shadcn/ui education platform), with a $50/month budget for design tools. Goal: find the optimal way to create high-quality designs and hand them off to Claude Code for implementation.

> **Companion file:** [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md) — 10 Claude Code skills/plugins/CLIs that fight AI slop. Includes Impeccable, awesome-design-md, 21st.dev Magic MCP, Taste Skill, and more. **Install these before doing any design work** — they improve every design-related prompt materially.

---

## Executive Summary

**Recommended stack — free skills layer + $40/month paid tools + Claude Design (no marginal cost on existing Claude Pro/Max):**

**Free layer (install first — permanent foundation):**

| Tool | Cost | Role |
|------|------|------|
| **Impeccable skill + CLI + Chrome ext** | Free | Universal quality filter — 18 commands (`/audit`, `/critique`, `/polish`, `/typeset`, etc.) fights AI slop |
| **awesome-design-md** | Free | 68 DESIGN.md files for popular brands (Linear, Notion, Supabase, Claude, etc.) — drop into project root |
| **Taste Skill** | Free | Premium aesthetic enforcement with 3 dials (variance/motion/density) |
| **21st.dev Magic MCP** | Free tier | Generate components inside Claude Code via `/ui <description>` — exact GWTH stack output |
| ~~**Google Stitch**~~ | ~~Free~~ | ~~Retired 2026-04-18 — superseded by Claude Design (interactive output + codebase ingestion).~~ |

**Bonus capability (no marginal cost — already on your Claude Pro/Max plan):**

| Tool | Cost | Role |
|------|------|------|
| **Claude Design** (claude.ai/design) | Included in Claude Pro+ | **Explore step:** ingests your repo's design tokens + components, produces interactive HTML prototypes and a "handoff bundle" Claude Code consumes natively. No API/MCP yet (Anthropic says "coming in weeks"). **Weekly quota is separate from chat/Code — brutal on Pro tier (~30-min lockout reported), fine on Max.** |

**Lean baseline ($20/month, trial v0 first):**

| Tool | Cost | Role |
|------|------|------|
| **v0 Free** | $0 | Component generation — $5 credits/mo, 7 msg/day. **Treat as the v0 trial.** Covers occasional component bursts. |
| **Gemini Advanced** | $20/mo | Design QA — analyze screenshots, compare to references, suggest improvements |
| ~~**v0 Team**~~ (escalation, not baseline) | ~~$30/mo~~ | Only upgrade during sprint weeks when you hit the 7-msg/day or $5-credit wall. Downgrade back to Free after sprint. |
| ~~**Mobbin Pro**~~ | ~~$8/mo~~ | ~~Dropped — annual commitment not justified for a single-project build.~~ |

> Full details on the free skills layer: [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md)

**The workflow: Claude Design (explore + handoff bundle) → 21st.dev Magic MCP + v0 Free (prototype shadcn TSX) → Claude Code + Impeccable/Taste (implement with taste) → Gemini (QA)**

**Escalation trigger:** Upgrade v0 Free → Team ($30) when you hit the daily/credit limit mid-build. Cancel when the sprint ends. Tracking rule: if you upgrade 3 months in a row, make Team the permanent baseline.

This replaces the old approach of designing entirely through written specs. Written specs (like the CLAUDE.md design system) remain the foundation, but Claude Design now ingests those specs automatically — the handoff is no longer a manual paste step.

---

## Tool-by-Tool Analysis

### Tier 1: Directly Useful for GWTH's Stack

#### Claude Design (Anthropic Labs) — NEW (2026-04-17)

**What it is:** A dedicated experimental product at `claude.ai/design`, powered by Claude Opus 4.7. A persistent design canvas — not a chat artifact — with design-system memory, web-capture, document upload, versioned iteration, and its own weekly quota. Pitched at non-designers (founders, PMs) who need to go prompt → visual artefact fast.

**What it generates:**
- Interactive HTML prototypes (hover states, theme toggles, reorderable sections rendered in-chat) — not static mockups
- Pitch decks, slides, one-pagers, wireframes, marketing collateral
- **Design systems extracted from your own codebase** — ingests `globals.css` OKLCH tokens, `hero-section.tsx` spirals, `components.json`, and auto-applies them
- Export formats: PDF, PPTX, zip, standalone HTML, shareable URL, **push-to-Canva**, and — the important one — a **Claude Code handoff bundle** (structured spec + brand tokens + component structure + copy variants + framework hints)

**What it does NOT do:**
- ❌ **No direct React/Tailwind/shadcn TSX output.** The handoff bundle is *instructions*, not code. Claude Code implements the bundle into your repo's conventions (this is actually a strength for a well-architected project like GWTH — the bundle respects your existing component module boundaries).
- ❌ **No public API / no MCP server at launch.** Anthropic has committed to "easier integrations in the coming weeks." Revisit early May 2026.
- ❌ **No Figma import** (Canva export only).
- ❌ **Not multiplayer** — single-seat conversational.

**Pricing / availability:**
- Available on **Claude Pro, Max, Team, Enterprise** (Enterprise off by default, admin-gated).
- **Not on Free.** Weekly quota is **separate** from chat and Claude Code quotas.
- ⚠️ **Quota is brutal on Pro.** Early reviews (PCWorld, X users) burned 58-80% of a Pro weekly allowance in a single 30-60 min session, locking them out for 5-6 days. **For weekly use, budget for Max (~$100/mo), not Pro.**

**Claude Code integration:**
- One-way handoff today: export bundle from Design → reference in Claude Code → Code implements.
- Pattern: `/design-handoff <bundle-name>.bundle` (Claude Code recognises the bundle schema natively)
- No reverse direction yet (Code → Design). If you want to iterate on a component, screenshot it and paste back into Design.

**Why it's the right "explore" tool for GWTH specifically:**
1. **Brand ingestion** — it reads `globals.css` OKLCH tokens, the 7-blade spiral colour spectrum, the Inter + JetBrains Mono font pairing. Output stays on-brand automatically.
2. **Codebase-aware** — it will reference existing components (`<CourseCard>`, `<LessonNav>`) rather than reinventing them.
3. **Interactive prototypes** — you can click through a lesson viewer mock before committing to TSX. Stitch couldn't do this.
4. **No context tax** — the handoff bundle replaces the "paste 20 screenshots + describe spacing" step I was recommending previously.

**Where it fits best in GWTH's build order:**
- Landing hero explorations (brand-heavy)
- Lesson viewer layout variants (the hardest page)
- Study-streak calendar & progress visualisations
- Pricing page and pitch materials

**Where it does NOT fit:**
- Component-level iteration (use v0 — faster, cheaper per iteration, emits code you can read and review)
- Tight precision work (reviewers note print/precision quality is weak)
- Anything you need to automate (no API yet)

**Verdict:** Use Claude Design as the *first* step, replacing Google Stitch entirely. Then hand off to v0 for component-level TSX generation, then to Claude Code for implementation. **Zero marginal cost if you're already on Claude Pro, but ration usage — treat it like ~2-3 "explore sessions" per week on Pro, or upgrade to Max if you want it as a daily driver.**

**Sources:**
- [TechCrunch launch coverage](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/)
- [VentureBeat: challenges Figma](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma)
- [The New Stack: deep dive](https://thenewstack.io/anthropic-claude-design-launch/)
- [The Register: hands-on review](https://www.theregister.com/2026/04/17/anthropic_debuts_claude_design/)
- [PCWorld: quota-lockout hands-on](https://www.pcworld.com/article/3117811/i-tried-claude-design-for-half-an-hour-im-already-locked-out-for-a-week.html)
- [vibecoding.app: `/design-handoff` workflow](https://vibecoding.app/blog/claude-design-review)
- [Testing Catalog: rollout details](https://www.testingcatalog.com/anthropic-launches-claude-design-ai-tool-for-paid-plans/)

---

#### 1. v0 by Vercel (v0.app) — RECOMMENDED (Free tier as baseline)

**What it does:** Generates production-ready React components from text prompts, screenshots, or Figma imports. Built by the creators of Next.js — outputs code in the exact GWTH stack (Next.js + React + TypeScript + Tailwind CSS + shadcn/ui).

**Pricing (checked 2026-04-18 — pricing restructured since earlier research):**
- **Free: $0** — $5 credits/month, 7 messages/day limit. Models: v0 Mini. **This IS the trial.**
- **Team: $30/user/month** — $30 credits + $2/day login bonus. Models: v0 Pro, v0 Max, v0 Max Fast.
- Business: $100/user/month
- Enterprise: custom

> ⚠️ The old $20 "Pro" tier is gone. Entry paid tier is now $30. This materially changed the cost-benefit calculus — see the "Lean path" section below.

**Quality:** Best-in-class for React/shadcn component generation. Generated code follows best practices, includes accessibility, responsive by default. February 2026 update added Git integration, VS Code-style editor, and agentic workflows.

**Export format:** React/Next.js + TypeScript + Tailwind + shadcn/ui — drops directly into the GWTH codebase.

**Best for:** Course cards, dashboard layouts, sidebar navigation, settings forms, pricing tables, lesson viewer tabs — anything component-level.

**Limitations:** Credit-based pricing burns fast on complex projects. No backend/database. Best for individual components, not full application architecture.

**Community sentiment:** Consistently rated the best tool for React/shadcn code generation. Figma import (analyzing visual layout AND design tokens) produces higher fidelity than screenshot input.

**v0 MCP Server (use from Claude Code):**
```bash
# Requires Premium plan ($20/mo). Get key from v0.dev/chat/settings/keys
claude mcp add v0 -- npx mcp-remote https://mcp.v0.dev --header "Authorization: Bearer YOUR_V0_API_KEY"
```
Exposes tools: create chats (generate components), send follow-ups (iterate), read generated files. Output quality identical to web UI — same models. The tradeoff: no visual preview via MCP (must run code locally to see it). Best used for batch generation of derivative components after establishing visual direction on v0.dev web UI.

**v0 CLI:** `npx v0 add <component-id>` downloads a v0-generated component into your project. It's a downloader, not a generator — you create on v0.dev first.

**Community MCP alternative (hellolucky/v0-mcp):** Adds `v0_generate_from_image` tool — pass a screenshot/wireframe, get React code back. Useful for Stitch → v0 pipeline.

**Optimal v0 workflow:** Use v0.dev web UI for visual exploration and initial design (this is where "doesn't look like AI" happens — through visual iteration). Use v0 MCP for batch generation of similar components once the visual direction is established. Claude Code integrates everything.

**Verdict (revised 2026-04-18): Start on Free, upgrade only if needed.** With Claude Design ingesting the codebase and producing handoff bundles, the demand for v0 component generation dropped. The Free tier ($5 credits, 7 msg/day) is now adequate for most weeks. Upgrade to Team ($30) only when you hit the wall during an active sprint, then downgrade. If you upgrade 3 months in a row, make Team permanent.

**Lean path decision tree:**

```
Is this component complex (quiz engine, streak calendar, search palette)?
  ├─ YES → v0 (burst a few Free msgs, or upgrade Team if locked out)
  └─ NO → 21st.dev Magic MCP (free) or Claude Code direct from design bundle
```

---

#### 2. Google Stitch (stitch.withgoogle.com) — ⚠️ SUPERSEDED 2026-04-18

> **Status:** Retired from the GWTH workflow in favour of Claude Design (launched 2026-04-17). Keep this section as reference for why it lost the "explore" slot.

**What it does:** AI design canvas that generates high-fidelity mockups from text prompts, sketches, images, or voice. Originally Galileo AI (acquired by Google mid-2025), relaunched as Stitch.

**Pricing:** FREE during Google Labs beta — 350 standard + 200 experimental generations/month.

**Quality:** Production-quality mockups with proper component hierarchy, spacing, and modern patterns. Stitch 2.0 (March 2026) added multi-screen generation (up to 5 interconnected screens), infinite canvas, voice input, context-aware design agents.

**Export format:** Figma export (with layers), HTML/CSS, Tailwind code, Vue, Angular, Flutter, SwiftUI.

**Why Claude Design won:**
- Claude Design ingests the GWTH codebase directly (OKLCH tokens, spiral SVGs, existing components). Stitch can't — it generates generic mockups.
- Claude Design produces **interactive** HTML prototypes. Stitch produces static mockups.
- Claude Design's handoff bundle is Claude Code-native. Stitch needs a screenshot-and-describe step.
- No marginal cost on existing Claude Pro/Max plan.

**When Stitch still wins:** If Claude Design is rate-limited and you need more explorations *this week* on a Pro plan, fall back to Stitch for free unlimited runs. Also still useful for Figma export if a designer is collaborating.

**Verdict:** Keep bookmarked as a fallback when Claude Design quota is exhausted. Not the primary tool.

---

#### 3. Gemini Advanced — RECOMMENDED

**What it does:** Google's multimodal AI. Analyzes screenshots, suggests design improvements, generates design specifications and tokens.

**Pricing:** $19.99/month (Google One AI Premium) — includes Gemini 2.0 Pro/Ultra, 2TB storage, Gemini in Workspace.

**What it's actually good at:**
- Analyzing screenshots of existing sites and extracting design patterns
- Comparing your implementation to a reference design and listing specific differences
- Generating design system documentation from visual references
- Multi-turn visual iteration ("make this more minimal", "increase whitespace")

**What it can't do:** Generate raster mockup images. It generates text descriptions, code, SVGs — not visual previews.

**Best for:** The "visual QA loop" — after Claude Code builds a page, screenshot it, paste into Gemini, ask "what needs improving?" This catches design issues you might miss.

**Verdict:** Worth $20/month as a design consultant and QA tool. Not a design tool itself.

---

#### 4. screenshot-to-code (Open Source)

**What it does:** Converts screenshots/mockups into HTML/Tailwind/React code. Supports Claude, GPT-4o, Gemini as backends.

**Pricing:** Free (self-hosted, uses your API keys). Hosted version available.

**Quality:** Gets 70-80% accuracy. Best when using Claude or GPT-4o as the AI backend.

**Best for:** Converting screenshots of education platforms you admire into Tailwind starting points for Claude Code to refine.

**Verdict:** Free companion tool. Screenshot a Dribbble design → get Tailwind code → refine with Claude Code.

---

#### 5. Magic Patterns (magicpatterns.com)

**What it does:** AI UI prototyping that generates React/Tailwind/TypeScript components. Y Combinator backed. Official Claude connector.

**Pricing:**
- Free: Basic generation
- Hobby: $19/month (unlimited generations)
- Pro: $75/month (team features)

**Quality:** Clean React/Tailwind/TypeScript exports. Real-time preview, Figma integration, multiplayer collaboration.

**Verdict:** Good alternative to v0 if you exhaust v0's credits. The Claude connector is a nice bonus. $19/month for unlimited generations.

---

#### 6. shadcn/ui Block Libraries (Various, mostly free)

Pre-built component collections for the exact GWTH stack:

- **Shadcnblocks** — 1,350+ blocks, multi-page templates, MCP Server integration for Claude/Cursor
- **shadcn Design Kit** — 2,000+ Figma components, Pro Blocks with code, Figma plugin that exports clean shadcn/ui + Next.js code
- **Magic UI** — 50+ animated React components (micro-interactions, motion effects)
- **Nexus-ui** — Composable copy-paste primitives

**Verdict:** Browse these for dashboard layouts, card patterns, sidebar designs. Many are free and directly pasteable.

---

### Tier 2: Useful But Not Essential

#### 7. Figma + Figma MCP

**What it does:** Industry-standard design tool. Figma MCP enables bidirectional Claude Code ↔ Figma sync (~30s per iteration).

**Pricing:** Professional: $15/editor/month.

**MCP workflow:**
1. `claude mcp add --transport http figma-remote-mcp https://mcp.figma.com/mcp`
2. Generate UI in Claude Code → push to Figma → edit in Figma → copy frame link → paste back to Claude Code → code updates to match

**Limitations:** MCP still has failure modes with annotated elements and inconsistent interpretation. Requires Figma Dev or Full seat.

**Verdict:** Worth $15/month if you want pixel-perfect design control. But Stitch + v0 + Claude Code can replace it for solo developers.

---

#### 8. Pencil.dev + Claude Code MCP

**What it does:** Free infinite design canvas with native MCP integration to Claude Code.

**Key advantage:** Unlike screenshots, MCP transfers structured metadata (spacing, typography, colors, component relationships). Design tokens flow directly into code — no information loss.

**Tools available:** `get_canvas_context`, `get_selected_frames`, `get_style_guide`, `export_frame_data`

**Caveat:** Launch Pencil first, then Claude Code (reversed order breaks MCP).

**Verdict:** Worth evaluating as a free alternative to Figma for the MCP design loop.

---

#### 9. Lovable (lovable.dev)

**What it does:** Full-stack AI app builder. Generates complete apps with frontend, backend, auth.

**Pricing:** Starter $20/month, Pro $25/month.

**Quality:** Most polished production-ready output among app builders. Better spacing and typography defaults than competitors.

**Why it's NOT recommended for GWTH:** Uses Vite + React (not Next.js), doesn't target shadcn/ui, Supabase-coupled architecture conflicts with GWTH's abstracted data layer. Generates its own app architecture.

**Best use:** Quick throwaway prototypes to test a visual direction. Screenshot the result, discard the code.

---

### Tier 3: Skip These

| Tool | Why Skip |
|------|----------|
| **Framer** | No React/Next.js code export. Locked ecosystem. Beautiful output but wrong architecture. |
| **Webflow** | Same — locked ecosystem, no code export. 44% price hike controversy. |
| **Bolt.new** | Generates own architecture, not components for existing project. Token consumption unpredictable. |
| **Relume** | $26+/month for wireframes only. Stitch does ideation better for free. |
| **Musho** | Requires Figma. No code export. $80/month Pro tier is expensive. |
| **Uizard** | Stitch does the same thing for free with better quality and actual code export. |
| **Midjourney** | Generates flat images, not structured designs. Can't export layers/code. |
| **Canva** | Websites are static posters — no interactivity, no code export. |
| **Penpot** | Good open-source Figma alternative but no AI features yet. |
| **TeleportHQ** | Steep learning curve. v0 does the same job better for this stack. |
| **Builder.io Visual Copilot** | Enterprise pricing, requires Figma input. Opaque costs. |
| **Cursor Design Mode** | Competing product to Claude Code, not complementary. |

---

## The Recommended Workflow

### Phase 1: Inspiration & References (1-2 hours, one-time)

1. Browse these for visual inspiration (ranked by quality for a real product build):
   - **[Mobbin](https://mobbin.com)** ($96/yr annual, ~$50-70 with promo code) — **BEST option**. Real shipped apps with full flows. Confirmed coverage: Duolingo, Khan Academy, Coursera, Udemy. Dedicated `/explore/web/app-categories/education` section. "Copy to Figma" plugin pastes screens as images.
   - **[Awwwards](https://awwwards.com)** (free) — Cutting-edge marketing sites and landing page animations
   - **[Land-book](https://land-book.com)** + **[Godly](https://godly.website)** (free) — Curated marketing/landing page galleries
   - **[SaaSLandingPage](https://saaslandingpage.com)** (free) — Pricing and features patterns
   - **[Interface Index](https://interfaceindex.com)** (free) — B2B/SaaS dashboard components
   - **[Marbleflows](https://marbleflows.com)** (free) — SaaS onboarding flow recordings
   - **[Page Flows](https://pageflows.com)** (~$99/yr) — Video recordings of real user flows
   - **[Behance](https://behance.net)** (free) — Deep case studies with process and rationale
   - Competitor sites (direct reference): Brilliant.org, Codecademy, Duolingo, MasterClass, Khan Academy, Uxcel
   - **Skip Dribbble** — concept art will mislead you on real product complexity

2. Screenshot 8-12 pages you like. Note what you like about each.

3. Optionally check Envato templates for layout patterns:
   - **eDemy** — Most mature Next.js education template (v2.2, July 2025)
   - **EduAll** — Comprehensive, lightweight, modern
   - **Educrat** — Professional LMS layout

### Phase 2: Design Exploration with Claude Design (20-40 min per page)

> **Updated 2026-04-18** — replaces Stitch. Fewer steps because Claude Design ingests the codebase automatically.

1. Open [claude.ai/design](https://claude.ai/design) (requires Claude Pro or Max).
2. **Seed it with GWTH's design system once per session** — paste or drag:
   - `src/app/globals.css` (the OKLCH token file)
   - `CLAUDE.md` (layout dimensions, design tokens, component catalogue)
   - 2-3 existing components for brand-voice context (e.g. `hero-section.tsx`, `course-card.tsx`)
   - Optionally: a web-capture of the current landing page at `http://192.168.178.50:3001`
3. Prompt per page — shorter than Stitch prompts because brand is already ingested:
   - "Design the student dashboard. Variations: A = minimal (whitespace-heavy), B = information-dense (stat tiles), C = narrative (greeting + single hero CTA + grid below). Keep OKLCH palette. Preserve spiral hero treatment."
4. Iterate interactively — click through the rendered HTML, request hover/theme-toggle variants
5. **Export the handoff bundle** (not just a screenshot). Save as `design/bundles/<page>-<version>.bundle`
6. ⚠️ **Ration usage on Pro plan** — expect ~2-3 full explore sessions per week before lockout. If lock-out hits mid-project, fall back to Stitch for that page.

### Phase 3: Component Prototyping — Lean path (10-30 min per component)

> **Updated 2026-04-18** — v0 is now a *burst* capability, not a primary step. Route components through the cheapest tool that does the job.

**Decision tree per component:**

```
Is it a standard shadcn pattern (card, nav, form, dialog)?
  ├─ YES → shadcn CLI (`npx shadcn add <component>`) + Claude Code adapts to design bundle
  │
Is it a derivative/variant of shadcn (stat tile, course card, badge set)?
  ├─ YES → 21st.dev Magic MCP (`/ui <description>` inside Claude Code) — free, in-terminal
  │
Is it complex or novel (quiz engine, search palette, streak calendar, notes panel)?
  └─ YES → v0 Free tier (burst 1-2 msgs from 7/day allowance)
           └─ If locked out or 3+ complex components in one day → upgrade v0 Team $30 for this month only
```

**When you do use v0:**
1. Take the Claude Design handoff bundle + your `globals.css` tokens and describe the component
2. Generate 2-3 variants, pick the best
3. Copy the generated code; Claude Code adapts it to GWTH's component module conventions

**Rationing v0 Free wisely:** 7 messages/day is genuinely tight during active build. Batch your "hard" component work into a single session per day, spread routine work across 21st.dev and shadcn CLI.

### Phase 4: Implementation with Claude Code

1. Feed Claude Code:
   - Design tokens from `globals.css` (already done — and now also ingested by Claude Design upstream)
   - Component specs from `CLAUDE.md` (already done)
   - **Claude Design handoff bundle** (`design/bundles/<page>.bundle`) — the primary visual input, replaces screenshot-dumping
   - v0 component code as starting points for shadcn-flavoured TSX scaffolds
2. Invoke with something like: `/design-handoff dashboard-v3.bundle — implement in src/app/(dashboard)/dashboard/page.tsx using our existing component module conventions`
3. Build one page at a time
4. Review each in the browser at http://192.168.178.50:3001

### Phase 5: Visual QA with Gemini (10 min per page)

1. Screenshot the implemented page
2. Paste into Gemini Advanced alongside the Stitch reference
3. Prompt: "Compare this implementation to the reference design. List specific differences in spacing, typography, color, alignment, and visual hierarchy that need fixing."
4. Feed Gemini's feedback back to Claude Code as specific instructions
5. Iterate 1-2 rounds until satisfied

### Phase 6: Round-Trip Screenshot Testing (automated)

1. After implementation, run Playwright screenshot tests
2. Feed captured screenshots back to Claude Code for visual verification
3. This catches layout issues, overlapping elements, and responsive problems before manual review

---

## Design Handoff Formats — What Works Best with Claude Code

### Ranked by Effectiveness

1. **Design tokens as CSS custom properties** (best) — GWTH already has this in `globals.css`
2. **Component specs with exact values** — GWTH already has this in `CLAUDE.md`
3. **Screenshots + written corrections** — "Here's a screenshot. Change X, Y, Z."
4. **v0-generated component code** — copy as a starting point, Claude Code adapts to project architecture
5. **HTML/CSS prototypes** — static HTML that shows layout structure
6. **Reference site screenshots + "match this style"** — good for general direction
7. **Figma MCP structured data** — bidirectional sync, ~30s per iteration
8. **Written descriptions only** — works if specific enough, fails if vague

### Token Efficiency Note

Screenshots cost ~1,334 tokens per 1000x1000px image. For small fixes, describe in words. Save screenshots for communicating direction shifts or when explaining is harder than showing.

### The "Structured Design Brief" Format

The most effective way to communicate a page design to Claude Code:

```markdown
## Page: Dashboard

### Layout
- Sidebar (280px) | Main content (flex-1, max-w-1400px, mx-auto)
- Header (64px height, sticky)
- Content area: 24px padding

### Components
1. **Course Cards** (3-column grid, 24px gap)
   - Thumbnail: 16:9, rounded-lg, object-cover
   - Title: text-lg font-semibold
   - Description: text-sm text-muted-foreground, line-clamp-2
   - Progress bar: h-2, rounded-full, primary color

### Reference screenshots
[attached: dashboard-stitch-v3.png]

### Design tokens
(reference globals.css custom properties)
```

---

## Education Platform Design Trends (2025-2026)

### Must-Have Patterns

1. **Dark mode as first-class citizen** — learners studying at night need it. Design both modes equally.
2. **Microlearning modules (5-10 min)** — outperform long lectures for retention and completion. Show estimated time badges on every lesson.
3. **Progress visibility within 5 seconds** — progress rings, completion badges, streak calendars must be immediately visible on the dashboard.
4. **"Continue where you left off"** as primary CTA — reduce "where was I?" friction.
5. **Card-based layouts** — work across all breakpoints, scannable, touch-friendly.
6. **Mobile-first** — ~70% of educational content is accessed on mobile.

### Visual Trends

7. **Dark glassmorphism** — frosted glass panels over gradient backgrounds. Semi-transparent surfaces with `backdrop-blur`. Ambient gradient "orbs" behind glass elements. GWTH's spiral blur layers already align with this trend.
8. **Consumer-grade UX** — learners compare LMS to Instagram/Spotify. If navigation is clunky or progress invisible, adoption suffers regardless of content quality.
9. **Interactive over passive** — quizzes embedded in video timelines, code playgrounds alongside lessons, interactive diagrams. The shift from video-lecture to interactive learning (Brilliant/Codecademy model).
10. **Gamification (subtle)** — streaks, badges, progress rings. Not childish — professional but motivating.

### Reference Platforms (Best Design)

| Platform | Design Strength | Takeaway for GWTH |
|----------|----------------|-------------------|
| **Brilliant.org** | Interactive explorations, clean minimal UI | Interactive learning > passive video |
| **Duolingo** | Gamification, streaks, snackable lessons | Study streak calendar, achievement toasts |
| **Codecademy** | Split-pane code editor, zero-friction UX | Lesson viewer with code playground |
| **MasterClass** | Cinematic, immersive video player | Premium feel for video content |
| **Khan Academy** | Pure focus on learning, skill trees | Clear progress tracking hierarchy |
| **Uxcel** | Beautiful design learning platform | Meta-inspiration — practices what it preaches |

---

## Cost Comparison Summary

> **Updated 2026-04-18** — assumes Claude Pro/Max is already paid for (you use Claude Code). Claude Design is a no-marginal-cost addition on that plan. v0's old $20 Pro tier no longer exists.

| Stack Option | Monthly Cost | What You Get |
|-------------|-------------|-------------|
| **Claude Design + v0 Free** | $0 + (Claude Pro/Max sunk) | Explore + component generation — very lean, may hit v0 free limits |
| **Claude Design + v0 Free + Gemini** ⭐ | **$20** + (Claude sunk) | **Recommended lean baseline** — adds QA, still fits inside $50 budget with room to spare |
| Claude Design + v0 Free + Gemini + Stitch (fallback) | $20 | Above + free unlimited explorations if Claude Design quota hits |
| Claude Design + v0 Team + Gemini (sprint mode) | $50 | Full-power month during heavy component generation — cancel Team when sprint ends |
| Claude Design + v0 Team + Gemini + Figma | $65 | Above + pixel-perfect control (over $50 budget) |
| Claude Max upgrade (if Claude Design daily driver) | +$80/mo on top | Unblocks Claude Design quota limits |

**Recommended for $50 budget: Claude Design (bundled) + v0 Free ($0) + Gemini Advanced ($20) = $20/month baseline.** When you hit v0 Free's 7-msg/day or $5-credit wall during a sprint, upgrade to Team ($30) for that month only, taking you to $50. This *is* the intended flex — Vercel's daily-msg limit effectively forces you into a sprint/steady-state cadence.

**Quota-stress scenario (separate dimension):** If Claude Design becomes a daily driver and Pro locks you out weekly, upgrade Claude Pro → Max (~$80/mo uplift). Evaluate after a few weeks — launch quotas may loosen.

**Annual cost projection (conservative):** 2-3 sprint months × $30 v0 Team + 12 × $20 Gemini = **$300-330/year** total paid tooling, down from $480/year on the old "always keep v0" plan. Savings: $150-180/year.

### Mobbin vs Dribbble for Inspiration

| Factor | Mobbin ($96/yr) | Dribbble (free) |
|--------|-----------------|----------------|
| Content type | Real shipped apps, full flows | Concept art, isolated shots |
| LMS coverage | Duolingo, Khan Academy, Coursera, Udemy | Concepts, no real data |
| Search | By UI pattern, element, flow | Tags only |
| Figma export | Yes (as images) | No |
| Risk | Free tier too thin to use | Concept art misleads on real complexity |

**Verdict:** Mobbin is the single best inspiration source for GWTH. Free tier is useless (15-min wall). Annual Pro with promo code (~$50-70/yr effective) is worth it for the lesson viewer design alone. Avoid monthly billing — Trustpilot complaints cluster there.

---

## Key Findings

> Updated 2026-04-18 after Claude Design launch.

1. **v0 is still best-in-class for shadcn TSX, but the Free tier suffices in the Claude Design era.** Claude Design's handoff bundle reduces v0 demand, and v0's old $20 Pro tier no longer exists — Team is $30. Trial v0 Free as the baseline; only upgrade to Team ($30) during heavy-generation sprint weeks. 21st.dev Magic MCP (free) covers routine components without burning v0 credits.

2. **Claude Design replaces Stitch as the "explore" step** — because it ingests your codebase (OKLCH tokens, existing components, spiral SVGs) and emits interactive HTML. Stitch generated generic mockups you then had to translate to GWTH brand.

3. **The Claude Design handoff bundle eliminates the screenshot-paste tax.** Previously you pasted mockup images + wrote spacing/typography descriptions into Claude Code. Now Claude Design emits a structured bundle Claude Code consumes natively. Fewer round-trips, less information loss.

4. **Full-stack builders (Lovable, Bolt) remain wrong for GWTH** — they generate their own architecture, conflicting with the existing project.

5. **No-code builders (Framer, Webflow) remain wrong** — locked ecosystems, no code export.

6. **GWTH's CLAUDE.md + `globals.css` are the optimal handoff inputs** — Claude Design ingests both automatically. Most projects trying to adopt Claude Design lack exactly this level of written design-system documentation; GWTH already has it.

7. **Gemini's niche holds** — still better than Claude Design for comparing an *implemented* screenshot against a reference design. Claude Design is explore/generate; Gemini is analyse/QA. They don't overlap.

8. **Figma MCP is now *less* relevant** — Claude Design + v0 + Claude Code covers what Figma MCP was bridging. Skip Figma unless a designer joins the team.

9. **The 2026-04-18 meta-workflow (lean version) is: Claude Design (explore + handoff bundle) → shadcn CLI / 21st.dev Magic MCP / v0 Free (component generation, cheapest tool first) → Claude Code (implement in codebase) → Gemini (visual QA).** Baseline cost: **$20/mo** (Gemini only). Upgrade v0 Free → Team ($30) only during heavy-generation sprint weeks.

10. **Claude Design's real constraint is quota, not capability.** The tool works well when you can use it; the bottleneck is the weekly lockout on Pro. Plan explore sessions in batches, not sprinkled across the week. Revisit Max upgrade in ~6 weeks after Anthropic tunes limits and ships the promised MCP.

11. **What to watch for (revisit early May 2026):**
    - Claude Design MCP server (Anthropic committed to "easier integrations in coming weeks")
    - Handoff bundle schema published (would let the Tier-1 skills layer consume bundles)
    - Figma import support (would enable reverse compatibility with existing design assets)
    - Quota adjustments on Pro tier (early reports may not reflect steady-state)
