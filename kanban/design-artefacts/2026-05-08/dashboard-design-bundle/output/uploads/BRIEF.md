# Claude Design Brief — GWTH.ai Student Dashboard (2026-05-08 refresh)

**Logo PNGs are locked — do NOT propose, attempt, or render any SVG version of the logo. If you generate one, the entire response will be rejected.**

You are Claude Design working on the GWTH.ai 23 May 2026 UK beta launch.

Design the logged-in student dashboard. This is product UI, not a landing page. The dashboard is the learner's home after signup/payment — it must feel like a serious UK applied-AI learning product for adults moving from "I use ChatGPT like Google" toward real applied AI capability.

The home page (gwth.ai/) was redesigned 2026-05-08 in the **E2-E "Stone & Sage" editorial register** locked from `/redesign_v2`. The dashboard must extend that register into product UI — same palette, typography, and tone — but must stop short of being marketing-heroic. Calm, task-first, dense-but-legible.

## 1. Reference assets in this bundle

| File | What to absorb |
|------|----------------|
| `references/01-homepage-full-light.png` | Full home page in light mode. Master visual reference. Note: editorial mast-head, big sans display + italic serif accents, sharp uppercase mono section labels (`SECTION 01 — …`), bordered black-and-white pricing cards, sage-green postscript panel. |
| `references/02-homepage-full-dark.png` | Same in dark. Note: deep warm forest background, warm off-white text, terracotta CTA unchanged across modes. |
| `references/03-score-ticker-light.png` | The locked score-card pattern: share-ticker idiom — big number, terracotta `TOP 1%` pill, green `↗ +49` trend line, `VS 3 MONTHS AGO` label, browser-frame chrome with personalised URL `gwth.ai/score/c67sg#dde5`, QR top-right that encodes the same URL, collapsible "What this score tells an employer" beneath. **Reuse this exact card on the dashboard.** Don't invent a new score visual. |
| `references/04-score-ticker-dark.png` | Score card dark mode. |

## 2. Brand tokens (locked — use exactly)

### Palette — Stone & Sage

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | `oklch(0.965 0.004 75)` warm stone `~#F4F1EC` | `oklch(0.2 0.005 75)` deep warm forest `~#2C2924` | Page surface |
| `foreground` | `oklch(0.22 0.008 75)` charcoal stone `~#39342C` | `oklch(0.94 0.005 75)` warm off-white `~#EFEBE3` | Body text |
| `primary` | `#a94c2e` terracotta | `#a94c2e` (unchanged) | CTAs, current-state, score-tier badge |
| `card` | `oklch(0.99 0.003 75)` near-white warm | `oklch(0.24 0.005 75)` slightly lighter than bg | Panels |
| `muted` / `secondary` | `oklch(0.92 0.005 75)` warm muted stone | `oklch(0.25 0.005 75)` warm dark grey | Sub-surfaces, chips |
| `muted-foreground` | `oklch(0.42 0.012 75)` `~#6A6358` | `oklch(0.72 0.012 75)` `~#B6AE9F` | Labels, subdued copy |
| `border` | `oklch(0.86 0.008 75)` warm beige `~#D6CFC2` | `oklch(1 0 0 / 14%)` subtle white | Dividers |
| `success` | `oklch(0.6 0.18 145)` green | `oklch(0.7 0.16 145)` lighter green | Up-trend pill, completed |
| `destructive` | `oklch(0.577 0.245 27.325)` red | `oklch(0.704 0.191 22.216)` lighter red | Down-trend pill, lapsed |
| `--logo-wordmark` | `#22301f` deep forest | `#edeae6` warm off-white | Logo G + wordmark fill (locked) |
| `--logo-accent` | `#a94c2e` terracotta | `#a94c2e` (same) | Arrow inside G + dots on i and a (locked) |

Both modes use hue 75 (warm/golden). Very low chroma on neutrals so terracotta primary reads boldly against warm stone backgrounds.

### Typography

- **Display + body sans:** Public Sans (CSS var `--font-sans`).
- **Editorial italic serif:** Vollkorn (CSS var `--font-serif`). Used selectively — italic display lines, body paragraphs in editorial sections, pull-quotes. **Not** for h1.
- **Mono:** JetBrains Mono. Used for section labels (`SECTION 01 —`), metadata (citation no., dates), and code-shaped UI (URL bars).
- **Section-label rhythm:** mono uppercase 11px, `tracking-[0.16em]` to `tracking-[0.2em]`, often coloured `var(--variant-warm)` (mustard accent) or `text-muted-foreground`.

### Visual motifs from the home page (carry into the dashboard)

- **Borders, not shadows.** Pricing cards on the home page use `border-2 border-foreground` and butt against each other. Apply the same logic to dashboard panels — borders + dividers, sparing shadows.
- **Section labels in mono uppercase.** Each dashboard panel can carry a `SECTION 01 — Your course` style mono label (without abusing them — 4–5 across the dashboard, not 15).
- **Italic serif accents.** Reserve italic serif for short emphasis: a tagline beside the user's name, a "stable" / "improving" descriptor, the `if you stop` postscript pattern. Use it once or twice on the dashboard, not pervasively.
- **Sharp buttons.** Primary/ghost buttons on the home page are `border-2`, `rounded-none`, uppercase, `font-bold tracking-wider`. Carry the same sharpness into the dashboard — no rounded blobby buttons.
- **Variant utilities** (`variant-drench`, `variant-panel`, `variant-warm-text`, `variant-warm-panel`, `variant-serif`) live in `globals.css` and are scoped to `[data-variant="e2-e"]`. The dashboard layout will likely wrap content in that data-attribute so they apply.

## 3. Hard prohibitions (any one of these = response rejected)

- No SVG logo work. Use the existing PNG wordmark if a logo is shown anywhere.
- No decorative eyebrow pills (small rounded badges sitting alone above headlines). Functional pills (status, tier, filter) are fine.
- No gradient text.
- No side-stripe accents.
- No hero-metric template.
- No fake stats, fake learner counts, fake testimonials, fake company logos.
- No "trusted by" row.
- No modal-first interactions.
- No nested cards (a card inside a card inside a card).
- No UI text explaining how to use the dashboard.
- No em dashes (—) in visible UI copy. Use commas or a colon.
- No "Tech Radar" anywhere on the dashboard. Deferred from beta.
- Do not imply labs affect GWTH Score.
- Do not reinvent the score card. Reuse the share-ticker pattern from `references/03-score-ticker-light.png`.
- Do not introduce aqua / mint / Inter — those were the pre-2026-04-29 register and are dead.

## 4. Product context (launch truth)

GWTH.ai is a UK-focused, beginner-to-advanced applied AI course with a dynamic, verifiable credential called the **GWTH Score**.

- Course starts with ChatGPT basics and moves toward top 1% applied AI capability.
- Month 1: 24 mandatory lessons, target top 30%.
- Month 2: 20 mandatory + 15 optional lessons, target top 10%/5%.
- Month 3: 20 mandatory + 15 optional lessons, target top 2%/1%.
- Course access: £29/month per course month, one month unlocked at a time.
- Stay Current after course access: £7.50/month.
- Labs: public, **unscored**, useful as marketing + bonus learning.
- Lesson completion: intro video watched to 80% AND Q&A passed.
- Capstones: the only manually reviewed learner work.
- Credential verification: public URL + QR code, but project evidence is private by default.

## 5. Required dashboard content

The dashboard must surface these without feeling crammed. Prioritise the first six.

1. Learner name + access state (active paid Month 1 / free / lapsed).
2. **Primary next action** — e.g. "Continue Lesson 13". One CTA, unmistakable.
3. Current month progress (e.g. "13 of 24 lessons in Month 1").
4. **GWTH Score panel** — reuse the share-ticker card from references 03/04. Includes: score number, tier pill, 3-month trend with arrow + delta, period label, QR + verification URL.
5. Credential status + share/download cue.
6. Capstone evidence state: pending / approved / needs changes (when applicable).
7. Public labs, clearly marked **Unscored**.
8. Recent notifications (lesson updates, score-decay reminders).
9. Bookmarks / saved items.
10. Study streak / activity heatmap (simple, not over-rendered).
11. Payment / lapsed prompt (only when relevant).

## 6. Suggested information architecture

Use this 5-lane structure unless a clearly better product layout emerges:

1. **Top task header** — greeting, access state pill, next-action CTA. Compact. Not a hero.
2. **Main learning lane** — current course/month progress, next lesson card, locked future months shown honestly.
3. **Score and credential lane** — the share-ticker score card, credential share cue, currentness/decay warning when needed.
4. **Evidence and labs lane** — capstone evidence status, lab recommendations (Unscored), saved items.
5. **Activity / support lane** — notifications, streak/activity, account prompt only when relevant.

## 7. States to deliver (required)

- **Active paid Month 1 learner** (default, fullest design).
- **Registered/free learner** (no course access — labs + Month 1 teaser + subscribe CTA).
- **Lapsed payment learner** (grace period banner + re-subscribe CTA, score frozen).
- **Mobile 412px** layout for the active learner.

Optional if quota allows:

- Dark-mode active learner.
- Capstone "needs changes" feedback state.

## 8. Current implementation to respect

This will be ported into a Next.js app. The existing implementation has:

- Route: `src/app/(dashboard)/dashboard/page.tsx`
- Layout: `src/app/(dashboard)/layout.tsx`
- Sidebar + header already exist (you may refine, but don't reinvent the navigation model).
- Data sources already include course progress, streak, bookmarks, notifications, mock GWTH Score.
- Free / paid / lapsed branches already exist in code.

Improve the dashboard content model inside the existing app shell. Don't start from a blank navigation.

## 9. Deliverables

Return:

- **Desktop dashboard at 1440px wide** — active learner state.
- **Mobile dashboard at 412px wide** — active learner state.
- **Free state** and **lapsed state** at desktop only is enough.
- **Concise implementation handoff**: list of components/panels, states, token choices, and any exact copy used in panels and buttons.
- **Short list of anything the codebase needs** before this design can be fully wired.

## 10. Quality bar

- A learner should instantly know what to do next.
- A learner should understand how progress turns into credential value.
- The dashboard should feel like a calmer, denser cousin of the home page — same palette, same typography, same sharp-bordered editorial spirit, but without the marketing rhetoric.
- David should be able to port it into the existing Next.js dashboard without reverse-engineering hidden intent.
