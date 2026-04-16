# Claude Code Frontend Design Skills & Tools — 2026-04-16

## Context

Based on the YouTube video "Top 10 Claude Code Frontend Design Skills, Plugins, & CLIs". Researched all 10 tools to evaluate which are worth adding to the GWTH v2 workflow. The unifying theme of these tools: combat "AI slop" design (purple gradients, Inter font for everything, identical bento card layouts) that Claude Code produces by default.

---

## The 10 Tools (Ranked by Relevance for GWTH)

### TIER 1 — Install Now

#### 1. Impeccable (pbakaus/impeccable) — **RECOMMENDED**

**GitHub:** https://github.com/pbakaus/impeccable
**Site:** https://impeccable.style
**Author:** Paul Bakaus (creator of jQuery UI, ex-Google DevRel on AMP)
**Stars:** 19,949 (Apr 2026) — 5 months old
**License:** Apache 2.0 (free, open source)

A full design-quality skill system with **1 skill + 18 commands + 7 domain reference files** (typography, color/contrast, spatial, motion, interaction, responsive, UX writing). Teaches LLMs what AI slop **looks like** via concrete anti-patterns rather than vague guidance.

**The 18 commands:**

| Command | Purpose |
|---------|---------|
| `/impeccable teach` | One-time setup — gather design context, save to `.impeccable.md` |
| `/impeccable craft` | Full shape-then-build flow with visual iteration |
| `/impeccable extract` | Pull reusable components/tokens into design system |
| `/audit` | Technical checks (a11y, performance, responsive) — no edits |
| `/critique` | UX design review (hierarchy, clarity, emotional resonance) |
| `/polish` | Final pre-ship pass + design-system alignment |
| `/distill` | Strip to essence |
| `/clarify` | Improve unclear UX copy |
| `/optimize` | Performance improvements |
| `/harden` | Error handling, onboarding, i18n, edge cases |
| `/animate` | Add purposeful motion |
| `/colorize` | Introduce strategic color |
| `/bolder` | Amplify boring designs |
| `/quieter` | Tone down overly bold designs |
| `/delight` | Add moments of joy |
| `/adapt` | Adapt for different devices |
| `/typeset` | Fix font choices, hierarchy, sizing |
| `/layout` | Fix layout, spacing, visual rhythm |
| `/overdrive` | Add technically extraordinary effects |

Commands can be chained: `/audit /normalize /polish blog`

**Ships 3 products in one repo:**
- **The skill** (for Claude Code, Cursor, Gemini CLI, Codex, VS Code Copilot, etc.)
- **Standalone CLI** — `npx impeccable detect <url|dir|file>` catches 24 quality issues without needing an AI agent
- **Chrome extension** — highlights AI slop directly on any live webpage via DevTools overlay ([Chrome Web Store](https://chromewebstore.google.com/detail/impeccable/bdkgmiklpdmaojlpflclinlofgjfpabf))

**Install (Claude Code, global):**
```bash
git clone https://github.com/pbakaus/impeccable
cp -r impeccable/dist/claude-code/.claude/* ~/.claude/
```

**Credentials:** Endorsed by the official `@claude_code` X account. Author is a recognized figure (jQuery UI creator).

**Why for GWTH:** Addresses Claude Code's #1 design weakness. The `/audit`, `/critique`, `/polish` flow becomes the "before you ship" pipeline for every page. The Chrome extension doubles as a QA tool on the deployed site.

---

#### 2. VoltAgent/awesome-design-md — **RECOMMENDED**

**GitHub:** https://github.com/VoltAgent/awesome-design-md
**Stars:** 56,283 (Apr 2026) — ~2 weeks old, viral
**License:** MIT

Curated collection of **68 DESIGN.md files** covering major brands: Airbnb, Apple, Claude, Linear, Vercel, Stripe, Notion, Framer, Figma, Supabase, Tesla, Spotify, ElevenLabs, Mistral, Cohere, Replicate, Sanity, Sentry, and ~50 more. DESIGN.md is Google Stitch's concept — a markdown file that AI coding agents read to generate consistent UI.

**Each DESIGN.md has 9 sections:**
1. Visual Theme & Atmosphere
2. Color Palette & Roles (semantic + hex + functional)
3. Typography Rules (full hierarchy table)
4. Component Stylings (buttons, cards, inputs, nav + states)
5. Layout Principles (spacing scale, grid, whitespace)
6. Depth & Elevation (shadow system)
7. Do's and Don'ts (anti-patterns)
8. Responsive Behavior (breakpoints, touch targets)
9. Agent Prompt Guide (ready-to-use prompts)

Each site folder also ships `preview.html` and `preview-dark.html` for visual validation.

**Install:** None. Just download the markdown files. Drop into your project root, tell Claude Code to follow it.

**Why for GWTH:** Want the Linear dashboard aesthetic? Copy `linear.app/DESIGN.md` into the project and tell Claude Code to follow it. Want the premium Apple feel? Copy `apple/DESIGN.md`. Zero cost, zero setup, directly usable. For education-adjacent inspiration the Notion, Linear, Supabase, and Claude DESIGN.md files are most relevant.

---

#### 3. 21st.dev Magic MCP — **RECOMMENDED**

**Website:** https://21st.dev
**MCP Repo:** https://github.com/21st-dev/magic-mcp (4.7k stars)
**Pricing:** Free (100 credits/mo) | Pro $20/mo (400 credits) | Max $100/mo

A community component registry (thousands of components) + AI generator delivered as an **MCP server that plugs directly into Claude Code**. Tagline: "v0 but inside your IDE."

**Component counts:**
- 284 hero sections, 426 animated components, 130 buttons, 79 cards, 17 pricing sections
- **90 3D backgrounds, 87 shaders, Spline scene wrappers** — the differentiator vs plain shadcn

**Output stack:** React + TypeScript + Tailwind + shadcn/ui + Next.js SSR-ready. **Exact GWTH stack.**

**Install (Claude Code):**
```bash
claude mcp add magic --scope user --env API_KEY="<key>" -- npx -y @21st-dev/magic@latest
```
Get API key at https://21st.dev/magic/console.

**Usage in Claude Code:** Type `/ui <description>` or `/21 <description>`. It generates variations, writes component files directly into your project, and Claude wires up imports.

**Two workflows:**
1. **Magic MCP** — natural-language generation (`/ui animated pricing section`)
2. **Copy Prompt** — browse 21st.dev registry, find a component, click "Copy Prompt" (AI-targeted prompt with embedded source + integration instructions), paste into Claude Code

**Why for GWTH:** Only tool here with first-class Claude Code MCP support. The registry is the deepest pool of shadcn-compatible components (3D backgrounds, shaders, scroll effects) that you already pay for with v0 elsewhere. If you're getting v0 Pro ($20), you could skip 21st.dev Pro and use the free tier (100 credits) for lightweight use — or swap to 21st.dev if the MCP integration beats v0's round-trip.

---

#### 4. Taste Skill (Leonxlnx/taste-skill) — **RECOMMENDED**

**GitHub:** https://github.com/Leonxlnx/taste-skill
**Site:** https://www.tasteskill.dev
**Stars:** 8,900 | **License:** Not stated explicitly (check before commercial use)

A collection of **7 subskills** with **3 adjustable "dials"** (1-10 scale) to tune output aesthetic. Opinionated toward Awwwards-level premium aesthetics — not the default Claude Code "B-tier SaaS" look.

**Subskills:**
| Skill | Purpose |
|-------|---------|
| taste-skill | Main premium frontend — layout/typography/colors/spacing/motion |
| gpt-taste | Awwwards-level UI with deterministic randomization + strict GSAP |
| redesign-skill | Audits and fixes existing projects |
| soft-skill | Premium soft UI — fonts, whitespace, depth, spring animations |
| minimalist-skill | Clean editorial Notion/Linear monochrome |
| brutalist-skill (beta) | Swiss typography + CRT terminal |
| stitch-skill | Google Stitch-compatible semantic design |

**The 3 dials:**
- **DESIGN_VARIANCE (default 8)** — 1 = perfect symmetry, 10 = artsy chaos
- **MOTION_INTENSITY (default 6)** — 1 = static, 10 = cinematic spring physics
- **VISUAL_DENSITY (default 4)** — 1 = gallery/airy, 10 = cockpit/packed

**Enforced output rules (examples):**
- Fonts: Geist, Outfit, Cabinet Grotesk, or Satoshi — **never Inter**
- Colors: bg `#f9fafb`, cards white with `border-slate-200/50`, max 1 accent, saturation <80%, no purple/neon glows
- Spacing: `rounded-[2.5rem]` cards, `p-8`/`p-10` padding, diffused shadows
- Mobile: `min-h-[100dvh]` (not `h-screen`), CSS Grid over flex-math
- Scroll animations: Sticky Scroll Stack, Horizontal Scroll Hijack, Locomotive Scroll, Zoom Parallax, Scroll Progress Path

**Install:**
```bash
npx skills add Leonxlnx/taste-skill
```

**Why for GWTH:** The dial-based approach gives explicit control over the "premium vs SaaS default" spectrum. For the landing page hero and marketing pages where visual polish matters most, this produces output closer to Linear/Vercel than default shadcn. Tension with Impeccable — both try to enforce design taste. Recommend using Impeccable as the default system + Taste Skill for premium marketing pages specifically. Caveat: the font list bans Inter which conflicts with your current CLAUDE.md — adjust accordingly.

---

### TIER 2 — Nice to Have

#### 5. Google Stitch — Already in research file

Covered in the previous research file. Free design exploration tool from Google, generates high-fidelity mockups with Tailwind code export.

---

#### 6. Google Fonts — Already integrated

You're already using Inter + JetBrains Mono via `next/font/google`. The video's point: don't default to Inter for everything. **If you adopt Taste Skill**, switch landing page headlines to Geist or Cabinet Grotesk for premium feel while keeping Inter for body text. Easy experiment.

---

#### 7. Playwright CLI — Already in global rules

Already covered in `~/.claude/rules/05-browser-testing.md`. Used for the round-trip screenshot testing loop.

---

### TIER 3 — Monitor, Don't Install Yet

#### 8. SkillUI (amaancoderx/skillui) — **WAIT AND SEE**

**GitHub:** https://github.com/amaancoderx/skillui
**Stars:** 39 main + 144 on npxskillui sibling (April 2026)
**Age:** 8 days old at time of research
**License:** MIT

Pure static analysis CLI (no LLM, no API keys) that reverse-engineers any website, git repo, or local codebase into a `.skill` file Claude Code reads automatically.

```bash
npm install -g skillui
skillui --url https://linear.app --mode ultra
cd linear-design && claude
# Now Claude has full Linear design system context
```

**Ultra mode** uses Playwright: 7 scroll screenshots, animation library detection, @keyframes extraction, hover/focus state diffs, component fingerprinting, font bundling.

**Why wait:** 8 days old, 39 stars, single author with 13 GitHub followers. No community validation yet. Concept is brilliant but this is very early. Check back in 2-3 months.

**Overlap:** This duplicates what awesome-design-md already provides for popular brands — use awesome-design-md for known brands, SkillUI eventually for lesser-known references.

---

#### 9. UI UX Pro Max (nextlevelbuilder/ui-ux-pro-max-skill) — **SKIP**

**GitHub:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
**Stars:** 66,500 (⚠️ suspicious for 5-month-old repo — possible astroturfing)
**License:** MIT

161 industry-specific reasoning rules across Tech/SaaS, Finance, Healthcare, E-commerce, Services, Creative, Lifestyle, Emerging Tech. Asks questions about your site and generates an "industry-correct" design system.

**Why skip for GWTH:**
- **Database/pattern-matching approach** tends to produce "on-trend industry-correct" designs — the opposite of what you want (differentiated premium aesthetic)
- Star count is suspiciously high — be cautious with tools that may be promoted over earned
- Runs a local Python script (`scripts/search.py`) — extra dependency surface
- Your GWTH CLAUDE.md already has a better-defined design system than a generic "education vertical" template
- Impeccable + Taste Skill + awesome-design-md cover this ground with more trustworthy provenance

---

#### 10. WebGPU Skill (dgreenheck/webgpu-claude-skill) — **SKIP FOR NOW**

**GitHub:** https://github.com/dgreenheck/webgpu-claude-skill
**Stars:** 754 | **License:** MIT

Teaches Claude Code to write Three.js WebGPU + TSL (Three.js Shading Language) code for advanced 3D animations, custom shaders, compute shaders, post-processing pipelines.

**Why skip for GWTH:**
- GWTH is an education platform — content-focused, not visual-showcase
- Your existing spiral windmill hero effect (blurred SVG layers) already delivers the premium visual impression without WebGPU complexity
- WebGPU would add 300KB+ to your bundle and require WebGPU browser support (still not universal)
- Author is solid (Three.js community contributor) — save this for a future marketing page or portfolio project, not GWTH v2 Phase 1

---

## Revised Design Tooling Stack for GWTH v2

### Installed Skills (Free, Permanent Foundation)

Add these to `~/.claude/skills/` — they apply to all projects:

1. **Impeccable** — universal quality filter with 18 commands
2. **Taste Skill** — premium aesthetic enforcement with 3 dials (adjust font list to keep Inter for body)

### Project-Specific Resources (Free, Drop-In)

3. **awesome-design-md** — clone and pick 2-3 relevant DESIGN.md files (Linear, Notion, Supabase, Claude) as references in `kanban/1_planning/`
4. **21st.dev Magic MCP** — install on free tier (100 credits/mo) for component generation inside Claude Code

### Paid Stack ($40/month — inspiration + design + QA)

5. **Mobbin Pro** — $8/mo (annual) for real shipped LMS flow references
6. **Google Stitch** — free, design exploration
7. **v0 Pro** — $20/mo for component generation (or swap for 21st.dev Pro $20/mo if MCP integration wins)
8. **Gemini Advanced** — $20/mo for visual QA loop

### Already Have

- Claude Code
- Playwright CLI (in global rules)
- Google Fonts (Inter + JetBrains Mono)

---

## What I Recommend You Do Today

1. **Install Impeccable globally** — highest-impact skill, works on everything
   ```bash
   git clone https://github.com/pbakaus/impeccable ~/code/impeccable
   cp -r ~/code/impeccable/dist/claude-code/.claude/* ~/.claude/
   ```

2. **Install the Impeccable Chrome extension** — use it as a live QA tool on deployed pages at http://192.168.178.50:3001

3. **Install the 21st.dev Magic MCP** on free tier
   ```bash
   claude mcp add magic --scope user --env API_KEY="<key>" -- npx -y @21st-dev/magic@latest
   ```

4. **Clone awesome-design-md and extract 3-4 DESIGN.md references** into `kanban/1_planning/references/`:
   - `linear.app/DESIGN.md` (dashboard inspiration)
   - `notion/DESIGN.md` (lesson viewer content layout)
   - `supabase/DESIGN.md` (dark mode developer aesthetic)
   - `claude/DESIGN.md` (premium AI brand feel)

5. **Install Taste Skill** for premium marketing pages
   ```bash
   npx skills add Leonxlnx/taste-skill
   ```
   Adjust the font rules to keep Inter for body text (your CLAUDE.md already commits to Inter).

**All 5 steps are free, zero monthly cost, take ~20 minutes.** They materially improve every design-related prompt you give Claude Code from this point forward.

---

## The Core Insight from the Video

The pattern across all 10 tools: **Claude Code doesn't need a better design skill — it needs concrete anti-patterns and reference systems.** Vague instructions like "make it look modern" produce AI slop. Specific instructions like "don't use Inter, use Geist; don't use purple gradients; card padding is p-8 not p-4; shadows are diffused 0_20px_40px_-15px not default" produce premium work.

Your CLAUDE.md already does this for GWTH's color and layout system. Impeccable + Taste Skill + awesome-design-md apply the same philosophy to typography, motion, and component patterns — the areas your current spec doesn't cover in as much detail.
