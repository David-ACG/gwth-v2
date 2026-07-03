# Completion: W1 — Finish public site design (auth surfaces → FDE guide)

**Date:** 2026-07-01 · **Repo:** GWTH_V2 · **Commit(s):** on `master` (this packet's commit)
**Test URL:** http://192.168.178.50:3001/login · **Status:** verified

Ported the last student-facing gap — the **auth surfaces** — from the old
shadcn Card / `text-primary` look to the **FDE journal register**
([DESIGN_FDE.md](../DESIGN_FDE.md)), applying David's ratified **Direction C**
("journal masthead + panel"). All six surfaces plus the shared shell now match
the register the rest of the site already ships.

## What changed (re-skin only — behaviour untouched)

- **Shared shell** ([src/app/(auth)/layout.tsx](<../src/app/(auth)/layout.tsx>)):
  a full-width dark-teal **masthead band carrying the GWTH.ai wordmark only**
  (no decorative metadata — the no-clutter rule), over the sage ground; each
  surface renders a bordered **paper-cream panel** with the register's one
  sanctioned **hard-offset shadow** (`5px 5px 0 var(--v-ink)`, no blur).
- **All five surfaces** re-skinned to the register — Source Serif 4 display +
  body, JetBrains Mono metadata, square hairline inputs, teal action buttons,
  ochre focus rings, colour+icon+text error banners: **login**, **signup**
  (invite-only), **forgot-password**, **reset-password** (form + invalid-token),
  **error**. OAuth buttons + divider re-skinned to square outline + mono.
- **Tokens only**, scoped exactly like every other `*-fde` module: one
  `auth-fde.module.css` `.shell` declares the whole `--v-*` palette with a
  `:global(.dark)` override, so the site theme toggle flips the surface. No raw
  hex in components, no changes to `globals.css` / the shadcn token layer.
- **Cleanups** required by the brief: removed the banned decorative
  ShieldCheck-in-a-circle badge from signup; removed the em dash from the
  invite-only copy; **deleted the stale Supabase comment**; CTAs authored
  sentence-case (uppercase comes from CSS); reduced-motion guard added to the
  OAuth spinner.
- **Behaviour is byte-identical** (proven by diff): every `authClient` call,
  zod schema, `react-hook-form` wiring, error branch, redirect target and the
  OAuth handlers are unchanged. The shadcn `Form`/`FormField`/`FormControl`
  accessibility wiring is kept; only the visual chrome swapped to native
  FDE-styled markup (the established `ContactForm` precedent).

## UI

Every surface, light + dark, at the guide's QA widths (1440 / 768 / 412).

**Composition — all surfaces, light | dark (1440):**
![composition](W1/composition-light-dark.png)

**Form states (login is representative) + reset-invalid:**
![states](W1/form-states.png)

**Responsive (1440 / 768 / 412):**
![responsive](W1/responsive.png)

<details><summary>Per-surface stills (desktop light / desktop dark / mobile)</summary>

| Surface | Desktop light | Desktop dark | Mobile |
|---|---|---|---|
| Login | ![](W1/login-desktop-light.png) | ![](W1/login-desktop-dark.png) | ![](W1/login-mobile-light.png) |
| Signup (invite-only) | ![](W1/signup-desktop-light.png) | ![](W1/signup-desktop-dark.png) | ![](W1/signup-mobile-light.png) |
| Forgot password | ![](W1/forgot-desktop-light.png) | ![](W1/forgot-desktop-dark.png) | ![](W1/forgot-mobile-light.png) |
| Reset password | ![](W1/reset-desktop-light.png) | ![](W1/reset-desktop-dark.png) | ![](W1/reset-mobile-light.png) |
| Sign-in error | ![](W1/error-desktop-light.png) | ![](W1/error-desktop-dark.png) | ![](W1/error-mobile-light.png) |

</details>

**Test it live** — deployed and verified on P520 staging:
`http://192.168.178.50:3001/login`, `/signup`, `/forgot-password`,
`/reset-password`, `/error`. All five render the FDE register in light +
dark with a clean console, and the auth round-trip is live-verified (a bad
email/password returns the exact `401 Invalid email or password` the login
form maps to the rust banner).

> Deploying this required an unrelated pre-existing build fix (committed
> separately as `fix(build): exclude the standalone remotion/ sub-project`):
> the W12 Remotion renderer (`remotion/`, its own tsconfig + node_modules)
> was being swept into `next build`, which then failed to resolve
> `@remotion/cli/config` under `npm ci` — so every Docker build of master
> had been broken since the W12 explainer landed, stranding `:3001` on a
> 7-day-old image. Excluding the sub-project restores reproducible builds.

### Review fixes (David, /verify/W1, 2026-07-03)

- Signup copy: dropped the stale "23 June" date (panel + page metadata).
- `/error` and the root 404 secondary action: "Go home" → "Home".
- Auth masthead logo accent: **mustard** (`--v-ochre-bright` #d4a062).
  David compared mustard vs the terracotta brand accent on the teal band
  across two review rounds and picked mustard; terracotta `--logo-accent`
  stays canonical on light/sage grounds (public nav, score page).
- Favicon set replaced: old spiral → **G-with-arrow brand mark, V1
  "Masthead match"** (picked from a 5-variant demo sheet): teal #2c4a47
  ground, cream G, mustard arrow — `icon.svg`, `favicon.ico` (16/32/48),
  `apple-touch-icon.png` (180). The teal ground reads on light and dark
  tab bars. Browsers cache favicons hard: hard-refresh or a fresh tab may
  be needed to see it.
- Two more clean-build bugs found and fixed en route (same root cause as
  the remotion fix — the dev tree had uncommitted state master needed):
  `fix(fonts)` committed the Source Serif 4/Sans 3 loaders (clean builds
  rendered every FDE surface in Inter), and `fix(brand)` committed the
  locked `--logo-wordmark`/`--logo-accent` vars (undefined in an SVG fill
  computes to black, so clean builds shipped a black logo arrow site-wide).

## Structure (how the re-skin is scoped — no backend/schema/infra change)

Pure front-end re-skin. No DB, API, auth-provider or route change. The register
is delivered by a scoped CSS-module shell, exactly like the other flipped
surfaces:

```mermaid
flowchart LR
  L["(auth)/layout.tsx<br/>masthead + centred panel column"] --> M["auth-fde.module.css<br/>.shell = whole --v-* palette<br/>+ :global(.dark) override"]
  M --> S1[login-form.tsx]
  M --> S2[signup-form.tsx]
  M --> S3[forgot-password-form.tsx]
  M --> S4[reset-password/page.tsx]
  M --> S5[error/page.tsx]
  M --> S6[oauth-buttons.tsx]
  S1 -. unchanged .-> A["authClient (Better Auth)<br/>+ zod + react-hook-form"]
  S3 -. unchanged .-> A
  S4 -. unchanged .-> A
  S6 -. unchanged .-> A
```

Why it's safe: `globals.css` and the shadcn/Tailwind token layer are untouched,
so Stone & Sage surfaces are pixel-identical; the theme toggle just works
because the scoped `:global(.dark) .shell` re-maps every token. Auth logic is
unchanged (diff-verified), so W11's verified sign-in round-trip is preserved.

## What David should verify

- [ ] Open [/login](http://192.168.178.50:3001/login), toggle dark mode
      (system theme) — masthead, paper panel + offset shadow, mono labels and
      teal button read correctly in both; then click **Sign up**, **Forgot
      password?**, and confirm [/signup](http://192.168.178.50:3001/signup)
      shows the invite-only panel (no create-account fields).
- [ ] Sign in with a test account end-to-end (Google / GitHub / LinkedIn, or
      email) → lands on `/dashboard`; and a bad email/password shows the
      rust "Invalid email or password" banner (behaviour unchanged from W11).
- [ ] Spot-check [/error?error=access_denied](http://192.168.178.50:3001/error?error=access_denied)
      and [/reset-password](http://192.168.178.50:3001/reset-password) (no
      token → "Reset link invalid") render in the register.

## Verification run

```
npx tsc --noEmit                         → exit 0 (clean)
npx eslint src/components/auth src/app/(auth)  → exit 0 (clean)
npx vitest run                           → 298 passed | 11 skipped (45 files)
Playwright matrix (localhost dev)        → 66/66 screenshots (5 surfaces ×
                                            states × light/dark × 1440/768/412)
Playwright console check                 → ALL CLEAN (6 routes × light+dark)
Adversarial review (3 lenses + verify)   → 1 minor confirmed (reduced-motion
                                            on OAuth spinner) → fixed
Logic diff (auth onSubmit/authClient)    → unchanged (re-skin proven)

Docker build (clean master, Dockerfile)  → succeeds after the remotion fix
Deployed to :3001 (deploy/run-staging.sh)→ gwth-v2-w8-beta up, /login 200
:3001 Playwright console (5 routes × L/D) → ALL CLEAN
:3001 auth round-trip (POST sign-in/email)→ HTTP 401 "Invalid email or
                                            password" (server + DB wired;
                                            valid creds are David-only)
```
