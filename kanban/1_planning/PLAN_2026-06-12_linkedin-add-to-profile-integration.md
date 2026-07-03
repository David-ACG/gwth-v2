# Plan: LinkedIn "Add to Profile" Integration (Deep-Link Wiring)

**Date:** 2026-06-12
**Status:** Awaiting Review
**Source Idea:** IDEA_2026-04-27_linkedin-add-to-profile-integration.md

## Overview

The original idea (captured 2026-04-27) proposed three connected pieces: a public verify page, a LinkedIn "Add to Profile" deep-link button, and a hero scroll-reveal animation. **Since that capture, the codebase has moved a long way: two of the three pieces are already substantially shipped.** This plan re-scopes the idea against the current tree and focuses the remaining buildable work on the one genuinely-unbuilt piece — wiring the LinkedIn deep-link — while acknowledging the May handoff sequencing that explicitly deferred this to a later phase.

The honest sequencing note: in code, the "Add to LinkedIn" button already exists on the `/score/[id]` verify surface as a **disabled "SOON" button**, with an inline comment stating it "must NOT be wired in Stage 4" and a deferral marker (`linkedin-add-to-profile-future-feature-deferred-to`). This plan respects that: it produces a **feature-flagged, config-gated** deep-link implementation that stays dormant (the "SOON" state) until the real `organizationId` and per-credential issue/expiry data are confirmed, then flips on with a single config change. Nothing here forces the feature live before the backend credential data and LinkedIn Company Page org ID are verified.

## Current State (what already exists — verified 2026-06-12)

| Piece (from idea) | Current state in repo | Conclusion |
|---|---|---|
| **Piece 1 — Public verify page** | TWO surfaces exist: `src/app/(public)/verify/[code]/page.tsx` (Supabase-backed via `getPublicCredentialByCode`, renders score/benchmark/trajectory + QR code) AND `src/app/score/[id]/page.tsx` (rich "Stone & Sage" editorial credential record with `verified` / `educational` / `revoked` states, five-reasons panel, meta strip, calc disclosure). | **Largely shipped.** Out of scope to rebuild. The `revoked` state the idea asked for already exists. |
| **Piece 2 — LinkedIn deep-link button** | Button exists in `src/app/score/[id]/share-row.tsx` as a **disabled `SOON` button** (`aria-disabled`, `cursor-not-allowed`), deliberately un-wired. | **The remaining work.** This plan wires it behind a config gate. |
| **Piece 3 — Hero scroll animation** | `<HeroDevice />` (`src/components/marketing/hero/`) is the shipped score-card device used on both the homepage hero and the `/score/[id]` page. The scroll-reveal sequence the idea described is not built, but the device placeholder it was meant to replace IS shipped. | **Deferred — separate future idea.** Not planned here; it is a marketing-animation effort with its own LCP/accessibility test surface, and the idea itself phases it last (Phase 3, after backend). |

## Goals

- Implement a `buildLinkedInAddToProfileUrl()` helper in the data/util layer that produces a correct, well-documented `https://www.linkedin.com/profile/add` deep-link from a credential object.
- Wire the existing "Add to LinkedIn" button in `share-row.tsx` so that **when the feature flag is on**, it becomes a real link to the deep-link URL; when off, it keeps the current accessible "SOON" disabled state.
- Centralise all LinkedIn config (feature flag, `organizationId`, certification name template, expiry-months policy) in `lib/config.ts` so flipping the feature live is a one-line change once the org ID is confirmed.
- Document the `organizationId` lookup procedure in `docs/linkedin-org-id.md` so the launch step is unambiguous.
- Keep the verify URL contract consistent (`certUrl` points at the canonical credential record) and add unit tests covering URL construction and the flag-off fallback.

## Scope

### In Scope

- `buildLinkedInAddToProfileUrl(credential)` helper + its types and JSDoc.
- LinkedIn config block in `lib/config.ts` (feature flag defaults **off**, org ID placeholder, name template, expiry policy).
- Converting `ShareRow` from a hard-coded demo to accept credential props (name/tier/score, issue date, expiry, verify URL, credential ID) and to render either the live link (flag on) or the existing "SOON" disabled button (flag off).
- A `docs/linkedin-org-id.md` runbook for finding + verifying the Agile Commerce Group Ltd LinkedIn Company numeric org ID.
- Unit tests for URL construction, parameter encoding, and the flag-off fallback.
- `JSON-LD EducationalOccupationalCredential` schema on the `/score/[id]` page (open question 6 from the idea — high-leverage SEO, low-risk, no backend dependency).

### Out of Scope

- **Piece 1 (verify page) rebuild** — already shipped on two surfaces.
- **Piece 3 (hero scroll-reveal animation)** — separate future idea; LCP-sensitive marketing work, phased last in the idea itself.
- **Real credential issuance backend** — signing keys, ID generation, expiry storage, revocation writes (idea Phase 2c). This plan reads whatever credential data the page already has; it does not create the issuance pipeline.
- **Confirming the real `organizationId` value** — that is a manual LinkedIn-admin lookup (documented in the runbook); the code ships with a placeholder + flag-off default so it is never wrong-in-production.
- **Cryptographic signing / anti-tampering** of the credential payload — backend concern, deferred with the issuance backend.
- Any change to the Supabase-backed `/verify/[code]` surface.

## Technical Approach

Stack: Next.js 16 (App Router, RSC by default) + React 19 + TypeScript strict + Tailwind v4 + shadcn/ui + Sonner. The `/score/[id]` page is already a Server Component; `share-row.tsx` is the only `"use client"` island (it uses the clipboard API).

**1. URL builder (pure function, no React).** Add `buildLinkedInAddToProfileUrl()` to a new `src/lib/linkedin.ts` (pure, server-and-client safe). It takes a typed `LinkedInCredentialInput` and returns a string URL. It reads `organizationId`, the cert-name template, and expiry policy from `lib/config.ts`. All params are `encodeURIComponent`-encoded. Signature:

```ts
buildLinkedInAddToProfileUrl(input: LinkedInCredentialInput): string
// input: { certificationName, issueYear, issueMonth, expirationYear?, expirationMonth?, certUrl, certId }
```

**2. Config gate.** In `lib/config.ts`, add a `LINKEDIN` constant block: `ADD_TO_PROFILE_ENABLED` (default `false`), `ORGANIZATION_ID` (read from `process.env.NEXT_PUBLIC_LINKEDIN_ORG_ID`, fallback empty), `CERT_NAME_TEMPLATE`, `CREDENTIAL_EXPIRY_MONTHS` (default 12). The button only goes live when both `ADD_TO_PROFILE_ENABLED === true` AND `ORGANIZATION_ID` is non-empty — a belt-and-braces guard so a missing org ID can never ship a logo-less credential.

**3. Wire the button.** `ShareRow` gains props for the credential it represents (currently hard-coded to the `c67sg#dde5` demo). When the gate is open it renders an `<a href={deepLinkUrl} target="_blank" rel="noopener noreferrer">` styled identically to today's button, dropping the "SOON" pill; when closed it renders exactly today's disabled "SOON" button. The `/score/[id]` page passes the demo credential's data down as props (the same demo data the page already renders), so no backend wiring is needed to test the flag-on path locally.

**4. JSON-LD.** Add an `EducationalOccupationalCredential` JSON-LD `<script>` to the `/score/[id]` page (RSC, no client JS), mirroring the existing `course-jsonld.tsx` pattern under `src/components/marketing/json-ld/`.

**5. Env + docs.** Add `NEXT_PUBLIC_LINKEDIN_ORG_ID` to `.env.local.example` (commented, with a pointer to the runbook). Write `docs/linkedin-org-id.md`.

## Files Affected / Created

| File | Action | Notes |
| --- | --- | --- |
| `src/lib/linkedin.ts` | Create | `buildLinkedInAddToProfileUrl()` + `LinkedInCredentialInput` type, fully JSDoc'd |
| `src/lib/linkedin.test.ts` | Create | Unit tests: URL construction, encoding, expiry derivation, flag-off |
| `src/lib/config.ts` | Modify | Add `LINKEDIN` config block (flag default off, org-id env read, name template, expiry months) |
| `src/app/score/[id]/share-row.tsx` | Modify | Accept credential props; render live link (gate open) or existing "SOON" button (gate closed) |
| `src/app/score/[id]/page.tsx` | Modify | Pass demo credential data to `<ShareRow />`; add `EducationalOccupationalCredential` JSON-LD |
| `src/app/score/[id]/share-row.test.tsx` | Create | RTL tests: SOON state when gate closed, real link + correct href when gate open |
| `.env.local.example` | Modify | Add commented `NEXT_PUBLIC_LINKEDIN_ORG_ID` with runbook pointer |
| `docs/linkedin-org-id.md` | Create | Runbook for finding + verifying the LinkedIn Company numeric org ID |

## Architecture Notes

- **Server vs Client:** `src/lib/linkedin.ts` is a pure module (no `"use client"`, no React) usable from both. The `/score/[id]` page stays an RSC and builds the deep-link URL server-side, passing the finished string down to the `ShareRow` client island — so the client bundle gains no URL-construction logic and no config secrets beyond the already-public `NEXT_PUBLIC_*` org ID. JSON-LD is emitted server-side.
- **Data layer:** No new `lib/data/` function required for this slice — the `/score/[id]` page already renders demo credential data inline; this plan threads that same data into the URL builder. (The real `getCredentialById()` lookup remains a deferred backend follow-up, unchanged by this plan.)
- **State management:** None added. `ShareRow` keeps its existing local `copied` boolean for the copy-link affordance.
- **Accessibility:** Gate-closed path preserves today's `aria-disabled` "SOON" semantics. Gate-open link is a real `<a>` with descriptive text ("Add to LinkedIn"), keyboard-focusable, `rel="noopener noreferrer"`, opens in a new tab with an `aria-label` clarifying the external destination. No motion added.
- **Performance:** No new client JS of consequence; URL is a precomputed string prop. JSON-LD is inert text. No LCP impact (the score device is unchanged).
- **Config safety:** Belt-and-braces gate (flag AND non-empty org ID) means the feature physically cannot ship a logo-less LinkedIn credential even if the flag is flipped before the org ID is set.

## Acceptance Criteria

- [ ] `buildLinkedInAddToProfileUrl()` returns a URL matching the documented `https://www.linkedin.com/profile/add?...` contract with all params correctly `encodeURIComponent`-encoded.
- [ ] Expiry year/month are derived from the issue date + `CREDENTIAL_EXPIRY_MONTHS` when not explicitly supplied.
- [ ] With `LINKEDIN.ADD_TO_PROFILE_ENABLED === false` (default), `ShareRow` renders the existing disabled "SOON" button verbatim (no behavioural change vs today).
- [ ] With the flag on AND a non-empty `ORGANIZATION_ID`, `ShareRow` renders a real `<a>` to the correct deep-link URL with `target="_blank"` and `rel="noopener noreferrer"`, and the "SOON" pill is gone.
- [ ] With the flag on but an EMPTY `ORGANIZATION_ID`, the button stays in the "SOON" disabled state (belt-and-braces guard).
- [ ] `/score/[id]` emits valid `EducationalOccupationalCredential` JSON-LD.
- [ ] `.env.local.example` documents `NEXT_PUBLIC_LINKEDIN_ORG_ID`; `docs/linkedin-org-id.md` exists with the lookup runbook.
- [ ] `npm test` passes; `npm run build` succeeds with no TypeScript or ESLint errors.

## Dependencies

- **Beads:** The project's Beads Dolt server was unreachable at planning time (2026-06-12) — **no Beads issue was created for this plan.** When the Dolt server is back up, create a tracking issue (`bd create --title="LinkedIn Add-to-Profile deep-link wiring" --type=task`) and link it. The original idea also references a deferral memory marker `linkedin-add-to-profile-future-feature-deferred-to`; the implementing agent should reconcile with that marker before flipping the flag live.
- **External (launch-gating, not code-gating):** Real `organizationId` from the Agile Commerce Group Ltd LinkedIn Company Page (runbook deliverable). The code ships safely without it (flag-off default).
- **Soft dependency:** Real per-credential issue/expiry data comes from the deferred issuance backend (idea Phase 2c). Until then the flag-on path is testable against the existing demo credential data.

## Testing Plan

- **Unit (Vitest):** `linkedin.test.ts` — URL construction for a representative credential, param encoding (spaces, em-dash in the cert name, `#` in URLs), expiry derivation, and behaviour with missing optional params.
- **Component (Vitest + RTL):** `share-row.test.tsx` — three states: gate closed → "SOON" disabled; gate open + org ID → real link with correct href; gate open + empty org ID → still "SOON".
- **Visual (Playwright, P520 http://192.168.178.50:3001):** Load `/score/c67sg` in light + dark, desktop + mobile; confirm the share row renders and (with the flag still off in the deployed build) shows the unchanged "SOON" state — i.e. no production regression.
- **Accessibility (axe-core):** No new violations on `/score/[id]`; verify the gate-open link has an accessible name and external-destination cue.

## Estimated Complexity

**Small–Medium** — One pure helper, one config block, one client-component refactor (props + conditional render), one JSON-LD block, plus docs and tests. No backend, no new routes, no new data-layer function. The care is in the feature gate and the deferral-respecting default-off behaviour, not in volume of code. Bulk of the verify-page surface the idea imagined is already shipped, which is why this is much smaller than the original three-piece idea suggested.

---
## Review Checklist — 2026-06-12 13:30
- [ ] Scope is correctly bounded (not too broad, not too narrow) — note the re-scope: Pieces 1 & 3 already shipped, only Piece 2 is built here
- [ ] Technical approach matches the project's stack and conventions (RSC default, pure util module, config-gated feature flag)
- [ ] Files affected list is complete and accurate against the current tree (`/score/[id]`, `share-row.tsx`, `lib/config.ts`)
- [ ] Acceptance criteria are specific and testable
- [ ] No unexpected dependencies introduced (no backend, no new route, flag defaults OFF)
- [ ] Default-off behaviour correctly respects the `linkedin-add-to-profile-future-feature-deferred-to` deferral marker
- [ ] Estimated complexity feels right (Small–Medium)

**Review this plan:** [PLAN_2026-06-12_linkedin-add-to-profile-integration.md](kanban/1_planning/PLAN_2026-06-12_linkedin-add-to-profile-integration.md)
