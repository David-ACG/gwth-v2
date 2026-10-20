# lessons-fde

Lessons page (`/lessons`) in the paper-first register.

- `lessons-fde.tsx` — server component: two-column masthead, three month cards
  on the card surface (no coloured card tops), when each month opens, the
  optional lessons, a how-it-works list, the score, and a closing band. Takes a
  `selling` prop from the page (`isSelling()`), which only the buttons use.
- `lessons-fde.module.css` — scoped styles on the shared `--v-*` tokens.

The page (`src/app/(public)/lessons/page.tsx`) renders this module directly;
course-structure data and every lesson count come from `MONTH_CONFIGS` in
`lib/config.ts`. The "Why one hour a day?" essay and its picture
(`/five-hour-rule.png`, still on disk) were removed on 2026-10-20.
