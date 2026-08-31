# N7 session log — institution admin v1 + roster privacy

**Base commit (QA range floor):** `7623d88059d7150a0784ac5705b32dc2cbdcb921`
**Started:** 2026-08-31 (autonomous night run, worker lane in GWTH_V2)
**Freeze respected:** no deploy, no publish, no prod migration, no push.

## Research (done before any edit)

| Question | Answer found |
|---|---|
| Where does the edition/tier model live? | `syllabus_edition` + `edition_lessons` (014), resolution ladder in `src/lib/data/editions.ts` (N6) |
| What does N6 already give me? | pass-mark threading, `getEffectiveEdition`, server grading gated on the edition, per-learner score denominator |
| What admin UI pattern do I match? | `/admin` (W4): `admin-fde.module.css`, `admin-shared.tsx` (StateLabel/DashProgress/safe/AdminEmptyState), `AdminNav`, `requireAdminOrRedirect()` called FIRST in every page |
| How is a protected page proven gated? | `src/app/protected-page-gates.test.ts` AST-scans every page under `PROTECTED_PATHS` for an awaited call to a name in `GATE_NAMES` |
| How may a page render without a session? | `isSessionlessMockRequest()` (`src/lib/content-access.ts`) — mock env AND no session cookie presented. Fail closed on a forged cookie. |
| Which Better Auth endpoints leak the roster? | verified against `better-auth@1.6.19` dist: `get-full-organization`, `list-members`, `list-invitations` authorise ANY member; `get-active-member-role?userId=` reveals another member's role. `set-active` returns `findOrganizationById` (no members) — not a leak. |

## Plan

1. **Roster privacy (N5 QA defect 3).** New pure-policy module
   `src/lib/org-roster-privacy.ts` + a `hooks.before` on the Better Auth
   instance that resolves the caller's role in the TARGET org from
   `org_membership` and refuses the four roster-bearing endpoints with a clean
   403 when that role is `learner`. Pure decision function is unit-tested; the
   wiring is covered by a DB test.
2. **Migration 019** — ratification audit trail on `edition_lessons`
   (`updated_at`, `decided_at`, `decided_by`, `review_note`). Additive,
   idempotent, staging-only. Two states stay (`draft`/`ratified`): "send back"
   = draft + a review note, so N6's visibility rule is untouched.
3. **`src/lib/data/org-admin.ts`** — the staff context
   (`requireOrgStaffOrRedirect`), Q1 roster, Q2 per-lesson completion, Q3
   summary, Q4 ratification queue, and the syllabus-by-tier read. Mock-mode
   fixtures via the audited `isSessionlessMockRequest()` seam so the screens
   are reviewable/screenshot-able without a seeded DB.
4. **`src/lib/actions/org-admin.ts`** — toggle an optional lesson in/out of the
   edition, ratify / send back an exclusive draft, set the edition pass mark.
   Every action re-checks: real session → admin role in the org that OWNS the
   edition. Tutors are read-only. Pass mark threads into N6's grading with no
   change to N6 code (it already reads `syllabus_edition.pass_mark`).
5. **`/org` screens** — layout with the co-branded header (`co_brand_label`,
   e.g. "Curated by CIPD"), Overview, Syllabus (picker by tier + pass mark),
   Ratification, Learners (roster; tutor-visible). `/for-teams` and `/pricing`
   copy untouched.
6. **Coverage** — vitest for the policy/actions/data layer, DB tests against
   staging for the privacy hook and the actions, Playwright for the four
   screens (desktop + mobile, light + dark, axe).

## Blocking questions for David

None. Naming and the CIPD-vs-GWTH split were already decided in
`05-syllabus-editions-design.md` §7b (2026-08-28): UK table names, one pass
mark per edition, institution admin decides `is_mandatory` per exclusive
lesson. What CIPD sees = their own org only (every query is filtered to the
staff member's organisation); GWTH staff keep the separate `/admin` surface on
the `ADMIN_EMAILS` allowlist, which `/org` does not touch.

## Decisions taken here (recorded for the packet)

- **D-N7-1 — `/org`, not `/admin/org`.** `/admin` is the GWTH platform CRM on
  an env allowlist; `/org` is customer-facing institution staff on a DB role.
  Mixing them would put CIPD staff behind `ADMIN_EMAILS`.
- **D-N7-2 — two ratification states, not three.** "Send back for changes" is
  `state='draft'` + `review_note`, so `edition_lessons_state_check` and N6's
  `isLessonInEdition` stay exactly as shipped.
- **D-N7-3 — core lessons are not switchable.** The picker toggles `optional`
  and `exclusive` tiers only; removing a core lesson would let an institution
  ship an edition that is not the GWTH course. Core rows render locked with
  the reason stated on screen.
- **D-N7-4 — roster privacy fails closed at the API layer, not the UI.** The
  `hooks.before` refusal applies to `auth.api.*` server calls too, so a future
  page cannot re-open the hole by calling the plugin from the server.
