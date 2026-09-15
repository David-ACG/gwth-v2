# about-fde

About page (`/about`). The file keeps its `-fde` name so every import stays
put, but the register it is drawn in is the current one (bible
`paper-first-register` and its siblings), not the retired FDE journal.

- `about-fde.tsx` — server component: quiet masthead, prose intro plus the
  British worked-example panel, the founder note in its own section, numbered
  principles, the UK context section, the course stat columns, closing band.
- `about-fde.module.css` — scoped layout on `.shell`; all colour from the
  `--v-*` tokens, no raw hex.

The page (`src/app/(public)/about/page.tsx`) renders this module directly.

## Rebuilt 2026-09-14 (bead `gwth-launch-88z.32.24`)

Three of David's `/about` annotations, applied together:

- `a-20260914-205610-1de94a` — the promise in his own words: "The promise is
  simple. We help you stop watching AI change the world and start building
  with it."
- `a-20260914-210202-2fba31` — the founder note rewritten from the biography he
  supplied. It is grounded ONLY in that: no employer, client or product is
  named, there is no first-use date, and there is no universal claim such as
  "every model", because none of those are supported by a canonical source.
- `a-20260914-210609-f7fdc8` — UK relevance carried in four distinct ways
  (intro paragraph, worked-example panel, principle 05, the UK context
  section) rather than one passing clause.

## Sources for the UK context section

Every figure on this page is attributable to one of these, checked
2026-09-14. Refresh the copy when a newer release lands.

| Claim | Source |
|---|---|
| "third largest AI market in the world"; DeepMind, Arm, Wayve; risk of falling behind the USA and China; national champions at the frontier | [AI Opportunities Action Plan](https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan) (DSIT) |
| 5,862 AI companies, 95% of them SMEs | [Artificial Intelligence sector study 2024](https://www.gov.uk/government/publications/artificial-intelligence-sector-study-2024/artificial-intelligence-sector-study-2024) (DSIT) |
| around 35% of businesses with 10+ staff using AI in June 2026, against around 12% in late 2023; average of about 1.6 AI technologies per adopting business | [ONS, Artificial intelligence in UK businesses: 2023 to 2026](https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/articles/artificialintelligenceinukbusinesses/2023to2026) (published 20 July 2026) |

What the evidence does NOT support, and what this page must therefore never
say: that the UK has no large AI companies, that it has no model providers, or
that AI education is the cheapest way for the country to catch up. The first
two are contradicted by the Action Plan itself, which names UK-based firms; the
third is a superlative nobody has measured. `about-fde.test.tsx` fails the
build if any of them creeps back in.
