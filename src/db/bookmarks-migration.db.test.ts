import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const USER = "bookmark-migration-user"
const COURSE = "bookmark-migration-course"
const SECTION = "bookmark-migration-section"
const LESSON = "bookmark-migration-lesson"
const LAB = "bookmark-migration-lab"

describeDb("020 bookmark persistence migration (live DB)", () => {
  let sql: ReturnType<typeof postgres>

  async function cleanup() {
    await sql`DELETE FROM bookmarks WHERE user_id = ${USER}`
    await sql`DELETE FROM lessons WHERE id = ${LESSON}`
    await sql`DELETE FROM sections WHERE id = ${SECTION}`
    await sql`DELETE FROM courses WHERE id = ${COURSE}`
    await sql`DELETE FROM labs WHERE id = ${LAB}`
    await sql`DELETE FROM "user" WHERE id = ${USER}`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/020_bookmarks.sql"),
      "utf8"
    )
    await sql.unsafe(migration)
    await sql.unsafe(migration)
    await cleanup()
    await sql`INSERT INTO "user" (id, name, email) VALUES (${USER}, 'Bookmark User', 'bookmark-migration@example.com')`
    await sql`INSERT INTO courses (id, slug, title) VALUES (${COURSE}, ${COURSE}, 'Bookmark Course')`
    await sql`INSERT INTO sections (id, course_id, title, month) VALUES (${SECTION}, ${COURSE}, 'Bookmark Section', 1)`
    await sql`INSERT INTO lessons (id, slug, title, section_id, course_id, course_slug, month) VALUES (${LESSON}, ${LESSON}, 'Bookmark Lesson', ${SECTION}, ${COURSE}, ${COURSE}, 1)`
    await sql`INSERT INTO labs (id, slug, title) VALUES (${LAB}, ${LAB}, 'Bookmark Lab')`
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  it("persists one lesson and one lab per user but rejects ambiguous targets", async () => {
    await sql`INSERT INTO bookmarks (user_id, lesson_id) VALUES (${USER}, ${LESSON})`
    await sql`INSERT INTO bookmarks (user_id, lab_id) VALUES (${USER}, ${LAB})`

    const rows = await sql`SELECT lesson_id, lab_id FROM bookmarks WHERE user_id = ${USER}`
    expect(rows).toHaveLength(2)
    await expect(
      sql`INSERT INTO bookmarks (user_id, lesson_id) VALUES (${USER}, ${LESSON})`
    ).rejects.toThrow()
    await expect(
      sql`INSERT INTO bookmarks (user_id, lesson_id, lab_id) VALUES (${USER}, ${LESSON}, ${LAB})`
    ).rejects.toThrow()
  })
})
