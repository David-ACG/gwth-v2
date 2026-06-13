# for-teams-fde

For Teams page (`/for-teams`) in the FDE journal register, the homepage
direction David chose on 2026-06-12 (see `../home-fde/`). Follows the
`../labs-fde/` pattern; fourth inner page ported.

- `for-teams-fde.tsx` — server component: drenched teal masthead, ruled UK
  stat columns (`UK_STATS` from `../data.ts`), time-cost comparison cards,
  numbered differentiator list, syllabus month cards with colour-block tops
  (teal/moss/rust by month), logistics mini-stats, featured investment card
  (ochre border), FAQ as native `<details>` disclosures (no client JS),
  closing band.
- `for-teams-fde.module.css` — scoped `--v-*` palette on `.shell` with a
  `:global(.dark)` override block, mirroring `labs-fde.module.css`.

The page (`src/app/(public)/for-teams/page.tsx`) renders this module
directly. Its test (`for-teams.test.tsx`) pins headings, pricing copy, the
differentiator titles, and FAQ questions.
