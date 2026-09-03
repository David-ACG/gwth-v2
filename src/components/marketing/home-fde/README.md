# home-fde

The production GWTH home page (`/`), in the paper-first register David chose
in the N9 design round (2026-09-01/02, annex 15 of the institution plan) and
built by N12 on 2026-09-03 to the approved artboard: "The gap is not access.
It is depth." Institution-first, every figure sourced, the six-blocks plate
labelled by the page (X6 key, three across at every width).

- `home-fde.tsx` composes the page; `ARGUMENT` and `SIX_BLOCKS` are exported
  for the tests.
- `home-fde.module.css` holds only what is specific to this page. Shared
  recipes live in `../paper/paper.module.css`; tokens live in
  `src/app/globals.css`. There is no palette block here any more.
- Plates are `public/home/paper/six-blocks*.png` and `the-gap*.png`, light
  plus dark-ground twins, rendered through `../paper/plate.tsx`.
- `explainer-video.tsx` is the 90-second tour embed David placed after the
  hero in W12. It is not on the approved artboard and is not rendered; the
  component is kept for reuse (its audio defect is bead gwth-launch-ps5).

The module name keeps its `-fde` suffix so the other `*-fde` pages and their
tests keep resolving. See `DESIGN_PAPER_FIRST.md` for what state each of
those pages is in.
