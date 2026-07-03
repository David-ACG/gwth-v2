# GWTH Redesign with Impeccable — Interactive Workflow

A step-by-step guide for redesigning GWTH page-by-page, **interactively** (no kanban runner, no beads autonomy). The homepage is the source of the design bible; every subsequent page inherits it.

---

## What this is and isn't

- **Is:** an interactive workflow — you sit in Claude Code, drive each step, review every variant.
- **Isn't:** a runner prompt. The `GUIDE_` prefix keeps `run-kanban.sh` away from this file. Don't paste it into `/build`.

You're the designer. Impeccable is the design language and the variant generator. Claude Code is the hands.

---

## Part 0 — One-time setup (5 min)

### Warp layout

You need **two Warp tabs** open in `C:\Projects\GWTH_V2`, plus a browser. Set them up before doing anything else:

| Tab | Purpose | Command |
|---|---|---|
| Tab 1 | Claude Code session (fresh, inside GWTH_V2) | `cd C:\Projects\GWTH_V2 && claude` |
| Tab 2 | Dev server (long-running, leave alone) | `cd C:\Projects\GWTH_V2 && npm run dev` |
| Browser | Live Mode target | `http://localhost:3000` |

**Important:** start a *new* Claude Code session in Tab 1 — don't reuse a session from another project. GWTH_V2's `CLAUDE.md`, the existing `DESIGN.md` / `PRODUCT.md`, and project-specific memory only load when Claude Code is launched from this directory.

(If you prefer Warp split panes over tabs, `Ctrl+D` for vertical split works too. The dev-server tab doesn't need to be visible — just running.)

### Then in Tab 1

1. **Install Impeccable** if not already (global skill — install once, available in all projects):
   ```bash
   npx skills add pbakaus/impeccable
   ```
2. **Branch the repo** so radical redesign work is isolated:
   ```bash
   git checkout -b redesign/impeccable-homepage
   ```
3. **Confirm dev server is up** — Tab 2 should show the Next.js compiled output and `http://localhost:3000` should load in the browser.

---

## Part 1 — Audit the current state (15 min)

You already have `DESIGN.md` and `PRODUCT.md` in the repo from the prior run. Refresh them and get a baseline before changing anything.

```text
/impeccable document
```
→ Reverse-engineers a fresh `DESIGN.md` from the current homepage code. Compare the diff against the existing one — if it's stale, accept the new version.

```text
/impeccable critique on the homepage
```
→ Returns a 10-axis health score (each /4) and a verdict: AI-slop / acceptable / good / impeccable. Note the score — you'll re-run this at the end.

```text
/impeccable detect on the homepage
```
→ Deterministic anti-pattern scan (no LLM). Catches eyebrow pills, gradient text, nested cards, etc. **Cross-check against `~/.claude/rules/06-code-quality.md`** — David's hard rule "no decorative eyebrow pills above headlines" is non-negotiable; if the current homepage has any, they go regardless of what Impeccable says.

**Decision point:**
- Critique score ≥ 30/40 → **evolve** (skip Part 2, jump to Live Mode in Part 3)
- Critique score < 30/40 → **radical reset** (continue Part 2)

---

## Part 2 — Radical homepage redesign with macro variants (60–90 min)

This is the "I want a totally different homepage" path. Skip if Part 1 said evolve.

### 2a — Run craft with the three-variant trick

```text
/impeccable craft

Redesign the GWTH homepage. Goal: <one-sentence pitch — what GWTH is, who it's for, why they should care>.

Before you write any code, ask me your discovery questions. Then once we've answered them, give me THREE macro variants side-by-side that I can compare in the browser — make them genuinely different in approach (e.g. editorial vs. drenched vs. brutalist). I want to click through all three on a /preview page before you commit to one.
```

**Why the variant trick:** Impeccable doesn't do this by default — the YouTube author added it as a prompt convention. It's the highest-leverage change you can make to a craft session. Stops you from being railroaded into the first plausible answer.

### 2b — Optional: feed it a mood board

If you have brand reference imagery (a screenshot, a Pinterest board, a competitor site you like), drop it into the chat with the prompt:

```text
Use this image as the visual mood / aesthetic reference. Don't copy it; absorb the vibe.
```

Caveat from the transcript: a single mood-board image without supporting assets gives weaker results than the no-image path. If you go this route, give 2–3 reference images, not one.

### 2c — Pick a variant

Open the preview page in your browser, click through all three, pick one. Tell Claude:

```text
Going with variant 2 (drenched). Scaffold it as the real homepage. Discard the other two.
```

`craft` will now overwrite the homepage with the chosen variant and refresh `DESIGN.md` + `PRODUCT.md` to match.

**Commit checkpoint:**
```bash
git add . && git commit -m "feat(homepage): radical redesign — drenched variant from impeccable craft"
```

---

## Part 3 — Live Mode iteration (30–60 min)

This is where Impeccable earns its keep. Element-level tweaks with multiple variants per change.

```text
/impeccable live
```

Claude opens a localhost picker session. Refresh the browser; you'll see overlays on every component. Sidebar shows the live `DESIGN.md`.

**Per-element loop:**

1. Click an element (heading, card, CTA, dashboard mock, …).
2. Choose an adjustment:
   - **Freeform** — natural-language prompt
   - **Pre-made commands** — `bolder` / `quieter` / `delight` / `animate` / `colorize` / `typeset` / `layout` / `polish` / `distill` / `harden` / `adapt` / `extract`
3. Set **variant count** — ×2, ×3, or ×4 (×3 is the sweet spot)
4. Click **Go** — Impeccable generates that many variants of just that element
5. Use the **Tune** slider to adjust offset (how wild) and colour
6. Click **Accept** on the variant you want — Claude applies it and reloads

Treat every variant generation as cheap. Burn through 20+ in a session. Keep the ones that surprise you.

### Watch out for

- **Eyebrow pills** — if any variant adds a small rounded badge above a headline (with a dot, an icon, or just text like "OUR PROCESS"), reject it. This is David's hard ban — see `~/.claude/rules/06-code-quality.md`.
- **AI-slop telltales** — purple gradients, four bento boxes in a row, gradient text on headlines. `detect` will catch these in Part 4 anyway, but kill them at source.
- **Reload bugs** — Live is alpha; if Accept seems to bug, check Claude's terminal — it's usually mid-write.

### When to stop

Stop when nothing in the next variant batch is better than what's on screen. Don't chase asymptotic improvements — diminishing returns kick in fast.

**Commit checkpoint:**
```bash
git add . && git commit -m "feat(homepage): live-mode polish — typography, hero CTA, dashboard mock"
```

---

## Part 4 — Quality pass before locking (15 min)

```text
/impeccable detect on the homepage
```
→ Should return zero or near-zero hits. Anything that comes up: fix in Live Mode or by hand.

```text
/impeccable polish on the homepage
```
→ Final pass to align all spacing/typography to the system. Subtle changes only.

```text
/impeccable harden on the homepage
```
→ Empty states, error states, first-run experience, mobile breakpoints.

```text
/impeccable critique on the homepage
```
→ Re-run the baseline critique. You want a score ≥ 32/40 to consider the homepage done. If not, identify the lowest-scoring axis and focus the next Live session there.

---

## Part 5 — Lock the design bible (10 min)

Now `DESIGN.md` and `PRODUCT.md` are the source of truth for every other page.

1. **Read them through.** The whole file. They're going to constrain the next several hours of work.
2. **Add a frozen header** at the top of `DESIGN.md`:
   ```markdown
   > **Frozen 2026-04-28** — locked after homepage redesign. Other pages MUST inherit from this. Don't drift; if a new page needs a new pattern, add the pattern here first, then use it.
   ```
3. **Commit explicitly:**
   ```bash
   git add DESIGN.md PRODUCT.md
   git commit -m "lock: design bible from homepage redesign"
   ```
4. **Optional but recommended:** open a PR for the homepage redesign now. Other pages get separate PRs that all reference the same locked bible.

---

## Part 6 — Roll out to other pages (per page, ~30–45 min each)

Same pattern, every page. The bible is the constraint.

### Page checklist (run for each: about, services, blog, contact, …)

1. **Mini-audit** (5 min):
   ```text
   /impeccable critique on /about

   Constraint: DESIGN.md is frozen. Don't suggest violations of the bible — only suggest things that bring this page in line with it.
   ```
2. **Redesign** (15 min):
   ```text
   /impeccable craft on /about

   The homepage at / is the visual reference. DESIGN.md and PRODUCT.md are the immutable bible — do not deviate.
   Goal for this page: <one-sentence purpose>.
   Show me 2 macro variants (not 3 — the bible is doing most of the macro work) and I'll pick.
   ```
3. **Tweak** (15 min):
   ```text
   /impeccable live on /about
   ```
4. **Quality** (5 min): `detect` + `polish` on that page only.
5. **Commit per page:**
   ```bash
   git checkout -b redesign/impeccable-about   # branch off the homepage branch
   git commit -m "feat(about): redesign per design bible"
   ```

**If a page legitimately needs a new pattern** (e.g. blog needs a long-form prose layout the homepage didn't define):
- Pause the page work
- Edit `DESIGN.md` to add the new pattern
- Commit the bible update first (its own commit)
- Then resume the page work using the new pattern

This keeps the bible as the source of truth instead of letting page-by-page drift accumulate.

---

## Part 7 — Final pass with the snagging skill

After every page is redesigned, run the snagging skill on the whole site:

```text
/snagging
```

It'll pre-assess each page against `DESIGN.md`, ask A/B/C questions, fix issues with deploys after every fix, and produce an end-of-run report of compromises and weaknesses. (This is the punch-list pass — see `~/.claude/skills/snagging/SKILL.md`.)

---

## Pause / resume

If you need to stop mid-redesign and come back later:

```text
/pause-handoff
```

Writes a self-contained handoff file the next session can resume from. (See `~/.claude/skills/pause-handoff/SKILL.md`.)

---

## Reference — the 23 commands at a glance

**Foundation:** `teach` (brand context), `shape` (discovery interview), `document` (reverse-engineer DESIGN.md from code)

**Build:** `craft` (full implementation), `live` (browser iteration with variants — alpha)

**Refinement:** `polish` (system alignment), `audit` (5-axis scoring), `critique` (Nielsen-heuristic personas), `detect` (25 anti-pattern deterministic scan)

**Styling:** `typeset`, `colorize`, `bolder`, `quieter`, `animate`, `delight`, `layout`

**Other:** `extract`, `harden`, plus 6 more — run `/impeccable` with no args to list them.

**Pin a command** for a single-keystroke shortcut: `/impeccable pin live`

---

## Anti-checklist (don't do)

- Don't run this through `/build` or the kanban runner — it's interactive by design
- Don't accept ANY variant that puts a decorative pill / badge above a headline (David's hard ban)
- Don't redesign other pages before the homepage bible is committed and pushed
- Don't generate fewer than 2 variants for any meaningful change in Live Mode (single-variant means you're not exploring)
- Don't skip `detect` — it's the cheapest quality gate Impeccable offers
- Don't merge to main until at least the homepage has been eyeballed at the deploy URL (P520 :3001 per `~/.claude/rules/04-infrastructure.md`)
