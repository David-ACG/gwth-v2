# Prompt: Claude Design — Student Dashboard

> **Refreshed 2026-05-08.** The original aqua/mint/Inter brief was written before the E2-E "Stone & Sage" lock-in (2026-04-29) and the home-page port (2026-05-08). The full brief and reference assets now live as a single drag-drop bundle at:
>
> **`kanban/design-artefacts/2026-05-08/dashboard-design-bundle/`**

## Quick links

- **Brief:** [`BRIEF.md`](../design-artefacts/2026-05-08/dashboard-design-bundle/BRIEF.md)
- **How to use:** [`README.md`](../design-artefacts/2026-05-08/dashboard-design-bundle/README.md)
- **References folder:** [`references/`](../design-artefacts/2026-05-08/dashboard-design-bundle/references/)
  - `01-homepage-full-light.png`
  - `02-homepage-full-dark.png`
  - `03-score-ticker-light.png`
  - `04-score-ticker-dark.png`

## Workflow

1. Open Claude Design.
2. Start a fresh conversation.
3. Drop in `BRIEF.md` plus all four reference PNGs.
4. Send. Claude Design returns desktop (1440 px) + mobile (412 px) dashboard mockups for the active, free, and lapsed learner states.
5. Save returned artefacts to `dashboard-design-bundle/output/` and hand off to the codebase via [`PROMPT_2026-05-08_codex-student-dashboard-port.md`](./PROMPT_2026-05-08_codex-student-dashboard-port.md).

## Beads tracking

`beads_GWTH-bza.11` — Redesign student dashboard with Claude Design (P0, in_progress, due 2026-05-21).

---

## Review Checklist — 2026-05-08 17:50
- [x] Scope is correctly bounded — single dashboard, 4 states, ports into existing Next.js shell
- [x] Visual register matches the locked E2-E "Stone & Sage" home page (terracotta + warm stone, Public Sans + Vollkorn, sharp editorial)
- [x] Hard prohibitions preserved from old prompt (logo SVG lock, no eyebrow pills, no Tech Radar, no em dashes, etc.)
- [x] Reference assets bundled (4 PNGs in single folder for drag-drop)
- [x] Token-count estimate provided (~16,500 input tokens) so quota can be planned
- [x] Score card pattern explicitly referenced (don't reinvent — reuse the share-ticker)
- [x] Existing dashboard scaffolding noted so Claude Design improves the model rather than reinventing the navigation

**Review this prompt:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-05-08_claude-design-student-dashboard.md`
