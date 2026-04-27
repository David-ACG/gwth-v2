# IDEA — LinkedIn "Add to Profile" Integration + Verify Page + Hero Scroll Animation

**Captured:** 2026-04-27
**Status:** Backlog — not yet planned. Surface for review when Phase 2+ planning begins.
**Related current work:** `experiment/redesign-poc-2026-04` Phase 1b (collapsible score card on homepage hero). This idea is the *next* step beyond the current "show the score" widget — the credential-export and verification surface.

---

## TL;DR

Three connected pieces:

1. **Public verify page** at `gwth.ai/verify/{credentialId}` — the credential's source of truth (score, percentile, date, six-primitive breakdown, re-take CTA).
2. **LinkedIn "Add to Profile" deep-link button** on the GWTH dashboard — pre-fills the LinkedIn certification form so the student lands the credential in their **Licenses & Certifications** section in one click. No LinkedIn approval needed; mechanism is free, stable, well-documented.
3. **Hero scroll-reveal animation on the marketing homepage** — currently a holding image; later, an inline animation showing a mobile LinkedIn profile, a tap on the GWTH certification, and the transition to the score page. Mirrors the "exploding diagrams" reveal pattern.

The placeholder for piece 3 is the score widget already shipped in Phase 1b. Pieces 1 + 2 unlock the actual product loop: students who finish modules can broadcast verified credentials, every share is a top-of-funnel link back to gwth.ai.

---

## Piece 1 — Public verify page (`gwth.ai/verify/{credentialId}`)

The LinkedIn entry is the billboard; **the verify page is the moat**. Recruiters and employers click "Show Credential" on LinkedIn → land on this page. Treat it as the single source of truth for every credential ever issued.

### Must show
- Score (e.g., 104), tier (e.g., Top 1%), and percentile context
- Date achieved + expiry date
- Six-primitive radar/spider chart breakdown (separate breakdown design TBD; refer to existing dashboard spider-chart screenshot)
- "Re-take this assessment" CTA — turns every shared credential into a re-engagement loop
- Issuer line: "Issued by Agile Commerce Group Ltd · GWTH Certified Practitioner Programme"
- Credential ID (e.g., `GWTH-2026-A1B2C3`)
- Public, indexable, fast (it's an SEO surface — every shared credential is a backlink)

### Must NOT show
- The student's PII beyond their name/handle
- Internal notes/commentary
- Anything mutable that could be edited post-issue (immutability is the trust signal)

### Hard requirements
- **Uptime budget**: 99.9%+ from launch (recruiters losing trust because of a 500 destroys the credential's value irreversibly)
- **Anti-tampering**: credential payload cryptographically signed; verify page validates signature before render
- **Revocation pathway**: if a student is later found to have cheated/violated terms, the credential can be revoked and the verify page shows a clean "Revoked on YYYY-MM-DD" state (NOT a 404 — the URL needs to remain stable so anyone with the LinkedIn link sees the revocation, not a broken link)
- **Stable URL forever** — once issued, never re-route, never break

---

## Piece 2 — LinkedIn "Add to Profile" deep-link button

LinkedIn's [Add to Profile programme](https://addtoprofile.linkedin.com/) has been live, free, and stable for years. Microsoft, Google, AWS, IBM, every major issuer uses it.

### Mechanism
1. GWTH dashboard renders an **Add to LinkedIn** button on the score widget (and later on each completed module's certificate).
2. Button href is a deep-link URL with the student's credential pre-populated.
3. Click → LinkedIn login (if needed) → pre-filled review form → save.
4. Credential lands in the student's **Licenses & Certifications** section with: GWTH logo (resolves automatically because Agile Commerce Group Ltd has a verified Company Page), "Show Credential" button linking to `gwth.ai/verify/{credentialId}`, and the credential ID.

### URL format
```
https://www.linkedin.com/profile/add
  ?startTask=CERTIFICATION_NAME
  &name={human-readable certification name}
  &organizationId={Agile Commerce Group Ltd LinkedIn Company numeric ID}
  &issueYear={YYYY}
  &issueMonth={M}
  &expirationYear={YYYY}
  &expirationMonth={M}
  &certUrl=https://gwth.ai/verify/{credentialId}
  &certId={credentialId}
```

### Parameter strategy for GWTH

| Param | Value | Notes |
|---|---|---|
| `name` | "GWTH Certified Practitioner — Score 104 (Top 1%)" | Tier name does the heavy lifting; the raw number adds precision. See "Label matters more than mechanism" below. |
| `organizationId` | TBD — find by logging into LinkedIn as Agile Commerce Group Ltd page admin and inspecting the page URL | Must verify before launch; failing parameter = no logo on credential |
| `issueYear` / `issueMonth` | Date the score was achieved (NOT enrolment date) | |
| `expirationYear` / `expirationMonth` | **Set this**, ideally 6 or 12 months out | Forces re-assessment, matches GWTH's decay-aware score model. Aligns with the existing assessment plan's engagement loop. |
| `certUrl` | `https://gwth.ai/verify/{credentialId}` | The verify page from Piece 1. Drives traffic back. |
| `certId` | Internal ID format `GWTH-{year}-{6-char-base32}` (e.g., `GWTH-2026-A1B2C3`) | Stable forever, must match `credentialId` in URL path |

### Naming strategy — the label matters more than the mechanism
A score of "104" with "Top 1%" is impressive in the dashboard but ambiguous on a recruiter's first glance. They don't know what 104 measures. Issue **tier-named credentials alongside the raw number**:

> **GWTH Certified Practitioner — Score 104 (Top 1%)**

The tier name (`GWTH Certified Practitioner`) does the heavy lifting; the score adds precision for those who click through.

### Why this is the right call right now
- Works today, no LinkedIn approval required (programme is open + free)
- One-click for the student
- Composes with the assessment plan — same dashboard score card surfaces directly on the verify page
- Scales to a credential stack: the same mechanism later issues course-completion certs, primitive-specific badges, enterprise assessment credentials
- LinkedIn's "Co-occurrence" recruiter signal in 2026 specifically rewards verified certs paired with endorsed skills — getting GWTH as the issuer on student profiles + tagging skills back to it is high-leverage

---

## Piece 3 — Hero scroll-reveal animation (homepage)

Currently the hero shows a static device frame with the ScoreVis widget (Phase 1b). The future treatment is a scroll-revealed animation that mirrors the "exploding diagrams" pattern (where SVG/canvas content assembles itself as the user scrolls).

### Sequence
1. **Reveal trigger:** user scrolls down past the hero's first viewport; the device tilts/zooms in on scroll.
2. **State 0:** mobile device frame on an example LinkedIn profile (Alex Example), scrolled to the **Licenses & Certifications** section.
3. **State 1:** finger taps the GWTH credential entry: "GWTH Certified Practitioner — Score 104 (Top 1%)".
4. **State 2:** page transitions (slide / morph / push) to the GWTH verify page showing the score 104, the spider chart, the date.
5. **State 3:** subtle pulse on the "104" number; CTA appears: "Get your own score" → links to `/signup`.

### Implementation paths to evaluate
- **Pure code/SVG animation** — Motion (motion.dev) + Intersection Observer + scroll-linked animation. Pros: <50KB, accessibility-friendly, respects `prefers-reduced-motion`. Cons: phone mockup is fiddly to build by hand.
- **Lottie** — designer hands off `.lottie` JSON, render in `lottie-react`. Pros: rich animation, designer-friendly. Cons: bundle weight, blocks LCP if not lazy-loaded.
- **Short MP4/WebM video** — recorded once, looped. Pros: simplest. Cons: not responsive, no perfect dark-mode mirror, no scroll-linked playback.

Recommendation: pure code animation. The hero owns LCP; we cannot afford a 200KB+ Lottie payload or video on first paint.

### Constraints
- Must respect `prefers-reduced-motion` — fall back to a static screenshot of State 2
- Must not regress LCP from current static device (target stays Lighthouse Perf ≥85)
- Must work without auto-play sound
- Must be paused / not loop infinitely (one play, then idle on State 3)

---

## Risk register

| Risk | Mitigation |
|---|---|
| Verify page goes down → recruiters see broken credentials | 99.9% uptime SLO from day one; static fallback page baked into deploy artefact; CDN-cached |
| `organizationId` lookup fails / wrong → no GWTH logo on credentials | Verify the ID against a sample student profile before launch; document the lookup in `docs/linkedin-org-id.md` |
| Credential revocation needed but URL must stay alive | Verify page renders a "Revoked on {date} — {reason}" state instead of 404; revocation is a state on the credential record, not deletion |
| Brand-trademark abuse — third parties spoof GWTH credentials | UK trademark filing in Class 41 (status: TBD — track) is the legal teeth. LinkedIn's automated logo-display checks favour issuers with verified trademarks. |
| Hero animation fails accessibility audit | Reduced-motion fallback is non-negotiable; respect `aria-hidden` on decorative SVG; keep CTA reachable by keyboard |
| Hero animation regresses LCP | Lazy-mount on first scroll; static SVG placeholder owns the initial paint |

---

## Open questions

1. Who owns credential issuance signing keys? (Backend question — defer to Phase 2 backend selection)
2. What's the expiry policy — 6 months, 12 months, or per-tier (longer expiry for higher tiers)?
3. Does the verify page need rate-limiting against scraping?
4. Is there a separate LinkedIn surface for **course completion** vs **score**? (Probably yes — both should issue, with different `name` parameters)
5. What's the credentialId entropy budget? `GWTH-2026-A1B2C3` is 6 chars × 32 = ~30 bits → ~1B unique IDs per year; comfortable.
6. Should the verify page expose JSON-LD `EducationalOccupationalCredential` schema for SEO? (Yes — high-leverage for Google indexing of credentials.)

---

## Suggested phasing

- **Phase 2a — Verify page (Piece 1)** — static credential rendering, no auth, no expiry logic. Hard-coded sample credential. Get the URL contract locked.
- **Phase 2b — LinkedIn deep-link button (Piece 2)** — wire the dashboard button, verify the `organizationId` resolves to the GWTH logo, end-to-end test on a real LinkedIn account.
- **Phase 2c — Real credential issuance backend** — backend signs credentials, generates IDs, stores expiry, supports revocation.
- **Phase 3 — Hero scroll animation (Piece 3)** — replace the static device frame with the scroll-revealed sequence. After backend is live so the destination link is real, not a placeholder.

---

## Sources / reference
- [LinkedIn Add to Profile programme](https://addtoprofile.linkedin.com/) — official mechanism
- [Editorialge: How to add certifications to LinkedIn](https://editorialge.com/how-to-add-certifications-to-linkedin/) — Co-occurrence recruiter signal
- Existing GWTH artefacts: `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html` (current score widget shape that the verify page should mirror); the spider-chart screenshot referenced in earlier dashboard mockup conversations
