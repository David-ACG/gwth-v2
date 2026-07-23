# labs-fde

Labs landing (`/labs`) in the FDE journal register, reworked to the **Model
Arena** format (W22, David 2026-07-22). A lab is a head-to-head test: two AI
tools run the same real task, outputs shown side by side, a rubric, and a dated
verdict. Labs complement lessons (lessons teach you how; labs show you which
tool when).

- `labs-fde.tsx` — server component: drenched teal masthead with the Model
  Arena framing, a "how it works" explainer row, a **Live now** card row (the
  ~6 labs in rotation), a dated **archive** list (superseded arena labs first,
  then the retired tiered labs kept read-only), and a closing band pointing at
  the course.
- `labs-fde.module.css` — scoped `--v-*` palette on `.shell` with a
  `:global(.dark)` override block, mirroring `home-fde.module.css`.

The page (`src/app/(public)/labs/page.tsx`) fetches live/archived arena labs via
`src/lib/data/model-arena.ts` and the retired tiered labs via
`src/lib/data/labs.ts` (`getLabs`), then passes them down; this module owns
presentation only.

The **detail** pages live at `src/app/(public)/labs/[slug]/` and render with
`src/components/lab/arena/` (`ArenaLabDetail` for the head-to-head, and
`ArchiveLabDetail` for the read-only retired labs). Labs are the free marketing
taster, so the whole `/labs` subtree is public (no login redirect — see
`src/proxy.ts` and bead gwth-launch-bbg).
