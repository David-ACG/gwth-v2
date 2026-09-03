# The paper-first register (live from N12, 2026-09-03)

**This supersedes `DESIGN_FDE.md` sections 1 and 2 for every new or rebuilt
web surface.** The decision record is annex 15 of the institution plan
(`GWTH-launch-plan/Institution - Fable Plan/15-design-round-register.md`, David's
interactive N9 round of 2026-09-01/02) and the binding rules are the
`paper-first-*` items in `GWTH-launch-plan/bible/bible.yaml`. This file says
where the register lives in THIS repo and what state each surface is in. It
does not restate the rules; read the bible items.

## Where it lives

| What | Where |
|---|---|
| The `--v-*` tokens, light and dark, ONCE | `src/app/globals.css` (`:root` and `.dark`). No module re-declares them. |
| The retired FDE names (`--v-teal`, `--v-ochre`, `--v-cream`, `--v-action`, ...) | Gone. Every reference in `src` was renamed to the token it stood for (`--v-teal` to `--v-quiet`, `--v-teal-deep` and `--v-action` to `--v-btn`, `--v-ochre` / `--v-rust` / `--v-dash-active` to `--v-accent`, `--v-cream` to `--v-ink`, `--v-cream-muted` to `--v-soft`, `--v-hero-line` / `--v-dash` to `--v-line-soft`). A `--v-*` name that is not in `globals.css` or declared locally by the module using it is a bug. |
| shadcn tokens (`--background`, `--primary`, `--border`, ...) | Remapped in the same file into the green family, so dashboard, admin, org and auth pick up the palette through Tailwind. |
| Fonts | `src/app/layout.tsx` loads Bitter (`--font-bitter`), Public Sans (`--font-public-sans`) and JetBrains Mono (`--font-jetbrains`, monospaced CONTENT only). `globals.css` maps them to `--font-serif`, `--font-sans`, `--font-mono` and sets `body` to sans and `h1..h4, blockquote` to serif by default. |
| Corners | `--radius` is 10px: `var(--radius-lg)` panels, `var(--radius-md)` 8px controls and images, `var(--radius-sm)` 6px chips. |
| Shared marketing recipes | `src/components/marketing/paper/paper.module.css` (shell, page, buttons, section head, cards, feature rows, plates, FAQ, bands) and `paper/plate.tsx` (a light render plus its dark-ground twin). |
| Plates (images) | `public/home/paper/<name>.png` and `<name>-dark.png`, 1376x768, the I2 stripped register. The dark file is an image-to-image edit of the light one (only the ground changes). Never overwrite: archive dated. |

## Rules that are easy to get wrong here

- **No raw hex in components or modules.** Every colour is a `--v-*` token.
- **A boundary is `--v-line`; a decorative divider is `--v-line-soft`.** `--v-line` is the value that clears 3:1 on both surfaces it touches in both modes. If a line tells someone where a panel ends or what is a control, it is a boundary.
- **A selected state is never a tint alone** (M2: quiet fill AND a 3px ink bar AND the label going muted to ink and bolder). Desktop top nav: the bar sits along the bottom edge; vertical menus: the left edge.
- **The one button.** `--v-btn` fill in both modes, label from `--v-btn-text` (near-black in both, not the same hex). No dark-filled primary in light mode.
- **Images carry the colour.** No frame, no tint overlay, 8px radius. No words in an image, no title in an image; a multi-focus image is labelled by the page in its own pattern (X6), and that key never collapses to fewer columns.
- **Sentence case everywhere.** No mono kickers, no small-caps metadata, no uppercase tracking on labels or buttons.
- No em dashes, en dashes or section signs in displayed copy. GBP only.

## Surface status after N12

| Surface | State |
|---|---|
| Public nav, footer, home page, `/for-institutions` | **Rebuilt** to the register and the N9 artboards. |
| `/for-teams`, `/pricing`, `/lessons`, `/labs`, `/about`, `/contact`, `/newsletter`, `/why-gwth`, legal, news, tech radar, verify, waitlist | **Bridged**: their `*-fde` modules lost the duplicated palette blocks, the retired faces and the mono kicker treatment mechanically (see the N12 packet); layout unchanged. They read in the new family but keep FDE composition: where a module says `.masthead { background: var(--v-quiet) }` there used to be a teal band, and its comments may still say so. Rebuild per page as each is touched, and rename `.mono` classes and `--fde-mono-*` sizes when you do. |
| Dashboard, lesson viewer, course, progress, profile, settings, bookmarks, notifications, guide, admin, org, auth, search palette, state pages | **Bridged** the same way. The lesson viewer's OutlineRail still needs the M2 treatment (bible `paper-first-lesson-viewer`); admin density recipe per `paper-first-admin-density`. |
| Email | Untouched. `paper-first-email` is the recipe when the templates are next edited. |
| Rendered video | Out of scope by the bible until David rules on `video-format`. |
| Logo | Inks re-cut per `paper-first-logo`: wordmark = `--v-ink`, accent = `--v-accent`. Static rasters (`public/logo*.png`, OG image, favicons) still carry the old accents and need regenerating. |

## Checks that must keep passing

- `src/components/layout/public-nav.test.tsx`, `src/components/marketing/home-fde/home-fde.test.tsx`, `src/app/(public)/for-institutions/for-institutions.test.tsx`.
- `src/__tests__/pages/marketing-homepage.spec.ts` (Playwright): sections, the three-across key at 390px, link health, axe.
- The contrast table in bible `paper-first-tokens`. If a token moves, re-measure both modes against both surfaces before shipping (`boundary-contrast-check`).
