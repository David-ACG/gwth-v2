# Phase 1a outcome — 2026-04-27

**Decision:** Variant 1 (G-arrow logo + Direction B layout) wins.

## What was compared

| | V1 — chosen | V2 — rejected |
|---|---|---|
| Logo | Locked G-arrow PNG wordmark (Phase 0 deliverable) | Multi-blade windmill SVG icon + GWTH.ai text |
| Journey grid | Mint + aqua accents | 7 distinct windmill blade colours |
| Design layout | dirB (Stripe/Supabase-flavoured) — same in both | Same |

V2 preserved at `variant-2-windmill/` as a rejected alternative — do not delete.

## Why V1

- David's words: *"I definitely like the new logo and design of Variant 1."*
- Means the Phase 0 favicon set stays as-is (no realfavicongenerator redo).
- Means the brand brief §6 vector deferral (now Phase 3) still applies — V1 is locked PNG.
- Multi-colour blade approach was an option, not a must-have. V1's dual-accent (mint + aqua) is sufficient.

## Source-of-truth artefacts for Phase 1b implementation

| Artefact | Use |
|---|---|
| `variant-1-garrow/components/dirB.jsx` | Section structure, JSX composition, copy |
| `variant-1-garrow/components/data.js` | Real curriculum, real pricing, real nav, real journey copy |
| `variant-1-garrow/styles.css` | Design tokens (`--ink-*` ramp, `--mint-*`, `--aqua-*`) |
| `variant-1-garrow/styles-dirB.css` | Section-specific styles |
| `variant-1-garrow/styles-extras.css` | Hero stats, research grid, 3-tier pricing, curriculum capstone |
| `variant-1-garrow/assets/logo-on-{dark,light}.png` | Wordmark (use `public/logo*.png` instead in production) |

## Phase 1b porting notes

- Map `--ink-*` ramp + `--mint-*`/`--aqua-*` tokens onto the existing Tailwind v4 token system in `src/app/globals.css` rather than re-importing the full stylesheet
- The `.btn--primary`/`.btn--accent2`/`.btn--ghost` system maps onto existing `<Button>` variants from shadcn — port as variants, not as parallel CSS
- Keep `theme-light`/`theme-dark` driven by `next-themes` (already wired)
- Real routes already exist (`/labs`, `/lessons`, `/pricing`, `/for-teams`, `/about`) — link to them
- Preserve `<WaitlistForm />` from `src/components/landing/waitlist-form.tsx` — don't reimplement
- Keep JSON-LD structured data block from current `page.tsx`
- New components go under `src/components/marketing/` per beads `w5y` description
- Curriculum vis can render real data from `src/lib/config.ts` `MONTH_CONFIGS`
