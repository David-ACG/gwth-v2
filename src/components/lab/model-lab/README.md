# model-lab

One Model Lab results page, `/labs/<superpower>` (David, 2026-10-21), ported
from the preview he chose (model-bakeoff `lab/site/template.html`).

- `lab-page.tsx` (server): `ModelLabPage`. The six-lab menu, hero, Our picks,
  "Which would you use?", "Every set-up we tested", the premium models (cost
  only, never ranked) and How we test. Markdown (answers, the brief, the
  premium note) is rendered on the server by `lib/model-lab-markdown.ts`, which
  drops raw HTML and makes links and images safe.
- `which-would-you-use.tsx` (client): the four blind answers, the pick and
  the reveal. No visitor vote counts in v1.
- `setup-row.tsx` (client): one table row with its "Answer" toggle. Written
  answers are fetched on open from `/labs/<slug>/answer/<setup>`.
- `model-lab.module.css`: tokens only.

Model-written apps and charts are served from `public/labs-files/` with a
sandbox Content-Security-Policy (`lib/labs-files.ts`) and shown in iframes
with `sandbox="allow-scripts allow-forms allow-modals"`, never
`allow-same-origin`.
