# labs-fde

Free Labs page (`/labs`) in the FDE journal register, the homepage direction
David chose on 2026-06-12 (see `../home-fde/`). First inner page ported to
the new theme.

- `labs-fde.tsx` — server component: drenched teal masthead, journal lab
  cards (colour-block tops, lab illustrations, mono metadata), empty state,
  closing band pointing at the course.
- `labs-fde-filter.tsx` — client filter bar (search + category / difficulty
  / technology selects) synced to URL search params.
- `labs-fde.module.css` — scoped `--v-*` palette on `.shell` with a
  `:global(.dark)` override block, mirroring `home-fde.module.css`.

The page (`src/app/(public)/labs/page.tsx`) fetches via `searchLabs` /
`getLabFilters` and passes data down; this module owns presentation only.
