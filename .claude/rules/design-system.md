---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.css"
  - "src/app/globals.css"
---

<!-- SENTINEL: rule=design-system, salt=ds-9P4m -->

# Design System

Superseded twice: Stone & Sage (OKLCH, Inter, rounded, shadows) on 2026-06-12, and the FDE journal register (Source Serif 4, JetBrains Mono, teal bands, square corners) on 2026-09-03 by the **paper-first register** David picked in the N9 design round.

For every component or CSS edit, read `DESIGN_PAPER_FIRST.md` in this repo and the `paper-first-*` items in the GWTH style bible at `/home/david/projects/GWTH-launch-plan/bible/bible.yaml`. The decision record is `GWTH-launch-plan/Institution - Fable Plan/15-design-round-register.md`.

Binding summary: Bitter for headlines and the italic accent, Public Sans for everything else (monospace only for code), one green family and one ink from the `--v-*` tokens in `src/app/globals.css` (never raw hex), the one mint button with the same fill in both modes, soft corners (10px panels, 8px controls and images, 6px chips), hairlines not shadows, no gradients, no colour bands or coloured card tops, no mono kickers or uppercase labels, sentence case, a selected state never carried by a tint alone (M2: tint plus 3px ink bar plus the label to ink and bolder), every boundary in `--v-line` (3:1 on both surfaces, both modes), images with no frame and no words in them, no em or en dashes, GBP only, and light plus dark as one system.
