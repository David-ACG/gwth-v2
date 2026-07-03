# Claude Design Brief — GWTH.ai Public Credential Verify Page (2026-05-08)

**Logo PNGs are locked — do NOT propose, attempt, or render any SVG version of the logo. If you generate one, the entire response will be rejected.**

**Design tokens are locked.** The Stone & Sage palette, Public Sans / Vollkorn / JetBrains Mono typography, terracotta `#a94c2e` primary, and warm forest dark mode are inherited from the homepage template this chat was seeded from. Do NOT redefine, propose alternatives to, or "polish" the tokens. Use them.

You are Claude Design working on the GWTH.ai 23 May 2026 UK beta launch. Design the **public credential verify page** at route `/score/[id]`. This is the single most important *external-facing* surface in the product: when a recruiter clicks a candidate's GWTH Score link from LinkedIn, this is what they see. It is the credential's public face. It must look like an institution-grade credential verification page, not a marketing card.

## 1. The two design ideas this verify page is built around

### Idea A — Credential first, marketing second

A recruiter arriving here has zero context on GWTH. They need, in this order: (1) who is this person, (2) what is this number, (3) is it real, (4) why should I believe it. The page must answer those four in 10 seconds without making the visitor scroll.

The page uses the **locked share-ticker score card pattern** (see `references/01-score-card-homepage-example.jpg`) as the hero — same browser-frame chrome, same big number, same terracotta `TOP 1%` tier pill, same green `↗ +49` trend, same QR top-right, same browser-frame URL bar. **Reuse this card. Do not reinvent it.** Below the hero, expand the credibility evidence: the 5 reasons (Section 5 below), then a "verified by GWTH.ai" institutional footer with a stable canonical URL.

### Idea B — Trust through specificity, not testimonials

This page must not look like a SaaS landing page. No fake company logos, no "trusted by" rows, no testimonials, no urgency. Trust comes from showing the **actual mechanics**: what the holder did, when, how the score moves, when it was last verified, where the canonical record lives. Think LinkedIn certificate page meets a coursework transcript meets a credential ledger.

- A "Last verified" timestamp visible near the score (e.g. "Last verified 2 May 2026").
- A "Verification ID" mono-spaced fingerprint visible (e.g. `c67sg#dde5` — same as the URL hash).
- A "How this score is calculated" inline-disclosure beneath the card.
- The 5 credibility reasons expanded in their own panel, treated as institutional copy not marketing copy.

These two ideas together are the point of the design. Everything else serves them.

## 2. Reference assets in this bundle

| File | What to absorb |
|------|----------------|
| `references/01-score-card-homepage-example.jpg` | The locked share-ticker score card as it appears in the homepage hero. Browser-frame chrome with `gwth.ai/score/c67sg#dde5` URL, candidate identity top-left, QR top-right, GWTH SCORE wordmark, big number 104, terracotta `TOP 1%` pill, green `↗ +49` trend, `VS 3 MONTHS AGO` label, collapsible "What this score tells an employer / 5 reasons it's credible". **Reuse this card on the verify page as the hero.** |

## 3. Hard prohibitions (any one of these = response rejected)

- No SVG logo work. The wordmark, if shown, is a PNG.
- No decorative eyebrow pills above headlines. Functional pills (TOP 1%, VERIFIED, status) are fine.
- No gradient text.
- No side-stripe accents.
- No fake stats, fake learner counts, fake testimonials, fake company logos.
- No "trusted by" row.
- No modal-first interactions.
- No nested cards (a card inside a card inside a card).
- No UI copy explaining how to use the page. The interface should explain itself.
- No em dashes in visible UI copy. Use commas or a colon.
- No "Tech Radar" anywhere.
- Do NOT reinvent the score card. Reuse the share-ticker pattern from the reference.
- Do NOT introduce aqua / mint / Inter — those were the pre-2026-04-29 register and are dead.
- No social-share spam (no row of 8 platform icons). Two share affordances at most: copy link, and "Add to LinkedIn".
- No marketing CTAs in the score card itself ("buy the course"). Conversion lives below the credential, separated, single sentence.
- No avatars-of-other-learners decoration. This page is about ONE person.

## 4. Product context (only the parts the verify page needs)

- Every paying GWTH student gets a GWTH Score from completing real lesson work, Q&A passes, capstone reviews, and currentness.
- The score is a **dynamic, decaying** number. Inactivity decays it; new lesson completions and capstones lift it.
- Naming convention is locked: **"GWTH Certified Practitioner - Score 104 (Top 1%)"**. The tier name (Top 1% / Top 5% / Top 10% / Top 30%) does the heavy lifting in copy; the raw number adds precision.
- The URL `gwth.ai/score/[id]` is the **canonical credential record**. It must look like it lives forever (per memory: 99.9 uptime, anti-tampering, revocation pathway, stable URL forever).
- A future LinkedIn "Add to Profile" deep-link button will live on this page (deferred to Phase 2/3, but design the affordance now).
- Some credentials may be **revoked** (refund, fraud, manual review failure). The page must have a graceful revoked state.
- Project evidence is **private by default**. The credential proves the score; it does NOT publicly expose the holder's project files.

## 5. Required content — the 5 credibility reasons (use exact copy)

The page must include this institutional copy block, treated as a numbered list inside its own panel beneath the score card. Heading copy: **What this score tells an employer / 5 reasons it's credible.**

1. **Always current.** Lessons update constantly so students stay on the cutting edge, and the score decays if they don't keep up.
2. **Hands-on, not lectured.** Reaching 100 means completing 94+ hands-on projects across 3 modules, no passive watching.
3. **Tested, not assumed.** Every lesson has check questions; the course requires 3 capstone projects to graduate.
4. **Paced, not crammed.** The course is 3 months; lessons release in stages, no shortcuts, no rushing through.
5. **A high score is a recent score.** Above 100 means top 1% of applied-AI practitioners today, not when they enrolled.

Use the copy verbatim. The bold lead phrase is the anchor; the body is institutional, not breezy. No em dashes (replaced with commas above).

## 6. Required surfaces

### Surface 1 — Default verified state (desktop 1440px)

- **Top of page:** the locked share-ticker score card as the hero. Identity top-left, QR top-right, browser-frame URL chrome with the canonical URL (`gwth.ai/score/[id]`), score number, tier pill, trend, period label.
- **Just beneath the card:** a thin meta strip in mono uppercase: `LAST VERIFIED 2 MAY 2026` · `VERIFICATION ID c67sg#dde5` · `STATUS VERIFIED`. Quiet, institutional, not decorative.
- **Section 1:** The 5 credibility reasons in a single bordered panel. Numbered, italic Vollkorn for the bold lead phrase, body in Public Sans muted-foreground for the explanation.
- **Section 2:** "How this score is calculated" inline disclosure (collapsed by default). When expanded: a short institutional paragraph + a small data list (lessons completed, capstones approved, currentness rating, score history sparkline).
- **Section 3:** Share affordances. Two buttons only: **Copy link** (sharp ghost), and **Add to LinkedIn** (sharp terracotta primary, with a small `(coming soon)` tag if you need to honour the deferred state).
- **Footer:** institutional "verified by GWTH.ai" line with a small lock icon, plus a single calm "About the GWTH Score" link to the marketing site.

The page has **no PublicNav and no Footer**. It is a standalone canonical record. The only navigation is a small `gwth.ai` mark top-left as the anchor.

### Surface 2 — First-time visitor educational state (desktop 1440px)

Same layout as Surface 1, but with an **expanded** "What is a GWTH Score?" inline panel directly above the credibility-reasons section. Two short paragraphs explaining: the score is dynamic, the score is verified, the holder earned it through hands-on work. This is what a recruiter who has never heard of GWTH sees on first visit.

You can choose to make this default-expanded for first-time visitors and collapse on subsequent visits, or always-visible. Pick the cleaner option.

### Surface 3 — Revoked state (desktop 1440px)

- The score card hero is replaced by a quiet, bordered grey panel: candidate identity, then in mono uppercase `CREDENTIAL REVOKED`, then a single sentence in muted-foreground: "This credential is no longer valid as of [date]." No score, no tier pill, no trend.
- The 5 credibility reasons section is hidden.
- A single calm institutional paragraph: "If you believe this is in error, contact verify@gwth.ai."
- Page tone: respectful, not punitive. No red destructive treatment, no warning icons. Just absent. Like an expired library card, not a fraud alert.

### Surface 4 — Mobile 412px (verified state)

- Score card retains its share-ticker shape but stacks vertically (identity above QR, big number centered, trend below).
- Credibility reasons collapse to a single tap-to-expand list.
- Share affordances become full-width buttons stacked.
- Meta strip becomes a vertical mono key/value list.

### Optional if quota allows

- Dark mode for Surface 1.
- A "Pending verification" state for newly-issued credentials (24-hour delay before public verification).
- The "Add to LinkedIn" button hover/active states showing the deep-link tooltip.

## 7. Information architecture rules

- The score card is the **single most prominent element**. Nothing on the page competes with it for attention.
- Body column max width ~720px below the card; the card itself can be a touch wider (~840px) to preserve the share-ticker proportions.
- Use mono uppercase for institutional metadata (verification ID, last verified, status). Use italic Vollkorn for the credibility-reason lead phrases. Use Public Sans for everything else.
- Do not nest panels. Score card is one bordered surface; credibility reasons is one bordered panel; calculation disclosure is one bordered panel; share row is borderless. That is the lot.
- Light mode is primary (a recruiter on LinkedIn at midday). Dark mode must work but does not get the same polish budget.

## 8. Current implementation to respect

- Route: `src/app/(public)/score/[id]/page.tsx` (or sibling, confirm in repo).
- Score data already includes: holder name, role, country, score number, tier, 3-month trend delta, last-verified timestamp, verification ID hash, lessons-completed count, capstones-approved count, status (verified / pending / revoked).
- `<HeroDevice />` and its primitives (`computeScoreTrend`, `LogoGwthMark`, `QrCode`) at `src/components/marketing/hero/` already implement the share-ticker pattern. The verify page should reuse those, not reimplement them.
- This page does NOT use the dashboard layout, the public marketing layout, or the auth layout. It is a standalone route with its own minimal shell (just the `gwth.ai` anchor mark top-left and a thin institutional footer).

## 9. Deliverables

- Desktop **Surface 1** at 1440px (default verified state, first impression for a recruiter who already knows GWTH).
- Desktop **Surface 2** at 1440px (first-time visitor educational state, "What is a GWTH Score?" expanded).
- Desktop **Surface 3** at 1440px (revoked state).
- Mobile **Surface 4** at 412px (verified state).
- Concise implementation handoff: component list (verify page shell, score-card reuse note, credibility-reasons panel, calculation-disclosure panel, share row, revoked state, meta strip), state machine for verified / pending / revoked, exact copy used.
- Short list of anything the codebase needs before this can be fully wired (e.g. score history sparkline primitive, verification ID hash format, LinkedIn deep-link URL pattern, revoked credential storage).

## 10. Quality bar

- A recruiter who has never heard of GWTH must understand within 10 seconds: who this person is, what the number means, that the credential is verified, and why it's credible.
- A holder sharing the link to LinkedIn must feel proud of the page they are pointing people to. It must look like a serious institution issued it, not a SaaS dashboard.
- A future Claude Code session must be able to port this surface into Next.js using the existing `<HeroDevice />` primitives without reverse-engineering hidden intent.
- The page must feel like a calmer, more institutional cousin of the home page hero: same palette, same typography, same sharp-bordered editorial spirit, but ledger-like rather than argumentative.
