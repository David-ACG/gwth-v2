/**
 * N6 — live-DB tests for the server-grading + edition-integrity migrations
 * (supabase/migrations/016/017).
 *
 * Proves, against the real dev Postgres:
 *   1. Both migrations are idempotent — re-running the committed SQL files
 *      changes nothing and errors nowhere.
 *   2. 016: lesson_progress.graded_by defaults 'client' (grandfathering,
 *      decision 6), its CHECK rejects other values, quiz_answers exists, and
 *      the "Public can read quiz questions" policy is GONE.
 *   3. 017 defect-2 fix: an org-owned edition cannot become the global
 *      default, is_org_default cannot ride an org-NULL row, and one org can
 *      hold at most one default edition per course.
 *   4. 017 defect-1 fix: a membership cannot point at ANOTHER org's edition
 *      (trigger, both directions), while own-org and global editions assign
 *      fine.
 *   5. 013 backstop for the N5 QA defect-4 decision: comma-separated
 *      multi-role values are still rejected by the single-role CHECK (the
 *      clean refusal lives in the Better Auth organizationHooks).
 *
 * SKIPPED unless DATABASE_URL is set (same convention as the sibling suites).
 * Run with:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/db/n6-migrations.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const MIGRATIONS = ["016_server_grading.sql", "017_edition_integrity.sql"] as const

function migrationSql(name: string): string {
  return readFileSync(
    resolve(process.cwd(), "supabase", "migrations", name),
    "utf8",
  )
}

// Test fixture ids (cleaned up on both sides of the run).
const ORG_A = "n6m_org_a"
const ORG_B = "n6m_org_b"
const USER_1 = "n6m-user-1"
const COURSE = "n6m_course"
const SECTION = "n6m_section"
const LESSON = "n6m_lesson_1"
const ED_A = "n6m_ed_a" // org A's edition
const ED_B = "n6m_ed_b" // org B's edition
const ED_G = "n6m_ed_g" // global (org NULL) edition

describeDb("016/017 server grading + edition integrity (live DB)", () => {
  let sql: ReturnType<typeof postgres>

  async function cleanup() {
    await sql`DELETE FROM lesson_progress WHERE lesson_id = ${LESSON}`
    await sql`DELETE FROM org_membership WHERE organisation_id IN (${ORG_A}, ${ORG_B})`
    await sql`DELETE FROM syllabus_edition WHERE id IN (${ED_A}, ${ED_B}, ${ED_G})`
    await sql`DELETE FROM lessons WHERE id = ${LESSON}`
    await sql`DELETE FROM sections WHERE id = ${SECTION}`
    await sql`DELETE FROM courses WHERE id = ${COURSE}`
    await sql`DELETE FROM organisation WHERE id IN (${ORG_A}, ${ORG_B})`
    await sql`DELETE FROM "user" WHERE id = ${USER_1}`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    await cleanup()
    await sql`
      INSERT INTO "user" (id, name, email, created_at, updated_at)
      VALUES (${USER_1}, 'N6M User', 'n6m-user-1@example.com', NOW(), NOW())
    `
    await sql`
      INSERT INTO organisation (id, name, slug, type)
      VALUES (${ORG_A}, 'N6M Org A', 'n6m-org-a', 'institution'),
             (${ORG_B}, 'N6M Org B', 'n6m-org-b', 'company')
    `
    await sql`INSERT INTO courses (id, slug, title) VALUES (${COURSE}, ${COURSE}, 'N6M Course')`
    await sql`INSERT INTO sections (id, course_id, title, month) VALUES (${SECTION}, ${COURSE}, 'N6M Section', 1)`
    await sql`
      INSERT INTO lessons (id, slug, title, section_id, course_id, course_slug, month)
      VALUES (${LESSON}, ${LESSON}, 'N6M Lesson', ${SECTION}, ${COURSE}, ${COURSE}, 1)
    `
    await sql`
      INSERT INTO syllabus_edition (id, organisation_id, course_id, name, slug, status)
      VALUES (${ED_A}, ${ORG_A}, ${COURSE}, 'Org A edition', ${ED_A}, 'live'),
             (${ED_B}, ${ORG_B}, ${COURSE}, 'Org B edition', ${ED_B}, 'live'),
             (${ED_G}, NULL,     ${COURSE}, 'Global edition', ${ED_G}, 'live')
    `
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  it("re-runs both committed migration files without error (idempotence)", async () => {
    for (const name of MIGRATIONS) {
      await sql.unsafe(migrationSql(name))
      await sql.unsafe(migrationSql(name))
    }
  })

  it("016: graded_by defaults 'client' (grandfathering), CHECK rejects junk, quiz_answers exists", async () => {
    await sql`
      INSERT INTO lesson_progress (user_id, lesson_id, is_completed, progress)
      VALUES (${USER_1}, ${LESSON}, FALSE, 0)
    `
    const [row] = await sql`
      SELECT graded_by, quiz_answers FROM lesson_progress
      WHERE user_id = ${USER_1} AND lesson_id = ${LESSON}
    `
    expect(row!.graded_by).toBe("client")
    expect(row!.quiz_answers).toBeNull()

    await expect(
      sql`
        UPDATE lesson_progress SET graded_by = 'oracle'
        WHERE user_id = ${USER_1} AND lesson_id = ${LESSON}
      `,
    ).rejects.toMatchObject({ code: "23514" })

    await sql`
      UPDATE lesson_progress
      SET graded_by = 'server', quiz_answers = '{"q1": 2}'::jsonb
      WHERE user_id = ${USER_1} AND lesson_id = ${LESSON}
    `
    const [updated] = await sql`
      SELECT graded_by, quiz_answers FROM lesson_progress
      WHERE user_id = ${USER_1} AND lesson_id = ${LESSON}
    `
    expect(updated!.graded_by).toBe("server")
    expect(updated!.quiz_answers).toEqual({ q1: 2 })
  })

  it("016: the public quiz-question read policy is gone", async () => {
    const rows = await sql`
      SELECT policyname FROM pg_policies
      WHERE tablename = 'quiz_questions'
        AND policyname = 'Public can read quiz questions'
    `
    expect(rows.length).toBe(0)
  })

  it("017: an org-owned edition can never become the global default", async () => {
    await expect(
      sql`UPDATE syllabus_edition SET is_default = TRUE WHERE id = ${ED_A}`,
    ).rejects.toMatchObject({ code: "23514" })
  })

  it("017: is_org_default cannot ride an org-NULL (global) edition", async () => {
    await expect(
      sql`UPDATE syllabus_edition SET is_org_default = TRUE WHERE id = ${ED_G}`,
    ).rejects.toMatchObject({ code: "23514" })
  })

  it("017: one org default per (org, course); a second is rejected by the index", async () => {
    await sql`UPDATE syllabus_edition SET is_org_default = TRUE WHERE id = ${ED_A}`
    await sql`
      INSERT INTO syllabus_edition (id, organisation_id, course_id, name, slug, status, is_org_default)
      VALUES ('n6m_ed_a2', ${ORG_A}, ${COURSE}, 'Org A second', 'n6m_ed_a2', 'live', FALSE)
    `
    await expect(
      sql`UPDATE syllabus_edition SET is_org_default = TRUE WHERE id = 'n6m_ed_a2'`,
    ).rejects.toMatchObject({ code: "23505" })
    await sql`DELETE FROM syllabus_edition WHERE id = 'n6m_ed_a2'`
  })

  it("017: a membership cannot be pointed at ANOTHER org's edition (defect 1)", async () => {
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role)
      VALUES ('n6m_mem_1', ${ORG_A}, ${USER_1}, 'learner')
    `
    // Cross-tenant: refused with a CHECK-style violation, not accepted.
    await expect(
      sql`UPDATE org_membership SET edition_id = ${ED_B} WHERE id = 'n6m_mem_1'`,
    ).rejects.toMatchObject({ code: "23514" })

    // Own org and global both assign fine.
    await sql`UPDATE org_membership SET edition_id = ${ED_A} WHERE id = 'n6m_mem_1'`
    await sql`UPDATE org_membership SET edition_id = ${ED_G} WHERE id = 'n6m_mem_1'`
    const [row] = await sql`
      SELECT edition_id FROM org_membership WHERE id = 'n6m_mem_1'
    `
    expect(row!.edition_id).toBe(ED_G)
  })

  it("017: re-homing an edition under members of another org is refused (reverse guard)", async () => {
    await sql`UPDATE org_membership SET edition_id = ${ED_A} WHERE id = 'n6m_mem_1'`
    // ED_A is referenced by an ORG_A member; moving it to ORG_B would strand them.
    await expect(
      sql`UPDATE syllabus_edition SET organisation_id = ${ORG_B} WHERE id = ${ED_A}`,
    ).rejects.toMatchObject({ code: "23514" })
    // Going global is always safe.
    await sql`UPDATE syllabus_edition SET organisation_id = NULL, is_org_default = FALSE WHERE id = ${ED_A}`
    const [row] = await sql`SELECT organisation_id FROM syllabus_edition WHERE id = ${ED_A}`
    expect(row!.organisation_id).toBeNull()
  })

  it("013 backstop: comma-separated multi-role values are still rejected (single-role decision)", async () => {
    await expect(
      sql`
        INSERT INTO org_membership (id, organisation_id, user_id, role)
        VALUES ('n6m_mem_multi', ${ORG_B}, ${USER_1}, 'tutor,admin')
      `,
    ).rejects.toMatchObject({ code: "23514" })
  })
})
