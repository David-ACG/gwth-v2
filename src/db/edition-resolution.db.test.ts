/**
 * N6 — live-DB tests for effective-syllabus resolution (design 05 section 2)
 * and the server-grading audit stamp (016), through the REAL data layer:
 * `getEffectiveEdition` / `getLessons` / `getLesson` / `getMandatoryLessonIds`
 * / `getEffectivePassMark` / `recordQuizSubmission` against the dev Postgres.
 *
 * Every fallback rung is proven:
 *   rung 1 — member with an explicit edition override (live, own org/global)
 *   rung 2 — org member without an override -> the org's default edition
 *   rung 3 — B2C user (no membership) -> the course's global default
 *   rung 4 — course with no live edition at all -> the raw lessons fallback
 * plus: a NON-live (draft) override is skipped down the ladder, draft
 * edition_lessons rows are invisible, deep links outside the edition
 * resolve null, the mandatory set/pass mark follow the edition, and a
 * server-graded submission stamps graded_by='server' + quiz_answers.
 *
 * `getCurrentUser` is mocked so each test picks the "logged-in" user; all
 * queries are the real modules hitting the real database.
 *
 * SKIPPED unless DATABASE_URL is set. Run with:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/db/edition-resolution.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

// Mock the auth accessor; each test sets which user is "current".
const currentUser = vi.hoisted(() => ({ id: null as string | null }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () =>
    currentUser.id ? { id: currentUser.id } : null,
}))

const COURSE_A = "n6r_course_a" // has editions
const COURSE_B = "n6r_course_b" // has NO editions (rung 4)
const SECTION_A = "n6r_section_a"
const SECTION_B = "n6r_section_b"
const L = {
  a1: "n6r_lesson_a1",
  a2: "n6r_lesson_a2",
  a3: "n6r_lesson_a3",
  a4: "n6r_lesson_a4",
  b1: "n6r_lesson_b1",
}
const ORG_A = "n6r_org_a"
const ORG_B = "n6r_org_b"
const ORG_C = "n6r_org_c" // its default edition is live but EMPTY
const ED_GLOBAL = "n6r_ed_global"
const ED_ORG = "n6r_ed_org"
const ED_OVERRIDE = "n6r_ed_override"
const ED_DRAFT = "n6r_ed_draft" // status draft: never resolvable
const ED_OTHER = "n6r_ed_other" // org B's edition
const ED_EMPTY = "n6r_ed_empty" // org C's default: live, zero lessons
const USER_B2C = "n6r-user-b2c"
const USER_MEMBER = "n6r-user-member"
const USER_OVERRIDE = "n6r-user-override"
const USER_EMPTY = "n6r-user-empty"

describeDb("effective-syllabus resolution (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let editions: typeof import("@/lib/data/editions")
  let lessonsData: typeof import("@/lib/data/lessons")
  let progressData: typeof import("@/lib/data/progress")

  function setUser(id: string | null) {
    currentUser.id = id
  }

  async function cleanup() {
    await sql`DELETE FROM lesson_progress WHERE lesson_id IN ${sql(Object.values(L))}`
    await sql`DELETE FROM org_membership WHERE organisation_id IN (${ORG_A}, ${ORG_B}, ${ORG_C})`
    await sql`DELETE FROM syllabus_edition WHERE id IN (${ED_GLOBAL}, ${ED_ORG}, ${ED_OVERRIDE}, ${ED_DRAFT}, ${ED_OTHER}, ${ED_EMPTY})`
    await sql`DELETE FROM lessons WHERE id IN ${sql(Object.values(L))}`
    await sql`DELETE FROM sections WHERE id IN (${SECTION_A}, ${SECTION_B})`
    await sql`DELETE FROM courses WHERE id IN (${COURSE_A}, ${COURSE_B})`
    await sql`DELETE FROM organisation WHERE id IN (${ORG_A}, ${ORG_B}, ${ORG_C})`
    await sql`DELETE FROM "user" WHERE id IN (${USER_B2C}, ${USER_MEMBER}, ${USER_OVERRIDE}, ${USER_EMPTY})`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    editions = await import("@/lib/data/editions")
    lessonsData = await import("@/lib/data/lessons")
    progressData = await import("@/lib/data/progress")

    await cleanup()
    await sql`
      INSERT INTO "user" (id, name, email, created_at, updated_at) VALUES
        (${USER_B2C}, 'N6R B2C', 'n6r-b2c@example.com', NOW(), NOW()),
        (${USER_MEMBER}, 'N6R Member', 'n6r-member@example.com', NOW(), NOW()),
        (${USER_OVERRIDE}, 'N6R Override', 'n6r-override@example.com', NOW(), NOW()),
        (${USER_EMPTY}, 'N6R Empty', 'n6r-empty@example.com', NOW(), NOW())
    `
    await sql`
      INSERT INTO organisation (id, name, slug, type) VALUES
        (${ORG_A}, 'N6R Org A', 'n6r-org-a', 'institution'),
        (${ORG_B}, 'N6R Org B', 'n6r-org-b', 'company'),
        (${ORG_C}, 'N6R Org C', 'n6r-org-c', 'institution')
    `
    await sql`
      INSERT INTO courses (id, slug, title) VALUES
        (${COURSE_A}, ${COURSE_A}, 'N6R Course A'),
        (${COURSE_B}, ${COURSE_B}, 'N6R Course B')
    `
    await sql`
      INSERT INTO sections (id, course_id, title, month) VALUES
        (${SECTION_A}, ${COURSE_A}, 'N6R Section A', 1),
        (${SECTION_B}, ${COURSE_B}, 'N6R Section B', 1)
    `
    await sql`
      INSERT INTO lessons (id, slug, title, section_id, course_id, course_slug, month, "order") VALUES
        (${L.a1}, ${L.a1}, 'A1', ${SECTION_A}, ${COURSE_A}, ${COURSE_A}, 1, 1),
        (${L.a2}, ${L.a2}, 'A2', ${SECTION_A}, ${COURSE_A}, ${COURSE_A}, 1, 2),
        (${L.a3}, ${L.a3}, 'A3', ${SECTION_A}, ${COURSE_A}, ${COURSE_A}, 1, 3),
        (${L.a4}, ${L.a4}, 'A4', ${SECTION_A}, ${COURSE_A}, ${COURSE_A}, 1, 4),
        (${L.b1}, ${L.b1}, 'B1', ${SECTION_B}, ${COURSE_B}, ${COURSE_B}, 1, 1)
    `
    await sql`
      INSERT INTO syllabus_edition
        (id, organisation_id, course_id, name, slug, status, is_default, is_org_default, pass_mark) VALUES
        (${ED_GLOBAL}, NULL, ${COURSE_A}, 'Global', ${ED_GLOBAL}, 'live', TRUE, FALSE, 67),
        (${ED_ORG}, ${ORG_A}, ${COURSE_A}, 'Org A default', ${ED_ORG}, 'live', FALSE, TRUE, 80),
        (${ED_OVERRIDE}, ${ORG_A}, ${COURSE_A}, 'Org A override', ${ED_OVERRIDE}, 'live', FALSE, FALSE, 90),
        (${ED_DRAFT}, ${ORG_A}, ${COURSE_A}, 'Org A draft ed', ${ED_DRAFT}, 'draft', FALSE, FALSE, 95),
        (${ED_OTHER}, ${ORG_B}, ${COURSE_A}, 'Org B edition', ${ED_OTHER}, 'live', FALSE, FALSE, 50),
        (${ED_EMPTY}, ${ORG_C}, ${COURSE_A}, 'Org C empty', ${ED_EMPTY}, 'live', FALSE, TRUE, 75)
    `
    // Global default: a1 core mandatory, a2 core mandatory, a3 optional
    // non-mandatory. a4 deliberately absent (proves filtering).
    await sql`
      INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order) VALUES
        (${ED_GLOBAL}, ${L.a1}, 'core', 'ratified', TRUE, 1001),
        (${ED_GLOBAL}, ${L.a2}, 'core', 'ratified', TRUE, 1002),
        (${ED_GLOBAL}, ${L.a3}, 'optional', 'ratified', FALSE, 1003)
    `
    // Org A default: a4 exclusive-mandatory FIRST (custom sort), a1 core
    // mandatory, a2 present but DRAFT (unratified: invisible + uncounted).
    await sql`
      INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order) VALUES
        (${ED_ORG}, ${L.a4}, 'exclusive', 'ratified', TRUE, 10),
        (${ED_ORG}, ${L.a1}, 'core', 'ratified', TRUE, 20),
        (${ED_ORG}, ${L.a2}, 'exclusive', 'draft', TRUE, 30)
    `
    // Override edition: a1 only.
    await sql`
      INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order) VALUES
        (${ED_OVERRIDE}, ${L.a1}, 'core', 'ratified', TRUE, 1)
    `
    // Memberships: both learners in org A; one carries the override.
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role, edition_id) VALUES
        ('n6r_mem_member', ${ORG_A}, ${USER_MEMBER}, 'learner', NULL),
        ('n6r_mem_override', ${ORG_A}, ${USER_OVERRIDE}, 'learner', ${ED_OVERRIDE}),
        ('n6r_mem_empty', ${ORG_C}, ${USER_EMPTY}, 'learner', NULL)
    `
    // QA round-2 defect 7: USER_EMPTY is ALSO a tutor in org A, with an
    // EARLIER created_at. Resolution must still follow the LEARNER
    // membership (org C), never the older staff membership.
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role, created_at) VALUES
        ('n6r_mem_empty_tutor', ${ORG_A}, ${USER_EMPTY}, 'tutor', NOW() - INTERVAL '30 days')
    `
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  it("rung 3: a B2C user resolves to the course's global default", async () => {
    setUser(USER_B2C)
    const edition = await editions.getEffectiveEdition(COURSE_A)
    expect(edition.source).toBe("global-default")
    expect(edition.editionId).toBe(ED_GLOBAL)
    expect(edition.passMark).toBe(67)

    const list = await lessonsData.getLessons(COURSE_A)
    expect(list.map((l) => l.id)).toEqual([L.a1, L.a2, L.a3]) // a4 hidden
  })

  it("rung 2: an org member without an override gets the org default edition", async () => {
    setUser(USER_MEMBER)
    const edition = await editions.getEffectiveEdition(COURSE_A)
    expect(edition.source).toBe("org-default")
    expect(edition.editionId).toBe(ED_ORG)
    expect(edition.passMark).toBe(80)
    expect(await editions.getEffectivePassMark(COURSE_A)).toBe(80)

    // Edition sort_order governs (a4 first); the DRAFT a2 row is invisible;
    // a3 is outside the edition entirely.
    const list = await lessonsData.getLessons(COURSE_A)
    expect(list.map((l) => l.id)).toEqual([L.a4, L.a1])

    // The score denominator counts mandatory AND ratified only: a2 is
    // mandatory but draft, so it does not count yet.
    const mandatory = await editions.getMandatoryLessonIds(COURSE_A)
    expect([...mandatory].sort()).toEqual([L.a1, L.a4].sort())
  })

  it("rung 1: a per-member override wins over the org default", async () => {
    setUser(USER_OVERRIDE)
    const edition = await editions.getEffectiveEdition(COURSE_A)
    expect(edition.source).toBe("member-override")
    expect(edition.editionId).toBe(ED_OVERRIDE)
    expect(edition.passMark).toBe(90)

    const list = await lessonsData.getLessons(COURSE_A)
    expect(list.map((l) => l.id)).toEqual([L.a1])
  })

  it("a NON-live (draft/unratified) override is skipped down to the org default", async () => {
    await sql`UPDATE org_membership SET edition_id = ${ED_DRAFT} WHERE id = 'n6r_mem_override'`
    try {
      setUser(USER_OVERRIDE)
      const edition = await editions.getEffectiveEdition(COURSE_A)
      expect(edition.source).toBe("org-default")
      expect(edition.editionId).toBe(ED_ORG)
    } finally {
      await sql`UPDATE org_membership SET edition_id = ${ED_OVERRIDE} WHERE id = 'n6r_mem_override'`
    }
  })

  it("rung 4: a course with no live edition serves the raw lessons fallback", async () => {
    setUser(USER_MEMBER)
    const edition = await editions.getEffectiveEdition(COURSE_B)
    expect(edition.source).toBe("fallback")
    expect(edition.lessons).toBeNull()
    expect(edition.passMark).toBe(67)

    const list = await lessonsData.getLessons(COURSE_B)
    expect(list.map((l) => l.id)).toEqual([L.b1])
  })

  it("deep link outside the edition resolves null (the page 404s)", async () => {
    setUser(USER_MEMBER)
    // a3 exists in the DB but is not in org A's edition.
    expect(await lessonsData.getLesson(L.a3)).toBeNull()
    // a4 is exclusive to org A and resolves fine for the member...
    const a4 = await lessonsData.getLesson(L.a4)
    expect(a4?.id).toBe(L.a4)
    // ...but a B2C user on the global default cannot reach it.
    setUser(USER_B2C)
    expect(await lessonsData.getLesson(L.a4)).toBeNull()
  })

  it("an EMPTY live org edition fails CLOSED, and the LEARNER membership outranks an older staff one", async () => {
    // USER_EMPTY: tutor in org A (older row) + learner in org C. The
    // learner seat governs the syllabus (QA round-2 defect 7), and org C's
    // empty live edition fails closed (QA round-1 defect 3).
    setUser(USER_EMPTY)
    const edition = await editions.getEffectiveEdition(COURSE_A)
    expect(edition.source).toBe("org-default")
    expect(edition.editionId).toBe(ED_EMPTY)
    expect(edition.organisationId).toBe(ORG_C)
    expect(edition.lessons).not.toBeNull()
    expect(edition.lessons!.size).toBe(0)

    // Nothing leaks: no lessons, no deep links, empty mandatory set.
    expect(await lessonsData.getLessons(COURSE_A)).toEqual([])
    expect(await lessonsData.getLesson(L.a1)).toBeNull()
    expect((await editions.getMandatoryLessonIds(COURSE_A)).size).toBe(0)
  })

  it("a server-graded submission stamps graded_by='server' with the answer audit trail (016)", async () => {
    setUser(USER_MEMBER)
    const outcome = await progressData.recordQuizSubmission(L.a1, 100, {
      passMark: 80,
      maxAttempts: 3,
      answers: { q1: 1, q2: 0 },
    })
    expect(outcome.outcome).toBe("recorded")

    const [row] = await sql`
      SELECT graded_by, quiz_answers, quiz_passed FROM lesson_progress
      WHERE user_id = ${USER_MEMBER} AND lesson_id = ${L.a1}
    `
    expect(row!.graded_by).toBe("server")
    expect(row!.quiz_answers).toEqual({ q1: 1, q2: 0 })
    expect(row!.quiz_passed).toBe(true)
  })
})
