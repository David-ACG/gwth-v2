# home-fde

The production GWTH home page (`/`), in the paper-first register David chose
in the N9 design round (2026-09-01/02, annex 15 of the institution plan) and
built by N12 on 2026-09-03 to the approved artboard. It opened on "The gap is
not access. It is depth."; the headline is now "Learn to use AI at work by
making things." and the page is individual-first (2026-09-15). The hero plate
is `what-you-make`, a flagship picture that letters its own labels, which
replaced the six-blocks legend and the X6 key the page used to render under it
(bead gwth-launch-88z.32.12).

- `home-fde.tsx` composes the page; `ARGUMENT` and `SIX_BLOCKS` are exported
  for the tests.
- `home-fde.module.css` holds only what is specific to this page. Shared
  recipes live in `../paper/paper.module.css`; tokens live in
  `src/app/globals.css`. There is no palette block here any more.
- The plate is `public/home/paper/what-you-make*.png`, light plus a
  dark-ground twin, rendered through `../paper/plate.tsx`. The superseded
  `six-blocks*.png` and `the-gap*.png` stay in that folder unreferenced rather
  than being deleted.
- `explainer-video.tsx` is the 90-second tour embed David placed after the
  hero in W12. It is not on the approved artboard and is not rendered; the
  component is kept for reuse (its audio defect is bead gwth-launch-ps5).

The module name keeps its `-fde` suffix so the other `*-fde` pages and their
tests keep resolving. See `DESIGN_PAPER_FIRST.md` for what state each of
those pages is in.
