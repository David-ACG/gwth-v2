# Implementation Prompt: LinkedIn "Add to Profile" Deep-Link Wiring

**Date:** 2026-06-12
**Plan Reference:** PLAN_2026-06-12_linkedin-add-to-profile-integration.md
**Status:** Ready for Implementation (post-review)

## Context

GWTH v2 is a student-facing applied-AI learning platform (Next.js 16 / React 19 / TypeScript strict / Tailwind v4 / shadcn/ui). When a student earns a GWTH Score, the canonical public credential record lives at `/score/[id]` — this is the page a recruiter sees when they click a candidate's GWTH credential. That page already has an "Add to LinkedIn" button, but it is deliberately rendered as a **disabled "SOON" button** and is not yet wired to LinkedIn's deep-link mechanism. This task wires it — behind a feature flag that defaults OFF — so the feature is ready but stays dormant until the LinkedIn Company org ID is confirmed.

## Task

Implement the LinkedIn "Add to Profile" deep-link for the `/score/[id]` credential page. The deep-link pre-fills LinkedIn's certification form so a student lands the credential in their **Licenses & Certifications** section in one click. The button must stay in its current "SOON" disabled state until a config flag is turned on AND a real `organizationId` is set — so this change is safe to merge without going live.

## Important Sequencing Note (read before starting)

This feature was explicitly deferred in the May 2026 handoffs. The existing button in `src/app/score/[id]/share-row.tsx` carries a comment: *"Real wiring tracked under `linkedin-add-to-profile-future-feature-deferred-to` — must NOT be wired in Stage 4."* You are NOT overriding that. You are adding the wiring **behind a default-OFF feature gate** so the live site behaviour is unchanged. Do not flip the flag on. Do not set a real `organizationId`. The default-off path must render byte-for-byte the same "SOON" button users see today.

## Specific Instructions

1. **Create `src/lib/linkedin.ts`** — a pure module (NO `"use client"`, no React imports) exporting:
   - A type `LinkedInCredentialInput` with JSDoc'd fields: `certificationName: string`, `issueYear: number`, `issueMonth: number` (1–12), `expirationYear?: number`, `expirationMonth?: number`, `certUrl: string`, `certId: string`.
   - `buildLinkedInAddToProfileUrl(input: LinkedInCredentialInput): string` — constructs `https://www.linkedin.com/profile/add` with query params: `startTask=CERTIFICATION_NAME`, `name`, `organizationId` (from config), `issueYear`, `issueMonth`, `expirationYear`, `expirationMonth`, `certUrl`, `certId`. Encode every dynamic value with `encodeURIComponent`. If `expirationYear`/`expirationMonth` are omitted, derive them from `issueYear`/`issueMonth` plus `LINKEDIN.CREDENTIAL_EXPIRY_MONTHS` (handle month rollover past December correctly). JSDoc the function and reference the official mechanism (`https://addtoprofile.linkedin.com/`).

2. **Add a `LINKEDIN` config block to `src/lib/config.ts`** (UPPER_SNAKE_CASE keys, JSDoc'd):
   - `ADD_TO_PROFILE_ENABLED: boolean` — default `false`.
   - `ORGANIZATION_ID: string` — `process.env.NEXT_PUBLIC_LINKEDIN_ORG_ID ?? ""`.
   - `CERT_NAME_TEMPLATE: string` — e.g. `"GWTH Certified Practitioner"` (the tier name; the specific score is appended by the caller).
   - `CREDENTIAL_EXPIRY_MONTHS: number` — default `12`.
   - Export a small helper `isLinkedInAddToProfileEnabled(): boolean` returning `ADD_TO_PROFILE_ENABLED && ORGANIZATION_ID.length > 0` (belt-and-braces gate).

3. **Refactor `src/app/score/[id]/share-row.tsx`** (stays `"use client"`):
   - Add a props interface `ShareRowProps` with the credential data needed to build the link: `linkedInUrl: string | null` (the precomputed deep-link, or `null` when the gate is closed), and keep the existing `canonicalUrl` for the copy-link button (accept it as a prop instead of hard-coding `"https://gwth.ai/score/c67sg#dde5"`).
   - When `linkedInUrl` is non-null, render the LinkedIn button as a real `<a href={linkedInUrl} target="_blank" rel="noopener noreferrer">` with the same sharp Stone & Sage styling, an `aria-label` like `"Add this credential to your LinkedIn profile (opens LinkedIn in a new tab)"`, and WITHOUT the "SOON" pill.
   - When `linkedInUrl` is `null`, render exactly today's disabled "SOON" button (unchanged markup).
   - Keep the copy-link button and its Sonner toast behaviour.

4. **Update `src/app/score/[id]/page.tsx`** (stays an RSC):
   - Build the deep-link server-side: if `isLinkedInAddToProfileEnabled()` is true, call `buildLinkedInAddToProfileUrl(...)` with the demo credential's data (name `"GWTH Certified Practitioner — Score 104 (Top 1%)"`, the issue date already shown on the page, `certUrl` = the canonical `/score/...` URL, `certId` derived from the verification ID), else pass `null`.
   - Pass `linkedInUrl` and `canonicalUrl` down to `<ShareRow />`.
   - Add an `EducationalOccupationalCredential` JSON-LD `<script type="application/ld+json">` block (follow the existing pattern in `src/components/marketing/json-ld/course-jsonld.tsx`) describing the credential: name, the issuing organisation (Agile Commerce Group Ltd / GWTH.ai), `credentialCategory`, and the canonical URL.

5. **Add `NEXT_PUBLIC_LINKEDIN_ORG_ID` to `.env.local.example`** — commented out, with a one-line note: `# LinkedIn Company numeric org ID — see docs/linkedin-org-id.md. Leave blank until verified; the Add-to-Profile button stays disabled while empty.`

6. **Create `docs/linkedin-org-id.md`** — a short runbook: how to find the Agile Commerce Group Ltd LinkedIn Company numeric org ID (log in as a Page admin, inspect the Company Page URL / admin view), how to verify it produces the GWTH logo on a test credential, and the two-step go-live (set `NEXT_PUBLIC_LINKEDIN_ORG_ID`, then set `ADD_TO_PROFILE_ENABLED` to `true`). Note that the org ID must be verified against a real test profile before launch.

7. **Write tests:**
   - `src/lib/linkedin.test.ts` (Vitest): URL construction for a representative credential; correct `encodeURIComponent` of spaces, the em-dash in the cert name, and `#`/`/` in URLs; expiry derivation including December rollover; behaviour when optional expiry params are supplied vs derived.
   - `src/app/score/[id]/share-row.test.tsx` (Vitest + RTL): (a) `linkedInUrl={null}` renders the disabled "SOON" button; (b) `linkedInUrl="https://..."` renders a real anchor with the correct `href`, `target="_blank"`, `rel` containing `noopener`, and no "SOON" text; (c) copy button still present.

## Patterns to Follow

- Use Server Components by default; `share-row.tsx` is the only `"use client"` island — keep URL construction and config reads on the server in `page.tsx`.
- Do NOT use `useMemo`, `useCallback`, or `React.memo` — React Compiler handles this.
- All colors via CSS custom properties / existing Tailwind tokens — never hardcode hex. The existing `sharpBtn()` styling in `share-row.tsx` already uses tokens; reuse it.
- Use `next/dynamic` only for heavy components — not needed here.
- JSDoc on every exported function, component, type, and constant. Component prop interfaces get per-field JSDoc.
- Add/update a `README.md` only if you create a new component directory (you should not need to here).
- Run `npm test` after every change. Fix failures before continuing.
- Animations must respect `prefers-reduced-motion` — no new animation is added here.
- Use Sonner `toast()` for user feedback (the copy-link button already does); `AlertDialog` for destructive actions (none here).
- Keep the default-OFF gate intact: do NOT set a real `organizationId`, do NOT flip `ADD_TO_PROFILE_ENABLED` to `true`.

## Acceptance Criteria

- [ ] `buildLinkedInAddToProfileUrl()` returns a URL matching `https://www.linkedin.com/profile/add?...` with all params `encodeURIComponent`-encoded.
- [ ] Expiry year/month derive from issue date + `CREDENTIAL_EXPIRY_MONTHS` when not supplied (December rollover handled).
- [ ] With the flag OFF (default), `ShareRow` renders the existing disabled "SOON" button — no behavioural change vs today.
- [ ] With the flag ON and a non-empty org ID, `ShareRow` renders a real `<a>` to the deep-link with `target="_blank"` + `rel="noopener noreferrer"`, no "SOON" pill.
- [ ] With the flag ON but an EMPTY org ID, the button stays "SOON" (belt-and-braces gate via `isLinkedInAddToProfileEnabled()`).
- [ ] `/score/[id]` emits valid `EducationalOccupationalCredential` JSON-LD.
- [ ] `.env.local.example` documents `NEXT_PUBLIC_LINKEDIN_ORG_ID`; `docs/linkedin-org-id.md` exists.
- [ ] `npm test` passes; `npm run build` succeeds (no TS/ESLint errors).

## Files to Create / Modify

| File | Action | Notes |
| --- | --- | --- |
| `src/lib/linkedin.ts` | Create | Pure URL-builder + types |
| `src/lib/linkedin.test.ts` | Create | URL/encoding/expiry unit tests |
| `src/lib/config.ts` | Modify | `LINKEDIN` block + `isLinkedInAddToProfileEnabled()`, flag default off |
| `src/app/score/[id]/share-row.tsx` | Modify | Props-driven; live link vs "SOON" fallback |
| `src/app/score/[id]/page.tsx` | Modify | Build URL server-side, pass props, add JSON-LD |
| `src/app/score/[id]/share-row.test.tsx` | Create | RTL: SOON vs live-link states |
| `.env.local.example` | Modify | `NEXT_PUBLIC_LINKEDIN_ORG_ID` (commented) |
| `docs/linkedin-org-id.md` | Create | Org-ID lookup + go-live runbook |

## When Done

1. Run `npm test` — all tests must pass. Run `npm run build` — must succeed.
2. **Beads:** the project's Dolt server was down at planning time. If `bd` is reachable now, create a tracking issue (`bd create --title="LinkedIn Add-to-Profile deep-link wiring" --type=task`), claim it, and create issues for any discovered follow-up (real `getCredentialById()` lookup, real org-ID verification, flipping the flag live). If `bd` still fails, note that in the Gate 3 implementation notes and skip Beads.
3. Commit with a descriptive message (do NOT push or deploy unless instructed by the runner).
4. If Beads is up: `bd close <id>` for the completed issue, then `bd sync`.

---
## Review Checklist — 2026-06-12 13:30
- [ ] Instructions are clear and self-contained (no assumed context) — a fresh agent could implement without the plan
- [ ] File paths are correct for this project (`src/app/score/[id]/...`, `src/lib/...`)
- [ ] Acceptance criteria match the plan
- [ ] The prompt doesn't introduce scope creep beyond the plan (no verify-page rebuild, no hero animation, no backend issuance)
- [ ] Default-OFF gate is explicit and the deferral marker is respected (flag stays off, org ID stays empty)
- [ ] Beads-down fallback is stated so the agent doesn't block

**Review this prompt:** [PROMPT_2026-06-12_linkedin-add-to-profile-integration.md](kanban/1_planning/PROMPT_2026-06-12_linkedin-add-to-profile-integration.md)
