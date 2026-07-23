# lab/arena

Detail views for the **Model Arena** lab format (W22, David 2026-07-22),
consumed by the public route `src/app/(public)/labs/[slug]/page.tsx`.

- `arena-lab-detail.tsx` — `ArenaLabDetail`: the head-to-head layout for a
  `ModelArenaLab`. Teal matchup header (both tools with exact model ids and how
  they were run, plus the tested-on date), the task brief, the shared prompt,
  the two outputs verbatim side by side (stacked on mobile, never a horizontal
  scroll), a beginner rubric, the dated verdict with its freshness note, and
  try-it-yourself steps. Archived labs carry a clear archived banner; their
  content is never rewritten.
- `archive-lab-detail.tsx` — `ArchiveLabDetail`: read-only view of a retired
  tiered-format `Lab`, kept as part of the archive. Renders the lab's original
  outcomes and instructions unchanged, behind an archived banner, with no
  interactive step tracker.
- `arena-detail.module.css` — shared scoped `--v-*` FDE palette on `.shell`
  with a `:global(.dark)` override, mirroring `home-fde.module.css`.

Data comes from `src/lib/data/model-arena.ts` (arena labs, from the L23 JSON
fixtures) and `src/lib/data/labs.ts` (retired tiered labs). Outputs are shown
exactly as generated, including each tool's own markdown markers and
punctuation, because judging that raw text is part of the lab.
