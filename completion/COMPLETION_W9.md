# Completion: W9 — FDE design guide (codify /home-fde into DESIGN_FDE.md)

**Date:** 2026-06-17 · **Repo:** GWTH_V2 · **Commit(s):** `58c8b61` (DESIGN_FDE.md created), `fee4d7f` (application map marked done by W10)
**Test URL:** http://192.168.178.50:3001/ (the exemplar — home-fde is now the live homepage) · **Status:** verified (one documentation gap flagged below)

## What changed (2–4 bullets)
- Created [DESIGN_FDE.md](../DESIGN_FDE.md) — the FDE journal-register design guide (8 sections: tokens, type system, idioms, component recipes, application map, carried-over QA rules, migration notes), extracted from the implemented `home-fde` exemplar so every other W-task references one authority.
- The guide opens by declaring it **supersedes DESIGN.md (Stone & Sage) for every student-facing surface** (David's call, 2026-06-12).
- The exemplar it codifies — [src/components/marketing/home-fde/](../src/components/marketing/home-fde/) (`home-fde.tsx` 313 lines, `home-fde.module.css` 689 lines, `README.md`) — is now the live homepage at `/`. The original `/home-fde` review route was retired when the design went live (so `/home-fde` now 404s; the live exemplar is `/`).

## UI — the exemplar the guide codifies
The guide is a document, but its source of truth is the live FDE homepage. This is what "FDE journal register" looks like as a student sees it: drenched dark-teal hero, stacked Source Serif 4 headline with an ochre italic accent ("*Build.*"), paper-cream surfaces, mono metadata row, hairline rules.

![home-fde exemplar desktop](W9/home-fde-1280.png)
![home-fde exemplar mobile](W9/home-fde-390.png)

Test it: **http://192.168.178.50:3001/**  (light/dark toggle is the sun icon top-right)

## What DESIGN_FDE.md codifies (so a session that never saw /home-fde can restyle from the guide alone)

**Design tokens** (light-mode hex, scoped custom properties named site-wide):

| Token | Light hex | Role |
|---|---|---|
| `--v-bg` | `#e8e9de` | page paper background |
| `--v-surface` | `#f1ecdc` | card / panel surface |
| `--v-ink` | `#1a1c18` | body + heading text |
| `--v-teal` | `#2c4a47` | drenched hero band |
| `--v-teal-deep` | `#1f3a37` | dispatch band (pricing/CTA) |
| `--v-ochre` | `#c08a36` | italic-em accent |
| `--v-cream` | `#ece8d2` | hero text on teal |
| `--v-moss` / `--v-rust` | `#2a4530` / `#a87528` | colour-block card-top rotation |

**Type system:** Source Serif 4 (`var(--font-source-serif), Georgia, serif`) for display AND body; JetBrains Mono (`var(--font-jetbrains), ui-monospace, monospace`) for metadata only. Hero H1 clamp scale `clamp(3rem, 8vw, 5.5rem)` (weight 600, line-height 1.04); inner-page masthead `clamp(2.6rem, 6.5vw, 4.5rem)`.

**Idioms codified:** drenched teal hero/masthead band · paper-cream surfaces with 1px `--v-line` border · colour-block card tops (teal → moss → rust rotation by index) · journal/issue framing for curriculum · pull quotes (centred italic serif, ochre em) · dispatch band (`--v-teal-deep`) for pricing/CTA · three hairline weights (1px ink / `--v-line` / `--v-line-soft`) · dash-progress affordance (3px flex segments).

**Component recipes** (header/nav, card, primary + quiet button, badge/meta row, section head, FAQ row) and an **application map** of every student-facing surface with what it adopts, plus carried-over DESIGN.md QA rules (light + dark at 1440/768/412, no eyebrow pills, sentence-case CTAs, no em dashes in UI copy, status = colour + icon + text, tokens-only no raw hex).

## Deviation flagged (honesty)
Commit `58c8b61`'s message states "DESIGN.md carries the superseded pointer." On inspection, **DESIGN.md does NOT yet carry that pointer** — its opening frontmatter is unchanged since before W9, and git shows no edit to DESIGN.md in the W9 commit. The guide itself supersedes correctly; only the one-line back-pointer at the top of the old DESIGN.md is missing. Low impact (DESIGN_FDE.md is self-declaring), but worth a one-line fix.

## What David should verify
- [ ] Open http://192.168.178.50:3001/ — confirm the FDE register (teal hero, Source Serif headline, ochre "Build." accent) reads as the design basis the guide describes.
- [ ] Skim [DESIGN_FDE.md](../DESIGN_FDE.md) §2 tokens and §3 type — confirm the palette/fonts match what you chose on 2026-06-12.
- [ ] Decide whether the missing superseded-pointer line at the top of [DESIGN.md](../DESIGN.md) needs adding (flagged above).

## Verification run
```
ls DESIGN_FDE.md                          → present (31,479 bytes, 8 ## sections)
ls src/components/marketing/home-fde/      → home-fde.tsx (313 ln), .module.css (689 ln), README.md
git log --oneline -- DESIGN_FDE.md         → 58c8b61 docs(design): DESIGN_FDE.md — codify the FDE journal register from the home-fde exemplar (W9)
curl -s -o /dev/null -w %{http_code} http://192.168.178.50:3001/   → 200
npx playwright screenshot (1280 + 390)     → home-fde-1280.png, home-fde-390.png (real renders, embedded above)
```

---
*GitHub blob (after push):*
```
https://github.com/David-ACG/gwth-v2/blob/master/completion/COMPLETION_W9.md
```
