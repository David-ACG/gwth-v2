# for-teams-fde

For teams page (`/for-teams`), in the paper-first register (the `-fde` name is
history; every import stays put).

Who it is for: a manager or company buying places on the standard GWTH course
for a team. Everyone takes the same course; places are paid per person,
monthly or once (the one-off place is bought on the gift page). A professional
body or an organisation that wants its own edition, with its own choice of
lessons and the /org admin screens, is the /for-institutions page, and the two
pages link to each other.

- `for-teams-fde.tsx`: server component. Takes `selling` (isSelling(), only
  the buttons branch on it) and `showScore` (ENABLE_GWTH_SCORE; the score item
  shows only while it is on). Prices come from config and lib/billing/passes,
  month names and core counts from MONTH_CONFIGS, opening dates from
  LATER_MONTHS_OPEN. No optional-lesson count is ever printed.
- `for-teams-fde.module.css`: scoped styles on the `--v-*` tokens from
  globals.css. No tinted card tops.

The page (`src/app/(public)/for-teams/page.tsx`) reads isSelling() per request
and renders this module. Its test (`for-teams.test.tsx`) pins David's
annotations from 2026-09-14 and the launch readiness fixes of 2026-10-21.
