# PLAN — GWTH.ai Redesign POC (Claude Design)

**Date:** 2026-04-24
**Author:** David + Claude
**Budget:** ~12–18 hours across ~4 sessions, staged around Claude Design's weekly quota reset
**Related:**
- [PLAN_2026-04-18_ai-design-workflow-experiment.md](./PLAN_2026-04-18_ai-design-workflow-experiment.md) — FractionalBuddy 3-way experiment (Track A = Claude Design) — **paused**; GWTH is higher priority
- [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md)
- [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md)
- [HANDOFF_2026-04-20_trackA-dashboard-next.md](../../../fractionalbuddy-site/HANDOFF_2026-04-20_trackA-dashboard-next.md) — Track A state at pause (quota, dead-ends, wins — still valid methodology source)

---

## 0. Decisions Received — 2026-04-24

- **FB experiment paused** — GWTH redesign is the higher-priority workstream. No parallel-quota conflict.
- **Fresh Claude Design quota cycle.** Settings/Usage tab on 2026-04-25 confirms **Claude Design: 0% used, plan Max (5x), weekly reset Sat 02:00 AM**. (The earlier "Thursday 11:00" observation was either a misread or a one-off — Saturday is the authoritative reset going forward.) Baseline screenshot at `kanban/design-artefacts/2026-04-24/quota-snapshots/2026-04-25_pre-poc-start.jpg`. Plan can start immediately.
- **OKLCH Graphite Warm palette is NOT sacred.** Claude Design may replace it wholesale; CLAUDE.md's Design System section will be updated in Phase 3 to match whatever lands.
- **Logo direction — explore both** (wordmark-only AND icon-forward, multiple type/metaphor angles). No pre-commitment in the brand brief; Phase 0 picks the winner at the end of concept generation, not the start.
- **POC scope is exactly 2 pages — homepage + student dashboard.** Confirmed.
- **Install Impeccable Tier 1 skills globally** (`/audit /critique /polish`) before Phase 4 verify. Side-task, runs in parallel with Phase 0.
- **Per-page deploy gate.** Deploy + review after homepage; check Claude Design quota burn at that point; decide whether to continue to dashboard or pause for next reset based on actual consumption (NOT projected).
- **All 13 original assumptions (§15) hold.** One adjustment: **Recraft is no longer the default vector tool** — David has no FB-era experience with it. Plan §5 is now tool-agnostic for the vector-finalisation step and adds the **new OpenAI image tool (released 2026-04-23)** as a curiosity-driven option David wants to try.

---

## 1. Purpose

Use **Claude Design** (single-tool, not a shootout) to produce a redesigned GWTH.ai student platform, starting as a **2-page POC** (marketing homepage + student dashboard). Land the POC on the local GWTH_V2 version hosted at **http://192.168.178.50:3001** (P520), validated by David in the browser. The production `gwth.ai` on Hetzner stays locked for launch and is not touched by this plan.

**Why Claude Design only (not the 3-way):** FractionalBuddy already IS the 3-way shootout. Running a second shootout on GWTH would duplicate effort and burn quota. Once FB's synthesis lands, GWTH either confirms Track A won and we proceed, or switches lead tool with a new plan.

**Why only 2 pages for the POC:** If Claude Design gets the homepage and the student dashboard right, the **visual grammar** (type scale, colour tokens, component shapes, animation vocabulary) propagates cleanly to the remaining pages (`/courses`, `/lessons/[slug]`, `/labs`, `/progress`, `/settings`, auth, marketing long-tail). Those pages can then be implemented directly in Claude Code using the handoff bundle as the style bible — no more Claude Design credits required.

---

## 2. Scope

### In scope
1. **Phase 0 — Logo + favicon** (not Claude Design; credit-preserving alternative)
2. **Phase 1 — Marketing homepage redesign** via Claude Design (route `/`)
3. **Phase 2 — Student dashboard redesign** via Claude Design (route `/dashboard`)
4. **Phase 3 — Brand kit commit** (globals.css tokens, fonts, logo swap) to a new branch
5. **Phase 4 — P520 deploy** of the new branch for David's browser review
6. **Phase 5 — Lessons learned + style bible** for the rest of the site (homework for Claude Code later, NOT this plan)

### Out of scope (explicitly)
- Production gwth.ai on Hetzner — locked until launch
- Other routes (`/courses`, `/lessons/[slug]`, `/labs`, `/progress`, `/settings`, `/pricing`, auth, etc.)
- Backend, auth, data model changes — platform stays on Supabase stubs as today
- A second design-tool shootout — FB is doing that
- Rewriting the site copy from scratch (voice stays close to current; logo brief may sharpen positioning but site copy is not the experiment)

---

## 3. Pre-Flight Decisions

These are the things that must be settled before Phase 0 can start. Each has a default; David can override.

| # | Decision | Default | Notes |
|---|---|---|---|
| D1 | **Run POC before or after FB verdict?** | **Before.** Use FB Track A learnings (below) as the methodology; don't block on full synthesis. | FB synthesis is days away. If Claude Design lost FB outright, we'd need that signal before burning GWTH quota — but Track A's homepage shipped at desktop perf 96, which is enough confidence to proceed. |
| D2 | **Branch strategy on GWTH_V2** | New branch `experiment/redesign-poc-2026-04` off `master` | Matches FB pattern. Keeps `master` clean until David approves in the browser. |
| D3 | **Deploy target for review** | P520 at http://192.168.178.50:3001 via the existing Coolify app | Matches the project's verification convention from `~/.claude/rules/03-kanban-gates.md`. |
| D4 | **Keep or replace the cascading spiral animation?** | **Keep the animation primitive** (6-layer blur system is good); treat it as a resource Claude Design can choose to use, reject, or restyle. | Don't ask Claude Design to rebuild the spiral from scratch — that's wasted quota. |
| D5 | **Replace the OKLCH Graphite Warm palette?** | **Open** — Claude Design may recommend a new palette derived from the new logo. If the output is close to current, we keep current; if materially different, we commit the new palette. | The existing palette in `CLAUDE.md` lines ~200-260 was thoughtfully built. Default stance is "defend it"; burden of proof is on Claude Design to earn the switch. |
| D6 | **Student dashboard target** | The dashboard under `src/app/(dashboard)/dashboard/page.tsx` | This is the one David has been iterating on. No confusion about which dashboard. |
| D7 | **Claude Design conversation strategy** | **Reuse one conversation across homepage + dashboard** (FB Track A pattern; saves ~5-7pp per page on seed re-upload) | Cross-page context is a feature for a site redesign — we *want* them to feel like one product. |
| D8 | **Gemini QA?** | **Skip.** FB Track A hit 85% hallucination rate on Gemini screenshot-only QA (11/12 findings were about Tailwind classes that don't exist in the codebase) | Replace with `/impeccable audit /critique /polish` from the Tier 1 tools in the research file, or manual Playwright verification + David's own review. |

---

## 4. Methodology (Lifted from FB Track A with GWTH-specific tweaks)

Use the 4-phase flow proven on FB homepage:

### Phase structure per page

1. **Explore (Claude Design)** — 25–40 min
   - claude.ai/design, seeded with: brand brief + globals.css + CLAUDE.md + 2-3 representative existing components + current page screenshot
   - Produce 2-3 interactive variants, pick one
   - Export handoff bundle → `kanban/design-artefacts/YYYY-MM-DD/<page>.bundle.md`
   - Screenshot mocks → `kanban/design-artefacts/YYYY-MM-DD/<page>-light.png` + `-dark.png`

2. **Component sourcing** — 10–20 min
   - Walk the bundle's component list. Prefer existing primitives in `src/components/ui/` first (FB homepage needed zero new shadcn components — worth checking here too).
   - If the bundle needs something missing: `npx shadcn add <component>` or 21st.dev Magic MCP via `/ui <desc>`

3. **Implementation (Claude Code)** — 45–90 min
   - Implement using the bundle as the canonical source. Bundle > screenshot for ambiguity resolution.
   - Must produce both light + dark themes from the bundle's token spec
   - Commit on `experiment/redesign-poc-2026-04`

4. **Verify + close** — 20–40 min
   - `npm run build && npm start` on P520 (Coolify redeploy)
   - David reviews in the browser at http://192.168.178.50:3001
   - Playwright smoke test via project convention (kanban gate 3)
   - Run `/impeccable audit` + `/critique` if installed; document findings
   - Capture final screenshots: desktop 1440 + mobile 375 × light + dark = 4 per page
   - Append implementation notes to the prompt file per kanban gate 3/4

### Dead ends — do NOT retry (from FB HANDOFF)

- **`npm run dev` segfaults on Windows/bash/Node 22** → use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001`
- **Dev-mode Lighthouse is meaningless** → always build + start for performance numbers
- **Gemini screenshot-only QA hallucinates ~85% of the time** → skip entirely for this POC
- **`as Type` casts on Supabase `.data` fail type-check in Next 16** → fix is `as unknown as Type` if encountered

### Credits + cost estimate

- **Claude Design:** ~30-40pp of weekly quota for 2 pages (FB homepage alone was ~40pp; dashboard + homepage reusing seed should be lower per-page). Plan assumes **starting after the Sun 2026-04-26 09:00 reset** unless FB leaves substantial headroom.
- **Gemini Advanced:** skipped (see D8)
- **21st.dev Magic MCP:** free tier (100 credits/mo) should cover any stray component
- **Logo tool:** free (Gemini Stitch or alternative — see §5)
- **Estimated total cost: $0 out-of-pocket**, one week's Claude Design Max quota

---

## 5. Phase 0 — Logo + Favicon (Non-Claude-Design)

Goal: produce a distinct GWTH.ai wordmark + icon mark + favicon set without burning Claude Design credits.

### 5.1 Constraints from David
- Do NOT use Claude Design (lost ~30% of weekly quota on FB logo — too expensive)
- Try **Gemini Stitch** first; fallbacks below if it's weak on logo work specifically
- Logo needs: primary horizontal wordmark, stacked variant, icon-only mark, dark-mode variant; SVG + PNG @ 512/256/128; favicon (32px ICO + 180 apple-touch + 512 PNG + `site.webmanifest`)

### 5.2 Tool options

Two stages to the logo pipeline — **concept generation** (what should the mark look like?) and **vector finalisation** (clean SVG output). Concept stage is idea-hunting; finalisation is precision. Different tools win on each.

**Concept generation — try in this order, stop at the first one that produces something you'd ship:**

| # | Tool | Known quantity? | Why try it |
|---|---|---|---|
| 1 | **Gemini Stitch** (`stitch.withgoogle.com`) | Yes — David used it for FB | Free; generates multi-direction concepts from a brand brief; low friction. |
| 2 | **OpenAI image tool** (released 2026-04-23) | No — curiosity try | Brand-new; David wants to evaluate it. No strong case for it yet; treat as a bonus exploration slot, not a critical path. Hard time-box: 30 min. If it doesn't produce a usable direction in 30 min, fall back. |
| 3 | **Gemini app's built-in image generation** | Yes (general Gemini usage) | Useful for cheap iteration and concept sketches when Stitch or OpenAI tool outputs need nudging. |

**Vector finalisation — tool choice deferred to after concept wins:**

Once a concept direction is picked, the winning image needs to become clean SVG (horizontal wordmark, stacked, icon-only, dark-mode variant). Options:
- **Hand-trace in Figma / Inkscape** — zero-cost, fully controlled, slowest. Default if we have time.
- **Recraft** (access in `C:/Projects/GWTH_V2/recraft`) — vector-first AI tool. Not used on FB, so unknown quality for this specific hand. Flag as experimental; evaluate 20 min; abandon if poor.
- **SVGTrace / vectorizer.ai** — raster-to-vector bitmap tracers. Decent for simple, high-contrast logos.

**Favicon generation — no decision needed:** realfavicongenerator.net. Free, takes a 512×512 PNG, outputs the full favicon set + `site.webmanifest`.

### 5.3 Workflow

1. **Brand brief (30 min)** — pair session with Claude Code: nail who the GWTH.ai student is, the voice, and the "not-list" (what GWTH is NOT). Use FB's `BRAND_BRIEF.md` as the structural template. Save to `kanban/design-artefacts/2026-04-24/brand-brief.md`.
2. **Concept generation (45-75 min)** — Generate **both directions** in parallel since the brand brief is intentionally undecided on wordmark-vs-icon-forward:
   - **Wordmark-only set** (4-6 concepts) — typography-led; one serif option, one humanist sans, one geometric sans
   - **Icon-forward set** (4-6 concepts) — symbol-led; one motion/connection metaphor (the "tech + humans" pairing), one abstract geometric, one literal-but-restrained
   - Start with Gemini Stitch (~30 min) for both sets. Then time-box 30 min with OpenAI's new image tool (curiosity slot) — if it produces a clearly better candidate in either direction, fold it in.
   - Pick **one winner across both directions**, not one from each. The chosen direction is the one that David + Claude Code agree communicates the brand best in 5 seconds.
3. **Vector finalisation (30-60 min)** — Decide at the end of step 2 based on what the winning concept looks like:
   - Simple geometric mark → hand-trace in Figma (fastest)
   - Complex illustrative mark → try Recraft (time-box 20 min), fall back to SVGTrace, fall back to manual
   - Output: (a) horizontal wordmark SVG, (b) stacked variant SVG, (c) icon-only SVG, (d) dark-mode SVG variant, plus 512/256/128 PNG exports
4. **Favicon generation (15 min)** — realfavicongenerator.net from the 512×512 PNG. Drops into `public/` (overwriting existing `icon.svg` / `apple-touch-icon.png` / `favicon.ico` / `site.webmanifest`).
5. **Commit** — new logo files. `public/logo-spiral*.svg` stays in place for now — decision on whether to delete them waits until Claude Design has weighed in during Phase 1 (it may want them as atmospheric assets).

### 5.4 Time budget
**2.5–3.5 hours total for Phase 0** (slightly longer than the original 2-3 h estimate because we're exploring both wordmark-only AND icon-forward in parallel — David's Q4 answer). If Stitch + OpenAI-tool both produce nothing usable in 75 min combined, the problem is the brand brief, not the tool — pause and rewrite the brief before continuing.

### 5.5 Exit criteria for Phase 0
- [ ] Wordmark SVG at `public/logo.svg`
- [ ] Icon-only SVG at `public/icon.svg` (overwrites existing spiral icon if we're replacing)
- [ ] Dark-mode variant SVG at `public/logo-dark.svg`
- [ ] Favicon set regenerated: `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`, 192/512 PNG
- [ ] `brand-brief.md` committed
- [ ] All committed on `experiment/redesign-poc-2026-04`

---

## 6. Phase 1 — Marketing Homepage (Claude Design)

### 6.1 Seed bundle (upload to claude.ai/design)
- `public/logo.svg` + `public/icon.svg` (from Phase 0)
- `src/app/globals.css` — full OKLCH palette, fonts, radius
- `CLAUDE.md` — especially the Design System section
- 3 representative components:
  - `src/components/landing/hero-section.tsx` (current hero w/ spirals)
  - `src/components/ui/button.tsx` + `src/components/ui/card.tsx` (baseline primitives)
  - `src/components/layout/site-header.tsx` (if present — else whichever wraps public routes)
- Baseline screenshot: capture current `/` from local dev server at 1440×900 light + dark, save to `kanban/design-artefacts/2026-04-24/homepage-baseline-{light,dark}.png`
- Brand brief (from Phase 0)
- 1-paragraph positioning: "GWTH.ai is a 3-month learning platform that helps working UK professionals use AI in their jobs. Students follow one core curriculum, complete hands-on labs, track progress, and earn a verified Dynamic Score they can share to LinkedIn. UK-first, evidence-based (CIPD-aligned), aimed at mid-career professionals — not bootcamp dropouts or teenagers." (GWTH stands for *Growth With Tech and Humans* — the acronym expansion can appear in About / footer if useful, but is not a hero tagline.)

### 6.2 Ask Claude Design to deliver
- Full-page hero + features + proof + CTA + footer
- **Both themes explicitly** (not just dark) — GWTH_V2 defaults to light with a Graphite Warm dark mode
- Component list with justifications (what's a shadcn primitive, what's custom)
- Handoff bundle in markdown format (FB pattern)

### 6.3 Claude Code implementation notes
- Target route: `src/app/(public)/page.tsx` (already exists — replace contents)
- Reuse the layout wrapper at `src/app/(public)/layout.tsx`
- Preserve `generateMetadata` and JSON-LD structured data per CLAUDE.md §20-21
- Apply `/impeccable /audit /critique` after implementation if installed
- DO NOT delete the cascading spiral files in `public/` until Phase 2 is also done — the dashboard may still want them

### 6.4 Acceptance criteria
- [ ] Page loads at http://192.168.178.50:3001 without console errors
- [ ] `npm run build` succeeds
- [ ] Lighthouse (prod) Perf ≥ 85 desktop, Accessibility ≥ 90
- [ ] Responsive at 375 / 768 / 1440
- [ ] Light + dark both correct
- [ ] `next.config.ts` workaround flags from FB (ignoreBuildErrors / ignoreDuringBuilds) applied ONLY if needed, flagged with inline comment
- [ ] Baseline + final screenshots committed

---

## 7. Phase 2 — Student Dashboard (Claude Design, same conversation)

### 7.1 Seed additions (same conversation as Phase 1)
- Baseline screenshot of current `/dashboard` at 1440×900 light + dark
- The Phase 1 handoff bundle (so Claude Design can maintain visual consistency)
- Dashboard-specific brief: what widgets matter, what the MVP does well, what to improve (FB dashboard.md template)

### 7.2 Required widgets (today's state — keep or improve, don't drop)
- Course progress cards with progress rings
- Study streak calendar (GitHub-style heatmap)
- Recent activity feed
- Bookmarked lessons/labs
- Quick actions (resume lesson, start lab, view next assignment)

### 7.3 Target route
`src/app/(dashboard)/dashboard/page.tsx` (existing — replace contents, keep the `(dashboard)/layout.tsx` sidebar + header wrapper)

### 7.4 Acceptance criteria (same as §6.4 plus)
- [ ] Sidebar navigation still works (layout wrapper untouched or improved, not broken)
- [ ] Mobile: sidebar becomes Sheet per CLAUDE.md convention
- [ ] Empty states render for zero-progress users

---

## 8. Phase 3 — Brand Kit Commit

Once Phase 1 + 2 both pass David's browser review:

1. Lift the palette, typography, spacing, and motion choices from the handoff bundles into `src/app/globals.css`
2. Update `src/lib/config.ts` if layout dimensions changed
3. Write a one-page `STYLE_BIBLE.md` at `docs/design-system/STYLE_BIBLE.md` referencing the bundles as the source of truth — this is the artefact future Claude Code sessions use to redesign the remaining routes WITHOUT burning more Claude Design credits
4. If the new palette materially differs from the current CLAUDE.md Graphite Warm palette, **update CLAUDE.md's Design System section** to reflect it — otherwise CLAUDE.md misleads future sessions

---

## 9. Phase 4 — P520 Deploy + Review

Following the project's established pattern:

```bash
# From GWTH_V2 on experiment/redesign-poc-2026-04
git push origin experiment/redesign-poc-2026-04

# Trigger P520 Coolify deploy (command from ~/.claude/rules/04-infrastructure.md)
ssh p520 'docker exec coolify php artisan tinker --execute="..."'
```

Then:
1. David opens http://192.168.178.50:3001/
2. David opens http://192.168.178.50:3001/dashboard
3. Tick the kanban gate-4 checklist in the prompt file
4. If approved → merge `experiment/redesign-poc-2026-04` → `master` (NOT to Hetzner production yet; production stays locked until launch)

---

## 10. Phase 5 — Lessons Learned (Lightweight)

After the POC lands:
- Append a "GWTH POC Results" section to [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md) with: quota used, time used, quality verdict, STYLE_BIBLE link
- This feeds FB's own §9 synthesis — real evidence that Claude Design can carry a redesign end to end

Not in scope: a full lab write-up like FB's. That's FB's deliverable, not this POC's.

---

## 11. Files Affected

| Path | Change |
|---|---|
| `public/logo.svg`, `public/icon.svg`, `public/logo-dark.svg` | NEW/REPLACE — Phase 0 |
| `public/favicon.ico`, `public/apple-touch-icon.png`, `public/site.webmanifest`, `public/web-app-manifest-*.png` | REPLACE — Phase 0 |
| `public/logo-spiral*.svg` | POSSIBLY REMOVE (depends on Claude Design's call — default: keep) |
| `src/app/(public)/page.tsx` | REPLACE — Phase 1 |
| `src/app/(public)/layout.tsx` | LIKELY UNCHANGED (wrapper pattern stable) |
| `src/components/landing/hero-section.tsx` | REPLACE/DELETE — new homepage may not need it |
| `src/components/landing/waitlist-form.tsx` | LIKELY PRESERVE — still needed for email capture |
| `src/app/(dashboard)/dashboard/page.tsx` | REPLACE — Phase 2 |
| `src/app/(dashboard)/layout.tsx` | LIKELY UNCHANGED |
| `src/components/` new subfolders (`marketing/`, `dashboard/`) | NEW — Phase 1 + 2 per FB pattern |
| `src/app/globals.css` | UPDATE if palette/type changes — Phase 3 |
| `src/lib/config.ts` | UPDATE if layout dimensions change — Phase 3 |
| `docs/design-system/STYLE_BIBLE.md` | NEW — Phase 3 |
| `CLAUDE.md` | UPDATE Design System section IF palette changed — Phase 3 |
| `kanban/design-artefacts/2026-04-24/` | NEW folder — brand-brief, baselines, mocks, bundles, final screenshots |

---

## 12. Beads Breakdown — Created 2026-04-24

| Beads ID | Phase | Title | Deps |
|---|---|---|---|
| `beads_GWTH-suy` | Pre-flight | Branch + baselines + artefact folder | — |
| `beads_GWTH-72z` | Side-task | Install Impeccable Tier 1 skills globally | — (parallel) |
| `beads_GWTH-bm5` | Phase 0 | Logo + favicon (Stitch + OpenAI tool; both directions) | suy |
| `beads_GWTH-6om` | Phase 1a | Homepage exploration in Claude Design | bm5 |
| `beads_GWTH-w5y` | Phase 1b | Homepage implementation + P520 deploy + Gate 3/4 | 6om, 72z |
| `beads_GWTH-9t0` | Quota gate | Review homepage burn before Phase 2 | w5y |
| `beads_GWTH-eay` | Phase 2a | Dashboard exploration (same Claude Design conversation) | 9t0 |
| `beads_GWTH-m0s` | Phase 2b | Dashboard implementation + P520 deploy + Gate 3/4 | eay |
| `beads_GWTH-6if` | Phase 3 | Brand kit commit + STYLE_BIBLE.md | m0s |
| `beads_GWTH-32e` | Phase 5 | Append results to design-workflow research | 6if |

Currently unblocked (`bd ready`): **suy** (pre-flight) and **72z** (Impeccable install). Both can start in parallel.

---

## 13. Timeline

| When | What | Duration | Session |
|---|---|---|---|
| Day 1 | **Phase 0** — Logo + favicon (Gemini Stitch → Recraft → favicon gen) | 2–3 h | GWTH_V2 (fresh) |
| Day 2 AM | **Phase 1a** — Homepage Claude Design exploration | 1–1.5 h | claude.ai/design browser tab + GWTH_V2 session for bundle save |
| Day 2 PM | **Phase 1b** — Homepage Claude Code implementation + P520 deploy + review | 2–3 h | GWTH_V2 (fresh) |
| Day 3 AM | **Phase 2a** — Dashboard Claude Design (same conversation) | 45–60 min | claude.ai/design (reused tab) + GWTH_V2 session |
| Day 3 PM | **Phase 2b** — Dashboard Claude Code implementation + P520 deploy + review | 2–3 h | GWTH_V2 (fresh) |
| Day 4 | **Phase 3 + 5** — Brand kit commit + STYLE_BIBLE + research append | 2–3 h | GWTH_V2 (fresh) |

**Total: ~12–18 h across 4 days.** Days 2–3 are quota-dependent — if Claude Design hits the weekly limit, pause until Sun 09:00 reset.

---

## 14. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Claude Design hits weekly quota mid-POC | **Medium** — 100% quota free as of 2026-04-24 (Thursday reset). Full cycle available for GWTH. FB's 77%-for-one-page number was without seed-reuse discipline. | Reuse one conversation across both pages (FB Track A learning); screenshot the meter at Phase 1 close to see actual burn; be ready to pause for next reset if Phase 2 stalls |
| Gemini Stitch produces weak logo output | Medium | Fall back to Recraft directly; brand brief is the real work — any tool can execute once the brief is sharp |
| Claude Design's palette recommendation conflicts with current Graphite Warm | Medium | Default stance is "defend current palette"; only swap if Claude Design's output is materially better AND implementation is straightforward |
| Implementation breaks existing routes not in POC scope | Medium | Replace page contents in place; don't touch layout wrappers, shared components in `src/components/ui/`, or `lib/` unless the bundle explicitly demands it |
| P520 deploy fails | Low-medium | Same Coolify flow as existing deployments; if it breaks, fall back to local `next build && next start` for David's review |
| FB experiment's synthesis reveals Claude Design LOST on one of the pages GWTH needs | Medium | If FB synthesis lands before Phase 2 and shows a tool-page-fit issue, pause GWTH Phase 2 and re-plan |
| Spiral animation files conflict with new logo direction | Low | Keep spirals in `public/` until both pages shipped; decide in Phase 3 whether to remove or keep as atmospheric asset |
| `next.config.ts` typescript ignore flags linger from FB | Low | These flags only exist in fractionalbuddy-site's branch, NOT GWTH_V2. Confirm fresh state at Phase 1 start. |

---

## 15. Assumptions (flag if any are wrong)

1. **FB experiment's synthesis is NOT required to gate this POC.** Track A Claude Design has already shipped one page at desktop perf 96, which is enough confidence. If FB synthesis lands mid-POC and contradicts this, we pause and re-plan.
2. **GWTH_V2's `master` branch is clean and deployable to P520 right now.** (The `git status` at session start shows M on one curriculum file + new screenshots — need to confirm none of that is intermixed with stale experimental code that would interfere with a fresh redesign branch.)
3. **Claude Design Max plan quota reset happened early — Thursday 2026-04-23 ~11:00 UK** (confirmed by David), not the advertised Sunday 09:00. 100% free quota available for this POC. Next reset is presumably Thursday 2026-04-30 but verify the meter at Phase 1 start since the reset day seems unstable.
4. **Gemini Stitch is accessible** (David has used it for the FB experiment, so assumption stands).
5. **P520 Coolify app `xw4csk0ssos8800kws0cswwk`** (GWTH_V2 test) is the deploy target for the new branch — verify a preview environment isn't needed.
6. **Production `gwth.ai` on Hetzner stays untouched** until a separate "launch" plan promotes the redesign. This POC is local-only.
7. **The existing design-system content in CLAUDE.md** (OKLCH palette, Graphite Warm dark mode, cascading spiral animation) is the **current state**, not sacred. Claude Design may propose changes; human judgement decides whether to adopt.
8. **David's logo tool preference (updated 2026-04-24):** Gemini Stitch first, OpenAI's newly-released image tool (2026-04-23) as a curiosity slot, Gemini app for cheap iteration. Recraft is NOT a default (never used on FB — unknown quantity); evaluate only if a concept needs vector cleanup and manual tracing isn't fast enough.
9. **No backend changes are needed.** Supabase stubs as-is. Auth providers as-is. Redesign is purely visual + structural.
10. **`/impeccable` Tier 1 skills** (from RESEARCH_2026-04-16) can be installed globally to run `/audit /critique /polish` per page — but are NOT a blocker. If they're not installed, Phase 4 verify is a manual visual review + Playwright smoke test.
11. **Kanban gate sequence applies** per `~/.claude/rules/03-kanban-gates.md`: one PROMPT file per implementation phase, gate 3 (implementation notes) + gate 4 (testing checklist) appended to each prompt before moving to `2_testing/`.
12. **Beads is the task tracker**, not TodoWrite / TaskCreate / markdown TODO lists.
13. **Playwright verification** uses the pytest-playwright CLI pattern from `~/.claude/rules/05-browser-testing.md`, not the Playwright MCP.

---

## 16. Open Questions for David — All Decided (2026-04-24)

1. ✅ **FB experiment status** — **paused**; GWTH is higher priority. No quota conflict.
2. ✅ **Start date** — **start immediately**. Quota reset early on Thursday 2026-04-23; full cycle free.
3. ✅ **Current design-system sacredness** — **nothing is off-limits**. Claude Design may replace the OKLCH Graphite Warm palette, the cascading spiral, typography, anything.
4. ✅ **Logo direction cues** — **try both**. Brand brief stays undecided on wordmark-vs-icon; Phase 0 explores both in parallel and picks the winner from the combined pool. See updated §5.3 step 2.
5. ✅ **Scope confirmation** — **homepage + student dashboard only**. Hero is part of the homepage deliverable, not separate.
6. ✅ **Impeccable install** — **yes**. Install Tier 1 skills globally before Phase 4. Treat as a side-task that runs in parallel with Phase 0; not a blocker.
7. ✅ **Credit headroom** — **100% of the weekly allowance** budgeted for GWTH. FB is paused.
8. ✅ **P520 deploy timing** — **deploy after each page**. Review homepage on P520, then check Claude Design quota burn at that gate before committing to Phase 2. Quota-aware, not date-aware.

---

## 17. Execution Mode — Interactive (Decided 2026-04-24)

This POC deliberately deviates from the standard `/build` headless pipeline.

**Why:** Claude Design output is unpredictable enough that a headless fresh-session-per-prompt run would produce stale or wrong implementations. Each phase produces information that should refine the next (winning logo direction → palette → component grammar → dashboard layout). Quota awareness needs human-in-the-loop.

**How it differs:**

| Standard `/build` flow | This POC's interactive flow |
|---|---|
| `1_planning/PROMPT_*.md` per task, reviewed at Gate 2 | **Skipped** — beads descriptions + this plan are the spec |
| Fresh session per prompt via `run-kanban.sh` | **Same session(s)**; conversation is the audit trail |
| Autonomous; questions are violations | **Questions encouraged** in both directions |
| Plan locked at start | **Plan is a living doc** — David updates it as decisions arrive (see §0 Decisions Received and §16 for the pattern) |
| Gate 3/4 still apply | **Gate 3/4 still apply** — append implementation notes + testing checklist to the prompt-equivalent record (this plan's per-phase entries) |

**Beads is the running task tracker.** `bd update <id> --claim` when starting a phase; `bd close <id>` when done; `bd update <id> --notes="..."` to capture findings that don't belong in the plan.

**The plan is updated** whenever a decision changes scope — add a dated bullet to §0 Decisions Received and link to the relevant section.

**Session boundary rule (the only exception):** The build session(s) and this planning session can overlap freely, but heavy compaction events (`/compact`) should land at phase boundaries — between Phase 0 and Phase 1a, between Phase 1b and Phase 2a, etc. Mid-phase compaction loses Claude Design conversation context.

---

## Review Checklist — 2026-04-24
- [ ] Scope is correctly bounded (2 pages POC, rest defers to STYLE_BIBLE for later)
- [ ] Technical approach matches GWTH_V2's Next.js 16 / Tailwind v4 / shadcn/ui / Motion stack
- [ ] Files affected list is complete and accurate
- [ ] Acceptance criteria match project's existing gate conventions
- [ ] No unexpected dependencies introduced (no new paid services beyond what's already in play)
- [ ] Estimated complexity (~12-18 h) feels right
- [ ] FB Track A learnings are applied, not ignored
- [ ] Phase 0 logo path avoids Claude Design credits as David requested
- [ ] Plan explicitly does NOT touch production gwth.ai
- [ ] Assumptions list captures the stuff that could go wrong if misaligned
- [ ] Open questions are real decisions David needs to make, not information I could have found

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-24_gwth-redesign-poc.md`
