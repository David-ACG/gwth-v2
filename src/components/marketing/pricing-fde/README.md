# pricing-fde

Pricing page (`/pricing`) in the FDE journal register, the homepage direction
David chose on 2026-06-12 (see `../home-fde/`). Follows the `../labs-fde/`
pattern; third inner page ported.

- `pricing-fde.tsx` — server component: drenched teal masthead, three tier
  cards with colour-block tops (teal = Free, moss = Member with an ochre
  featured border, rust = Teams), ruled comparison table, teams split,
  closing band. Prices come from the canonical `PRICING` data in
  `../data.ts` so copy cannot drift from `lib/config.ts`.
- `pricing-fde.module.css` — scoped `--v-*` palette on `.shell` with a
  `:global(.dark)` override block, mirroring `labs-fde.module.css`.

The page (`src/app/(public)/pricing/page.tsx`) renders this module directly.
Its test (`pricing.test.tsx`) asserts tier headings, prices, CTAs, and the
comparison table.
