---
name: GWTH.ai
description: Pointer only. The GWTH design system is the paper-first register; its tokens and rules are not restated here.
design-authority: canonical-pointer
---

# GWTH.ai design system: read the paper-first register

This file used to carry the pre-FDE aqua/mint token set. Design tools that
auto-load a `DESIGN.md` (for example the impeccable skill) were picking those
retired tokens up as current, so the old file was archived verbatim on
2026-09-13 to `docs/archive/DESIGN.pre-paper-first.2026-09-13.md` (bead
gwth-launch-88z.8.1) and replaced by this pointer.

For any UI, component, CSS, email, image or video work:

1. Read `DESIGN_PAPER_FIRST.md` in this repo: where the register lives in the
   code and which surfaces are rebuilt or bridged.
2. Read the Style Bible items it names in
   `/home/david/projects/GWTH-launch-plan/bible/bible.yaml`. Resolve the
   current items for your surface with:
   `python3 /home/david/projects/GWTH-launch-plan/scripts/bible_authority.py brief --surface website --text`
3. Take every colour from the `--v-*` tokens in `src/app/globals.css`. Never
   sample a colour from gwth.ai: production still runs the older register until
   the paper-first build is approved and published.

`DESIGN_FDE.md` and `docs/stone-and-sage-design-spec.md` are history. Do not
generate a new token list into this file: a second copy of the tokens is how
the old ones outlived their decision.
