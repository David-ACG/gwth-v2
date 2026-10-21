# labs-fde

The Model Lab index at `/labs` (David, 2026-10-21, option A), paper-first
register. It replaced the Model Arena listing: every new AI model gets the same
real UK work tasks in six labs (research, content, thinking, building, data,
automation), marked by computer checks and AI judges.

- `labs-fde.tsx`: server components. `LabsFde` is the page (masthead, a short
  "How we test", the six lab cards with each lab's question, best pick and
  best value, the cost-and-score chart, and the closing band). `CostChart` is
  the chart: one row per set-up, its list-price cost of running every scored
  task as a bar with the figure printed at its end, and its average score
  across the six labs; premium set-ups have their own bar colour and the word
  "premium".
- `labs-fde.module.css`: layout only; every colour is a `--v-*` token.

The page (`src/app/(public)/labs/page.tsx`) reads `getModelLabIndex()` from
`src/lib/data/model-lab.ts`, which serves the JSON written by model-bakeoff's
`lab/site/export_gwth.py`. The lab pages themselves are in
`src/components/lab/model-lab/`.
