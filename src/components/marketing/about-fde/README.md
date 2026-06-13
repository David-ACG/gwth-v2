# about-fde

About page (`/about`) in the FDE journal register, the homepage direction
David chose on 2026-06-12 (see `../home-fde/`). Follows the `../labs-fde/`
pattern; fifth inner page ported.

- `about-fde.tsx` — server component: drenched teal masthead, prose intro
  with a bordered founder-note aside, numbered principle and process lists
  with journal rules, ruled stat columns, closing band. Two lines of meta
  copy from the gwth-redesign version (references to "this redesign" and
  "the handoff bundle") were dropped because they no longer make sense once
  FDE is the live design.
- `about-fde.module.css` — scoped `--v-*` palette on `.shell` with a
  `:global(.dark)` override block, mirroring `labs-fde.module.css`.

The page (`src/app/(public)/about/page.tsx`) renders this module directly.
