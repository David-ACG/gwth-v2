# lessons-fde

Lessons page (`/lessons`) in the FDE journal register, the homepage direction
David chose on 2026-06-12 (see `../home-fde/`). Second inner page ported to
the new theme, following the `../labs-fde/` pattern.

- `lessons-fde.tsx` — server component: drenched teal masthead, three month
  cards with colour-block tops keyed to month (teal = Month 1, moss = Month 2,
  rust = Month 3, matching the labs difficulty colours), numbered
  how-it-works list, the 5-Hour Rule essay, closing band.
- `lessons-fde.module.css` — scoped `--v-*` palette on `.shell` with a
  `:global(.dark)` override block, mirroring `labs-fde.module.css`.

The page (`src/app/(public)/lessons/page.tsx`) renders this module directly;
course-structure data comes from `MONTH_CONFIGS` in `lib/config.ts`.
