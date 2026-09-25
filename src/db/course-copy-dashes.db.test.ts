import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

/** Em dash and en dash: banned in every student-facing string. */
const DASH = /[–—]/

/**
 * Bead gwth-launch-dx6. The tone gate only ever sees files, so it could never
 * catch a dash that lives in a database row, and the course title and
 * description both carried one at the top of /course/applied-ai-skills. This
 * checks the rows themselves: the course strings and the section titles, which
 * the course page and the dashboard render as they are.
 */
describeDb("023 course copy carries no dashes (live DB)", () => {
  let sql: ReturnType<typeof postgres>

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/023_course_copy_no_dashes.sql"),
      "utf8"
    )
    // Twice: the migration must be safe to re-run.
    await sql.unsafe(migration)
    await sql.unsafe(migration)
  })

  afterAll(async () => {
    await sql.end()
  })

  it("gives the course a title and description without an em or en dash", async () => {
    const rows = await sql<{ id: string; title: string; description: string | null }[]>`
      SELECT id, title, description FROM courses
    `
    for (const row of rows) {
      expect(row.title, `courses.title for ${row.id}`).not.toMatch(DASH)
      expect(row.description ?? "", `courses.description for ${row.id}`).not.toMatch(DASH)
    }
  })

  it("renders the seeded course with the agreed wording", async () => {
    const [row] = await sql<{ title: string; description: string }[]>`
      SELECT title, description FROM courses WHERE id = 'course_gwth'
    `
    if (!row) return
    expect(row.title).toBe("Applied AI Skills")
    expect(row.description).toContain("transform your career. No coding required.")
  })

  it("keeps section titles free of em and en dashes", async () => {
    const rows = await sql<{ id: string; title: string }[]>`
      SELECT id, title FROM sections
    `
    for (const row of rows) {
      expect(row.title, `sections.title for ${row.id}`).not.toMatch(DASH)
    }
  })
})
