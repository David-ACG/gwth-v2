# home-fde

The production GWTH homepage (`/`), in the FDE journal register David chose
on 2026-06-12 (design basis: the FDE.build journal mockup at
http://192.168.178.50:3010/). Drenched dark-teal hero with a stacked Source
Serif 4 headline and ochre accents, paper-cream surfaces, colour-block card
tops, mono metadata, pull quote, curriculum as journal issues, and a teal
dispatch band for pricing. Palette is scoped to the page via custom
properties with a `.dark` override block.

This module is the register's source of truth: the inner public pages
(`/labs`, `/lessons`, `/pricing`, `/for-teams`, `/about`, `/news`) copy its
`.shell` palette and idioms via their own `*-fde` modules. It started as
homepage comparison variant B at `/home-fde`; that review route and the
`/home-claude` variant were deleted when this design went live at `/`.
