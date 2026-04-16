# AI-Powered Web Design Workflow Research — 2026-04-15

## Context

Research into the best tools and workflow for designing gwth.ai (a Next.js 16 + Tailwind v4 + shadcn/ui education platform), with a $50/month budget for design tools. Goal: find the optimal way to create high-quality designs and hand them off to Claude Code for implementation.

> **Companion file:** [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md) — 10 Claude Code skills/plugins/CLIs that fight AI slop. Includes Impeccable, awesome-design-md, 21st.dev Magic MCP, Taste Skill, and more. **Install these before doing any design work** — they improve every design-related prompt materially.

---

## Executive Summary

**Recommended stack — free skills layer + $48/month paid tools:**

**Free layer (install first — permanent foundation):**

| Tool | Cost | Role |
|------|------|------|
| **Impeccable skill + CLI + Chrome ext** | Free | Universal quality filter — 18 commands (`/audit`, `/critique`, `/polish`, `/typeset`, etc.) fights AI slop |
| **awesome-design-md** | Free | 68 DESIGN.md files for popular brands (Linear, Notion, Supabase, Claude, etc.) — drop into project root |
| **Taste Skill** | Free | Premium aesthetic enforcement with 3 dials (variance/motion/density) |
| **21st.dev Magic MCP** | Free tier | Generate components inside Claude Code via `/ui <description>` — exact GWTH stack output |
| **Google Stitch** | Free | Design exploration — generate high-fidelity mockups from prompts |

**Paid layer (inspiration + generation + QA):**

| Tool | Cost | Role |
|------|------|------|
| **Mobbin Pro (annual)** | $8/mo | Real shipped LMS flows (Duolingo, Khan Academy, Coursera references) |
| **v0 by Vercel (Pro)** | $20/mo | Component generation (or swap to 21st.dev Pro if MCP integration wins) |
| **Gemini Advanced** | $20/mo | Design QA — analyze screenshots, compare to references, suggest improvements |

> Full details on the free skills layer: [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md)

**The workflow: Stitch (explore) → v0 or 21st.dev (prototype) → Claude Code + Impeccable/Taste (implement with taste) → Gemini (QA)**

This replaces the old approach of designing entirely through written specs. Written specs (like the CLAUDE.md design system) remain the foundation, but visual tools now fill the gap between "idea" and "implemented UI."

---

## Tool-by-Tool Analysis

### Tier 1: Directly Useful for GWTH's Stack

#### 1. v0 by Vercel (v0.app) — RECOMMENDED

**What it does:** Generates production-ready React components from text prompts, screenshots, or Figma imports. Built by the creators of Next.js — outputs code in the exact GWTH stack (Next.js + React + TypeScript + Tailwind CSS + shadcn/ui).

**Pricing:**
- Free: $5/month credits, v0-1.5-md model
- **Pro: $20/month** — $20 credits, v0-1.5-lg (higher quality), Figma import, API access
- Team: $30/user/month

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

**Verdict:** The single most valuable design tool for GWTH. $20/month is worth it.

---

#### 2. Google Stitch (stitch.withgoogle.com) — RECOMMENDED

**What it does:** AI design canvas that generates high-fidelity mockups from text prompts, sketches, images, or voice. Originally Galileo AI (acquired by Google mid-2025), relaunched as Stitch.

**Pricing:** FREE during Google Labs beta — 350 standard + 200 experimental generations/month.

**Quality:** Production-quality mockups with proper component hierarchy, spacing, and modern patterns. Stitch 2.0 (March 2026) added multi-screen generation (up to 5 interconnected screens), infinite canvas, voice input, context-aware design agents.

**Export format:** Figma export (with layers), HTML/CSS, Tailwind code, Vue, Angular, Flutter, SwiftUI. The Tailwind export is directly useful.

**Best for:** Generating 3-5 design variations for each page (dashboard, lesson viewer, course detail). Multi-screen mode can mock up entire user flows.

**Limitations:** Generated code is a starting point, not production-ready like v0. Best at "0-to-1 ideation" — use v0 or Claude Code for "1-to-100 refinement."

**Community impact:** "Sent shockwaves through the design industry" — Figma shares dropped 8.8% the morning after Stitch 2.0 launched.

**Verdict:** Free and excellent. Use as the first step before v0 or Claude Code.

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

### Phase 2: Design Exploration with Stitch (30-60 min per page)

1. Open [stitch.withgoogle.com](https://stitch.withgoogle.com)
2. For each major page, prompt Stitch with your requirements:
   - "Design a student dashboard for an AI learning platform. Show course progress cards with circular progress indicators, a GitHub-style study streak calendar, recent activity feed, and bookmarked lessons. Use an aqua/teal color palette with dark mode support. Collapsible sidebar on the left."
3. Generate 3-5 variations per page
4. Use multi-screen mode for flows (dashboard → course → lesson)
5. Export the best designs as screenshots and/or Tailwind code

### Phase 3: Component Prototyping with v0 (30 min per component)

1. Take the best Stitch designs and feed them into v0 via screenshot or description
2. Prompt v0 for specific components:
   - "A course card component using shadcn/ui Card with Next.js Image thumbnail (16:9), semibold title, muted description with line-clamp-2, a circular progress ring, and a bookmark toggle button. Tailwind CSS, dark mode support."
3. Generate 2-3 variants, pick the best
4. Copy the generated code as a reference for Claude Code

### Phase 4: Implementation with Claude Code

1. Feed Claude Code:
   - Design tokens from `globals.css` (already done)
   - Component specs from `CLAUDE.md` (already done)
   - Screenshots from Stitch as visual references
   - v0 component code as starting points
2. Build one page at a time
3. Review each in the browser at http://192.168.178.50:3001

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

| Stack Option | Monthly Cost | What You Get |
|-------------|-------------|-------------|
| **Stitch + v0 Pro** | $20 | Design exploration + component code generation |
| **Stitch + v0 Pro + Gemini** | $40 | Above + design QA and analysis |
| **Stitch + v0 Pro + Gemini + Mobbin** | $48 | Above + real shipped LMS app references ($96/yr ÷ 12) |
| **Stitch + v0 Pro + Gemini + Magic Patterns** | $59 | Above + unlimited component generation |
| **Stitch + v0 Pro + Figma** | $35 | Above + pixel-perfect design control |
| **Stitch + v0 Pro + Gemini + Figma** | $55 | The full stack (slightly over budget) |

**Recommended for $50 budget: Stitch (free) + v0 Pro ($20) + Gemini Advanced ($20) + Mobbin Pro ($8/mo annual) = $48/month** with $2 to spare. Use a Mobbin promo code (20% off via Secret, 50% off via Freelance Stack) to bring it down further.

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

1. **v0 is the only tool that outputs directly in the GWTH stack** (Next.js + Tailwind + shadcn/ui). Nothing else comes close.

2. **Google Stitch is the best free design tool** — replaced Galileo AI, generates production-quality mockups with Tailwind export.

3. **Full-stack builders (Lovable, Bolt) are wrong for GWTH** — they generate their own architecture, conflicting with the existing project.

4. **No-code builders (Framer, Webflow) are also wrong** — locked ecosystems, no code export.

5. **GWTH's CLAUDE.md is already the optimal design handoff format** — documented OKLCH tokens, layout dimensions, component specs. Most teams struggling with AI design handoff lack exactly this.

6. **The Gemini advantage is real but narrow** — it's better at analyzing visual designs and suggesting improvements, not at generating them. Use it as a QA tool, not a design tool.

7. **Figma MCP is the most seamless handoff** but costs $15/month and adds complexity. For a solo developer, Stitch + v0 screenshots + Claude Code is simpler and almost as effective.

8. **The 2026 meta-workflow is: Stitch (explore) → v0 (generate components) → Claude Code (implement in codebase) → Gemini (visual QA).** This is what productive developers are doing.
