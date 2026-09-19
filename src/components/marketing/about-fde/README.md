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

Moved out of this page on 2026-09-19 (bead `gwth-launch-88z.32.25`). Every UK
figure the whole site renders now lives in
[`src/lib/data/uk-ai-context.ts`](../../../lib/data/uk-ai-context.ts), with the
publisher, the release date and the URL on each one. This page reads them with
`ukFigure()` and supplies only the argument around them.

That move happened because this table was not enough. While it sat here,
`/why-gwth` printed a different and older set of numbers about the same
country (one in six businesses "as of mid-2025", and the government's
£400 billion projection attributed to a publication that never carried it),
and nothing could see the contradiction because neither page could see the
other. `src/__tests__/marketing/uk-thread.test.tsx` now checks every marketing
surface at once: a rendered figure must match the module, its source must be
linked on the same page, and no live marketing file may hard-code a value the
module owns.

To refresh a figure, edit the module. Do not add a number to this page.

What the evidence does NOT support, and what NO page may therefore say: that
the UK has no large AI companies, that it has no model providers, or that AI
education is the cheapest way for the country to catch up. The first two are
contradicted by the Action Plan itself, which names UK-based firms; the third
is a superlative nobody has measured. The patterns are declared as
`UNSUPPORTED_UK_CLAIMS` in the shared module and are asserted against every
marketing surface, not just this one.
