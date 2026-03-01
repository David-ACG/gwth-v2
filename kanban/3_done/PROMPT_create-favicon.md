# Task: Create favicon from GWTH spiral logo

## What to change

Set up a proper favicon for gwth.ai using the existing spiral logo design (`public/logo-spiral.svg`), matching how agilecommerce.ai serves its favicon (SVG icon with fallbacks).

## Context

- agilecommerce.ai uses an SVG favicon: `<link rel="icon" href="/icon.svg" type="image/svg+xml">`
- GWTH already has `public/logo-spiral.svg` — a 512x512 7-blade pinwheel in the GWTH color palette (Deep Teal → Teal → Mint → Aqua Green → Primary Aqua → Sky Blue → Indigo Blue)
- The current `src/app/favicon.ico` is the default Next.js favicon and needs replacing

## Steps

1. Create `public/icon.svg` — a favicon-optimized version of `logo-spiral.svg`:
   - Keep the same 7-blade design and colors
   - Set viewBox to `0 0 32 32` and simplify the path if needed for small sizes
   - Ensure it looks crisp at 16x16 and 32x32

2. Generate `src/app/favicon.ico` — convert the spiral to a multi-size .ico file (16x16, 32x32, 48x48) for legacy browser support. Use sharp or a CLI tool if available, or create a simple SVG-to-ICO pipeline.

3. Create `public/apple-touch-icon.png` — 180x180 PNG with the spiral on a solid background (use the dark teal `#0F2624` or white `#FFFFFF` background, whichever looks better)

4. Update `src/app/layout.tsx` metadata to include proper icon links:
   ```tsx
   icons: {
     icon: [
       { url: "/icon.svg", type: "image/svg+xml" },
       { url: "/favicon.ico", sizes: "any" },
     ],
     apple: "/apple-touch-icon.png",
   },
   ```

## Files likely affected
- `public/icon.svg` (create)
- `src/app/favicon.ico` (replace)
- `public/apple-touch-icon.png` (create)
- `src/app/layout.tsx` (update metadata)

## Acceptance criteria
- [ ] SVG favicon renders the GWTH spiral clearly at browser tab size (16x16)
- [ ] `favicon.ico` exists with at least 32x32 resolution
- [ ] Apple touch icon exists at 180x180
- [ ] Layout metadata references all three icon formats
- [ ] `npm test` passes after changes
- [ ] Favicon visible in browser tab when running `npm run dev`

## Notes
- Reference the agilecommerce.ai approach: SVG as primary, .ico as fallback
- The GWTH spiral colors are: `#0D4F4F`, `#0E7C7B`, `#1CBA93`, `#22D3A7`, `#33BBFF`, `#5B9BF5`, `#4A6CF7`
- The existing `public/logo-spiral.svg` blade path: `M-10,0 C-48,-58 -108,-138 -72,-196 C-38,-186 -18,-108 10,-38 C18,-14 10,0 -10,0`
