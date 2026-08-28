/**
 * N5 — live-DB tests for the org-tenancy + syllabus-editions migrations
 * (supabase/migrations/013/014/015).
 *
 * Proves, against the real dev Postgres:
 *   1. All three migrations are idempotent — re-running the exact committed
 *      SQL files changes nothing and errors nowhere.
 *   2. The gwth-default backfill mirrors lessons.is_optional exactly (tier +
 *      is_mandatory row-by-row, no missing and no extra rows).
 *   3. Org membership uniqueness: (organisation_id, user_id) is unique, and a
 *      LEARNER cannot belong to two orgs (decision 1, partial unique index)
 *      while an admin can.
 *   4. The 015 constraint widening: org_seat / org values are accepted by
 *      user_access, unknown values still rejected.
 *
 * SKIPPED unless DATABASE_URL is set (same convention as progress.db.test.ts).
 * Run with:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/db/org-tenancy-migrations.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const MIGRATIONS = [
  "013_org_tenancy.sql",
  "014_syllabus_editions.sql",
  "015_lift_constraints.sql",
] as const

function migrationSql(name: string): string {
  return readFileSync(
    // vitest runs from the repo root; import.meta.url is not reliable under
    // the jsdom transform, so resolve from cwd.
    resolve(process.cwd(), "supabase", "migrations", name),
    "utf8",
  )
}

// Test fixture ids (cleaned up on both sides of the run).
const ORG_A = "n5_test_org_a"
const ORG_B = "n5_test_org_b"
const USER_L = "n5-test-user-learner"
const USER_M = "n5-test-user-admin"

describeDb("013-015 org tenancy migrations (live DB)", () => {
  let sql: ReturnType<typeof postgres>

  async function cleanup() {
    await sql`DELETE FROM user_access WHERE user_id IN (${USER_L}, ${USER_M})`
    await sql`DELETE FROM org_membership WHERE organisation_id IN (${ORG_A}, ${ORG_B})`
    await sql`DELETE FROM organisation WHERE id IN (${ORG_A}, ${ORG_B})`
    await sql`DELETE FROM "user" WHERE id IN (${USER_L}, ${USER_M})`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    await cleanup()
    await sql`
      INSERT INTO "user" (id, name, email, created_at, updated_at)
      VALUES
        (${USER_L}, 'N5 Learner', 'n5-learner@example.com', NOW(), NOW()),
        (${USER_M}, 'N5 Admin', 'n5-admin@example.com', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `
    await sql`
      INSERT INTO organisation (id, name, slug, type)
      VALUES
        (${ORG_A}, 'N5 Test Org A', 'n5-test-org-a', 'institution'),
        (${ORG_B}, 'N5 Test Org B', 'n5-test-org-b', 'company')
      ON CONFLICT (id) DO NOTHING
    `
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  it("re-runs all three committed migration files without error (idempotence)", async () => {
    for (const name of MIGRATIONS) {
      // simple-protocol multi-statement execution, exactly what psql applies
      await sql.unsafe(migrationSql(name))
    }
    // And the backfill did not duplicate anything:
    const [dupes] = await sql`
      SELECT COUNT(*)::int AS n FROM (
        SELECT lesson_id FROM edition_lessons
        WHERE edition_id = 'gwth-default'
        GROUP BY lesson_id HAVING COUNT(*) > 1
      ) d
    `
    expect(dupes!.n).toBe(0)
  })

  it("backfilled gwth-default to mirror lessons.is_optional exactly", async () => {
    const [edition] = await sql`
      SELECT status, is_default, pass_mark FROM syllabus_edition WHERE id = 'gwth-default'
    `
    expect(edition).toBeDefined()
    expect(edition!.status).toBe("live")
    expect(edition!.is_default).toBe(true)
    expect(edition!.pass_mark).toBe(67)

    // Row-by-row: every lesson appears once, tier and is_mandatory derive
    // from is_optional, and there are no edition rows without a lesson.
    const [mismatch] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE el.lesson_id IS NULL)::int AS missing,
        COUNT(*) FILTER (
          WHERE el.lesson_id IS NOT NULL AND (
            el.tier <> CASE WHEN l.is_optional THEN 'optional' ELSE 'core' END
            OR el.is_mandatory <> NOT l.is_optional
            OR el.state <> 'ratified'
          )
        )::int AS wrong
      FROM lessons l
      LEFT JOIN edition_lessons el
        ON el.edition_id = 'gwth-default' AND el.lesson_id = l.id
    `
    expect(mismatch!.missing).toBe(0)
    expect(mismatch!.wrong).toBe(0)

    const [counts] = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM lessons) AS lessons,
        (SELECT COUNT(*)::int FROM edition_lessons WHERE edition_id = 'gwth-default') AS edition_rows,
        (SELECT COUNT(*)::int FROM lessons WHERE NOT is_optional) AS core_lessons,
        (SELECT COUNT(*)::int FROM edition_lessons
          WHERE edition_id = 'gwth-default' AND tier = 'core') AS core_rows
    `
    expect(counts!.edition_rows).toBe(counts!.lessons)
    expect(counts!.core_rows).toBe(counts!.core_lessons)
  })

  it("rejects a duplicate (organisation, user) membership", async () => {
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role)
      VALUES ('n5_mem_l_a', ${ORG_A}, ${USER_L}, 'learner')
    `
    await expect(
      sql`
        INSERT INTO org_membership (id, organisation_id, user_id, role)
        VALUES ('n5_mem_l_a2', ${ORG_A}, ${USER_L}, 'learner')
      `,
    ).rejects.toMatchObject({ code: "23505" })
  })

  it("rejects a learner joining a SECOND org (decision 1) but lets an admin span orgs", async () => {
    // USER_L is already a learner in ORG_A from the previous test.
    await expect(
      sql`
        INSERT INTO org_membership (id, organisation_id, user_id, role)
        VALUES ('n5_mem_l_b', ${ORG_B}, ${USER_L}, 'learner')
      `,
    ).rejects.toMatchObject({ code: "23505" })

    // Non-learner roles are outside the partial index: two orgs is fine.
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role)
      VALUES ('n5_mem_m_a', ${ORG_A}, ${USER_M}, 'admin'),
             ('n5_mem_m_b', ${ORG_B}, ${USER_M}, 'admin')
    `
    const [row] = await sql`
      SELECT COUNT(*)::int AS n FROM org_membership WHERE user_id = ${USER_M}
    `
    expect(row!.n).toBe(2)
  })

  it("accepts org_seat/org on user_access after 015, still rejects unknown values", async () => {
    await sql`
      INSERT INTO user_access (user_id, access_source, subscription_state, subscription_month)
      VALUES (${USER_L}, 'org_seat', 'org', 0)
    `
    const [row] = await sql`
      SELECT access_source, subscription_state, stripe_customer_id
      FROM user_access WHERE user_id = ${USER_L}
    `
    // Decision 7 (hybrid billing): invoice-billed org seats keep Stripe NULL.
    expect(row!.access_source).toBe("org_seat")
    expect(row!.subscription_state).toBe("org")
    expect(row!.stripe_customer_id).toBeNull()

    await expect(
      sql`
        INSERT INTO user_access (user_id, access_source, subscription_state, subscription_month)
        VALUES (${USER_M}, 'made_up_source', 'org', 0)
      `,
    ).rejects.toMatchObject({ code: "23514" })
  })

  it("keeps the month CHECKs (decision 8: NOT lifted)", async () => {
    await expect(
      sql`
        INSERT INTO user_access (user_id, access_source, subscription_state, subscription_month)
        VALUES (${USER_M}, 'org_seat', 'org', 4)
      `,
    ).rejects.toMatchObject({ code: "23514" })
    const [check] = await sql`
      SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
      WHERE conname = 'lessons_month_check'
    `
    expect(check!.def).toContain("1, 2, 3")
  })
})
