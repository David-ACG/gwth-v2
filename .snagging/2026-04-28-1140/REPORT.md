# Snag review — 2026-04-28-1140

Source: `kanban/2_testing/PROMPT_2026-04-27_phase-1b-C-polish-deploy.md` (Gate 4 checklist) + David's free-text feedback + annotator drop.
Verification URL: http://192.168.178.50:3001/
Plan-start commit: `afb7d82`. Final commit: `a68284a`.

## Fixed (11)

- Snag 1 — Navbar wordmark using cropped GWTH.ai PNGs (theme-aware) — `35b7833`
- Snag 2/3 — Hero body copy split into 3 paragraphs + "every lesson and project" + score reference — `3f112ae` → `4f39ea4`
- Snag 4 — Journey grid expanded to 9 cards (3+3+3), stats in tinted callouts, dropped messy in-card CTAs, added Proof + Keeping up — `ef6970a`
- Snag 5 — Hero device URL bar `gwth.ai/dashboard` → `gwth.ai/score` — `a68284a`
- Snag 6 — ResearchStrip "Built around UK research" no longer mono-uppercase — `a68284a`
- Snag 7 — Journey heading "Different reasons. Same course." — `a68284a`
- Snag 9 — ProductPillars H2 "Plain English." (dropped dangling "in.") — `a68284a`
- Snag 10 — Curriculum row CTA "Lessons" (was "View the curriculum") — `a68284a`
- Snag 11 — Zapier removed from copy — `a68284a`

## Skipped / blocked (3 — archived to beads, reopenable)

- Snag 8 — Pills → real images (David sourcing assets) — `beads_GWTH-7bu` (closed, archival reason logged)
- Journey copy refinement pass (vague — needs gold-standard direction) — `beads_GWTH-3j7` (closed)
- ProductPillars feels unpolished (broad concern) — `beads_GWTH-sel` (closed)

David archived all 3 open beads on this session — pivoting to `/impeccable` for UI polish instead of snag iterations. Reopen with `bd update <id> --status=open` if impeccable doesn't address them.

## Reverted (1)

- The first BrandWordmark attempt using the canonical 1024×1024 PNGs rendered as a tiny boxed wordmark on light theme. Reverted in `b453c10` before David supplied the cropped variants.

## Assumptions made

- Cropped wordmark size: chose `h-7 sm:h-8` (~28-32px) inside the h-16 nav. Wordmark width auto-derived from ~5:1 aspect.
- Journey grid layout: chose 3+3+3 over 3+3+1+2 (a row of 2 in a 3-col grid is awkward). Demoted Team lead from full-width.
- Card 7 (Proof) intentionally has no stat — would clash with the "104" example score in the hero device.
- Hero copy structure: 3 paragraphs (`mt-6 / mt-4 / mt-4`) — capabilities / score reference / trust line. Two paragraphs would still feel dense.
- ProductPillars CTA: David said "Change this to Lessons" — used "Lessons" verbatim despite preferring a verb. Followed his wording.
- Zapier removal: dropped from both copy spots without replacement (rather than swap in Make.com, which we may also lack lessons for).

## Compromises

- Pills stay until images arrive (functional pills are exempt from the eyebrow-pill ban — they're persona labels, not decorative section setup).
- Marketing-snapshots Playwright baselines are now stale (homepage layout changed substantially). Did NOT regenerate — they're locally-baselined PNGs and will need `--update-snapshots` on the next `/build` cycle.
- Existing 7 journey cards' body copy was NOT autonomously refined — David flagged the inconsistency but no specific direction. Filed `beads_GWTH-3j7` (now closed).

## Weaknesses

- "ProductPillars feels unpolished" persists. Three specific angles (vis inconsistency / copy density / spacing) listed in `beads_GWTH-sel` (closed). `/impeccable` should address.
- Hero column may be tall enough on smaller laptops to push the device mock below the fold (3 paragraphs of body copy added height). Captured 1440×900 staging shots show it still fits, but a 1280-wide laptop hasn't been tested.
- New cards (Proof, Keeping up) haven't had David's eye for copy quality — they were drafted from his free-text outline, not edited line-by-line.

## Suggested follow-ups (non-beads)

- Regenerate marketing-snapshot Playwright baselines on the next `/build` cycle.
- Confirm `/score` route exists / will exist (the URL bar mock now references a route not yet documented in the app).
- Consider whether the journey grid's 9 cards is still scannable — adding 2 cards bumped section height noticeably.
