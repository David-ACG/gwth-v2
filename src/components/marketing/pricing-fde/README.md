# pricing-fde

Pricing page (`/pricing`). The directory keeps its `-fde` name so every import
stays put, but the register it is drawn in is the CURRENT one, paper-first
(bible `paper-first-register` and siblings). The FDE journal styling it was
first built in, drenched teal masthead, colour-block card tops, ochre featured
border, is retired; do not restore any of it from this directory's history.

- `pricing-fde.tsx` — server component: quiet two-column masthead, three tier
  cards, comparison table, the teams-and-institutions split, closing band.
  Every price comes from the canonical `PRICING` data in `../data.ts` and from
  `lib/config.ts`, so copy cannot drift from config. Its header comment lists
  David's six /pricing annotations of 2026-09-14 and what each one changed.
- `pricing-fde.module.css` — scoped to the `--v-*` paper-first tokens; no raw
  hex, no retired brand colour.

The page (`src/app/(public)/pricing/page.tsx`) renders this module directly.
Its test (`../../../app/(public)/pricing/pricing.test.tsx`) asserts the tier
headings, prices, CTAs, the comparison table, and one guard per annotation.
