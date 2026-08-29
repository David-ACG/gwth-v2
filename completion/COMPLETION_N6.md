# Completion: N6 — Edition resolution + server-side grading + per-learner score

**Date:** 2026-08-29 · **Repo:** GWTH_V2 (worker lane; foreman records the board)
**Commits (master, local only — DO NOT PUSH/DEPLOY per the freeze):**
`b97a1b9` → `da3e1be` (schema) → `9ccdf8b` (logic) → `e142697` / `04c7a94` / `f039880` (QA rounds 1-3)
**Design:** GWTH-launch-plan / "Institution - Fable Plan" / 05-syllabus-editions-design.md sections 2, 2.3, 3, plus the 7b decisions of 2026-08-28
**QA:** `qa_chain.py N6` ran 4 times; 3 fix rounds applied (the briefed cap), 20 of 24 raised defects fixed; the 5 round-4 survivors are classified in "QA outcome" below (final report: `GWTH-launch-plan/completion/N6/qa-report.md`, 2026-08-29 00:20)
**Status:** built, tested, staging DB migrated (016+017+018). Prod migration + deploy are foreman/David steps (gwth.ai deploy frozen: unpublished commits awaiting David).

## What changed

- **Effective-syllabus resolution** (`src/lib/data/editions.ts`): one
  request-cached ladder — member override → org default edition → the global
  `gwth-default` → a raw-lessons fallback. The LEARNER membership governs
  the syllabus when one exists (unique platform-wide by decision 1's
  index); staff-only users fall back to earliest membership. An empty live
  ORG edition fails CLOSED (empty catalogue); only an empty GLOBAL default
  degrades to the raw table (for B2C that IS the intended syllabus).
- **Catalogue choke points wired, DB-only in DB mode:** `getLessons`,
  `getLesson`, `getCourse`, `getCourses` all filter + order by the edition
  (one shared `filterLessonsByEdition` implementation; sections order by
  their first edition lesson) and never fall through to the bundled mock
  set once a database is configured. Deep links outside the edition 404;
  next-lesson navigation delegates to the edition-ordered adjacency.
- **Server-side grading hardening on top of N2's action:**
  `submitQuizAnswersAction` is edition-gated (a lesson the edition excludes
  cannot be graded, write progress, or reveal its key), grades against the
  effective edition's `pass_mark` (decision 4), sanitizes the submitted
  answers to known question ids within option range, and persists
  `graded_by='server'` + the answer set behind the STANDING best score
  (migration 016 audit trail; worse retries do not replace it). Refusal
  messages honour the persisted `quiz_passed` verdict. Existing rows are
  grandfathered `graded_by='client'` (decision 6).
- **Migrations (staging-applied, idempotence-tested):**
  - `016_server_grading.sql`: `lesson_progress.graded_by` (+CHECK) and
    `quiz_answers`; drops the public quiz-question read policy.
  - `017_edition_integrity.sql`: N5 QA blocking defects 1+2 — default-flag
    scope CHECKs, org-default uniqueness per (organisation, course), and
    BEFORE-trigger guards on both sides of `org_membership.edition_id`
    (cross-tenant edition assignment refused with 23514).
  - `018_quiz_key_rls.sql`: drops the LAST quiz_questions policy —
    default-deny for every non-owner role; the answer key is server-only.
- **Per-learner GWTH Score:** `calculateGwthScore`'s hardcoded 64 default is
  gone (denominator required); `getDynamicScore` uses the effective
  edition's mandatory+ratified set as denominator AND numerator filter,
  including for brand-new learners (per-learner ceiling from day zero).
  Pass mark is threaded end to end; the viewer's session pass state carries
  the server's own verdict, and a persisted pass survives later pass-mark
  rises.
- **N5 QA defect 4 (multi-role CHECK)** resolved by constraining Better
  Auth to SINGLE roles at the application layer (`organizationHooks` +
  `src/lib/org-roles.ts`, clean 400s; invitations refusing `owner` too),
  keeping the 013 CHECKs as backstop — every tenancy invariant treats role
  as a scalar and "tutor,admin" would silently escape them all.

## How to verify

```bash
# Unit suite (no DB): 712 passed | 48 skipped
cd /home/david/projects/GWTH_V2 && npm test

# DB suites against staging (resolution rungs, triggers, grandfathering,
# audit stamps, multi-role backstop): 44 tests
DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
  npx vitest run src/db/ src/lib/data/progress.db.test.ts
```

Local preview (staging DB): `http://192.168.178.50:3001/course/applied-ai-skills`
— a user with no org membership sees the identical lesson list and ordering
as before N6 (gwth-default mirrors `is_optional`; backfilled `sort_order` =
month·1000+order).

**Prod DB migration (foreman/David step, AFTER the deploy freeze lifts).**
Additive + idempotent; safe to run before the code deploy:

```bash
cd /home/david/projects/GWTH_V2
for f in 016_server_grading.sql 017_edition_integrity.sql 018_quiz_key_rls.sql; do
  ssh hetzner "sudo docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql '<prod DATABASE_URL with host 127.0.0.1>' -v ON_ERROR_STOP=1" \
    < supabase/migrations/$f
done
```

## What to verify (3 bullets)

- **B2C golden path**: signed in with a no-org account on :3001, the course
  page and lesson list are byte-identical to pre-N6 (same lessons, same
  order); `src/db/edition-resolution.db.test.ts` pins the same property.
- **Curation actually bites**: the DB tests seed org editions — a learner
  sees the curated, re-ordered list, cannot deep-link or GRADE an excluded
  lesson, is graded against pass mark 80, their score denominator is the
  edition's mandatory count, and an empty org edition shows an empty
  catalogue (never the raw one).
- **Integrity**: on staging, `UPDATE org_membership SET edition_id =
  <another org's edition>` is refused (23514); marking an org-owned edition
  `is_default = TRUE` is refused; `SELECT COUNT(*) FROM pg_policies WHERE
  tablename='quiz_questions'` is 0.

## QA outcome (4 rounds; 3 fix rounds = the briefed cap)

Rounds 1-3 raised 19 defects; all were fixed (commits `e142697`,
`04c7a94`, `f039880`) except two round-3 findings rebutted with evidence
(the 017 "wrong column name" claim — the column IS `organisation_id`,
proven by `\d org_membership` on staging and by the trigger firing in
`src/db/n6-migrations.db.test.ts`; and the "no persisted quiz verdict"
claim — `lesson_progress.quiz_passed` is exactly that, written at grading
time and honoured by the closure guard). Round 4 (post-cap, not acted on
with further rounds) reported 5 defects, classified:

1. Viewer pass-state divergence for a first-time learner — FACTUALLY
   WRONG: the hook reconciles `result.progress` into state on every
   graded submission and the viewer takes `lastQuizPassed` verbatim from
   the same server result, so the described stale window does not exist.
2. `quiz_questions` missing `.enableRLS()` in drizzle/schema.ts — REAL
   but theoretical (drizzle-kit push is never run; SQL migrations are
   canonical); fixed anyway as a one-liner in the final commit.
3. Empty live GLOBAL edition degrades to the raw catalogue — DELIBERATE,
   documented design decision (design 05 s2.1 rung 4: a broken seed must
   never blank the B2C product; org editions DO fail closed). Recorded as
   a David-taste trade-off: once institution-exclusive lessons exist, he
   may prefer global-empty to fail closed too — a one-line change in
   `assembleEdition` (src/lib/data/editions.ts).
4. A section-grouped catalogue cannot render a cross-section-interleaved
   edition order — INHERENT UI limitation, documented in courses.ts;
   sections follow the edition's first-lesson order and navigation uses
   the flat edition order. A flat catalogue redesign is beyond N6.
5. "The grading write path has no edition gate" — FACTUALLY WRONG: the
   only client-reachable grading entry, `submitQuizAnswersAction`, checks
   `isLessonInEdition` after authorization and before any key read or
   write (round-1 fix, covered by the "refuses to grade a lesson the
   caller's edition EXCLUDES" test in src/lib/actions/progress.test.ts).

Style notes from all rounds ride this packet as advisory; the ones acted
on are listed in the QA-round commit messages.
