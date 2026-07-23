# Model Arena labs — STAGING for W22

This folder is **staged content only**. It is not wired into the site yet, and
nothing here is imported by the app, so it does not change what `/labs` renders
today. It is authored by launch-board task **L23** and handed to task **W22**,
which owns the `/labs` rework.

## What is here

- `MODEL_ARENA_TEMPLATE.md` — the reusable lab format and authoring guide.
- `model-arena.schema.json` — the machine-readable content schema.
- `lab-01-job-advert-claude-vs-chatgpt.json` — the pilot lab as structured data.
- `lab-01-job-advert-claude-vs-chatgpt.md` — the pilot lab as a student reads it.

## Where the live labs source is today

`/labs` currently reads `src/lib/data/m1-labs.ts` (the fallback set
`mockLabs = m1Labs`, consumed by `getLabs()` in `src/lib/data/labs.ts`) until
the Drizzle/Postgres path is populated. Those are the retired tiered-difficulty
labs. Do not edit `1_gwthpipeline520/data/generated_lessons/labs`; it is a stale
mirror (bead gwth-launch-a68).

## For W22

- Build the new `/labs` landing and the side-by-side lab detail page around the
  Model Arena schema in `model-arena.schema.json`. The pilot JSON is a ready
  fixture to render against.
- Keep the retired tiered labs as the **archive**; do not delete them.
- L23 deliberately did **not** touch the labs pages or the `Lab` type. The UI,
  the data model choice (extend `Lab`, or add a `ModelArenaLab` model + table),
  and the archive treatment are yours to decide.
- House rules in `MODEL_ARENA_TEMPLATE.md` are binding: British English, no em
  dashes in authored prose, verbatim model outputs with exact versions and date.
