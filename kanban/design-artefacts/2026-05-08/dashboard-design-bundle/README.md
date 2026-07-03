# Dashboard Design Bundle — for Claude Design (2026-05-08)

A drag-and-drop bundle for the GWTH.ai student dashboard redesign. Refreshed 2026-05-08 after the home-page port to the locked E2-E "Stone & Sage" register.

## How to use (5 minutes)

1. Open Claude Design.
2. Start a fresh conversation.
3. Drop into the conversation:
   - `BRIEF.md` (text)
   - All 4 PNG files in `references/`
4. Send. Claude Design will produce the dashboard mockups per `BRIEF.md` § 9.

That's it. The brief is self-contained — no need to add extra context.

## Bundle contents

| File | Tokens (approx) | What it is |
|------|----------------:|------------|
| `BRIEF.md` | ~3,500 | The full design brief — locked palette, prohibitions, info architecture, deliverables |
| `references/01-homepage-full-light.png` | ~5,000 | Full home page, light mode — the master visual reference |
| `references/02-homepage-full-dark.png` | ~5,000 | Full home page, dark mode — confirms theme behaviour |
| `references/03-score-ticker-light.png` | ~1,500 | Locked score-card pattern (share-ticker idiom) — reuse on dashboard |
| `references/04-score-ticker-dark.png` | ~1,500 | Score card dark mode |
| **Total** | **~16,500** | One round of input |

## Why this bundle (vs. the old prompt)

The previous prompt at `kanban/1_planning/PROMPT_2026-05-08_claude-design-student-dashboard.md` was written before the E2-E lock-in (2026-04-29) and the home-page port (2026-05-08). It still referenced aqua + mint + Inter from the original Phase 1 register, which would have produced a dashboard that didn't visually match the home page.

This refreshed brief:

- Replaces the visual-language section with the locked Stone & Sage tokens
- Names the locked terracotta logo accent (#a94c2e, reverted from gold on 2026-05-08)
- Calls out the share-ticker score card pattern as the locked score visual (don't reinvent)
- Carries forward all good prohibitions from the old prompt (logo SVG lock, no eyebrow pills, no em dashes, no Tech Radar, etc.)
- Keeps the 5-lane information architecture and the four required states

## Anti-prompt (what NOT to do mid-conversation)

If Claude Design starts wandering during the conversation, paste back the relevant rule:

> **Logo PNGs are locked — do NOT propose, attempt, or render any SVG version of the logo. If you generate one, the entire response will be rejected.**

This has happened twice on prior projects (memory: `claude-design-redo-logo-loop`). Soft instructions get ignored. Hard prefix at every turn works.

## After Claude Design returns

1. Save returned mockups to `kanban/design-artefacts/2026-05-08/dashboard-design-bundle/output/`.
2. Implementation handoff prompt already drafted at `kanban/1_planning/PROMPT_2026-05-08_codex-student-dashboard-port.md` — refresh it with the chosen mockup, then run `/build` or hand to Codex/another Claude session.
3. Beads issue: `beads_GWTH-bza.11`. Update with the chosen direction, close on production port.
