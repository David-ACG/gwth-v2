import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const USER = "page-comments-migration-user"
const ADMIN = "page-comments-migration-admin"
const PATH = "/page-comments-migration/test-page"
const LESSON = "page_comments_migration_lesson"

describeDb("021 + 022 page comments migrations (live DB)", () => {
  let sql: ReturnType<typeof postgres>

  async function cleanup() {
    await sql`DELETE FROM page_comments WHERE user_id IN (${USER}, ${ADMIN})`
    await sql`DELETE FROM beta_testers WHERE user_id IN (${USER}, ${ADMIN})`
    await sql`DELETE FROM "user" WHERE id IN (${USER}, ${ADMIN})`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!, { onnotice: () => {} })
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/021_page_comments.sql"),
      "utf8"
    )
    await sql.unsafe(migration)
    await sql.unsafe(migration)
    // 022 after 021, twice: both must be re-runnable in any environment.
    const hybrid = readFileSync(
      resolve(process.cwd(), "supabase/migrations/022_page_comments_actions.sql"),
      "utf8"
    )
    await sql.unsafe(hybrid)
    await sql.unsafe(hybrid)
    await cleanup()
    await sql`INSERT INTO "user" (id, name, email) VALUES (${USER}, 'Comment User', 'page-comments-migration@example.com')`
    await sql`INSERT INTO "user" (id, name, email) VALUES (${ADMIN}, 'Comment Admin', 'page-comments-migration-admin@example.com')`
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  it("enforces the role, target, status and variant checks", async () => {
    const base = {
      user_id: USER,
      author_email: "x@example.com",
      author_role: "beta",
      page_path: PATH,
      target_type: "text",
      comment: "ok",
    }
    await sql`INSERT INTO page_comments ${sql(base)}`
    await expect(sql`INSERT INTO page_comments ${sql({ ...base, author_role: "student" })}`).rejects.toThrow()
    await expect(sql`INSERT INTO page_comments ${sql({ ...base, target_type: "video" })}`).rejects.toThrow()
    await expect(sql`INSERT INTO page_comments ${sql({ ...base, status: "done" })}`).rejects.toThrow()
    await expect(sql`INSERT INTO page_comments ${sql({ ...base, lesson_variant: "staging" })}`).rejects.toThrow()
    await expect(sql`INSERT INTO page_comments ${sql({ ...base, comment: "x".repeat(4001) })}`).rejects.toThrow()
    const [row] = await sql`SELECT status, site FROM page_comments WHERE user_id = ${USER} LIMIT 1`
    expect(row).toMatchObject({ status: "open", site: "local" })
  })

  it("022: adds the jsonb columns, allows area targets and an empty comment", async () => {
    const columns = await sql`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'page_comments' AND column_name IN ('action', 'shape', 'text_edit')
      ORDER BY column_name`
    expect(columns.map((c) => [c.column_name, c.data_type])).toEqual([
      ["action", "jsonb"],
      ["shape", "jsonb"],
      ["text_edit", "jsonb"],
    ])
    const constraints = await sql`
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'page_comments'::regclass
        AND conname IN ('page_comments_target_type_check', 'page_comments_comment_length_check')`
    expect(constraints).toHaveLength(2)

    const base = {
      user_id: USER,
      author_email: "x@example.com",
      author_role: "beta",
      page_path: PATH,
      target_type: "area",
      comment: "",
    }
    const [row] = await sql`INSERT INTO page_comments ${sql(base)} RETURNING target_type, comment`
    expect(row).toMatchObject({ target_type: "area", comment: "" })
    await expect(sql`INSERT INTO page_comments ${sql({ ...base, target_type: "video" })}`).rejects.toThrow()
  })

  it("the Drizzle data layer round-trips against the real tables", async () => {
    const data = await import("@/lib/data/page-comments")

    await data.setBetaTester(USER, true, ADMIN)
    await data.setBetaTester(USER, true, ADMIN)
    expect(await data.isBetaTester(USER)).toBe(true)
    expect(await data.listBetaTesterIds()).toContain(USER)

    const created = await data.createPageComment({
      pagePath: PATH,
      lessonId: LESSON,
      lessonPage: 3,
      lessonVariant: "draft",
      targetType: "image",
      imageSrc: "https://media.gwth.ai/x.png",
      imageAlt: "A chart",
      comment: "The labels overlap",
      userId: USER,
      authorEmail: "page-comments-migration@example.com",
      authorRole: "beta",
      site: "preview",
      userAgent: "vitest",
    })
    expect(created).toMatchObject({
      pagePath: PATH,
      lessonVariant: "draft",
      targetType: "image",
      status: "open",
      triage: null,
      site: "preview",
    })
    expect(created.createdAt).toMatch(/Z$/)

    const own = await data.getPageCommentsForPath(PATH, { userId: USER })
    expect(own.map((c) => c.id)).toContain(created.id)

    const triage = { by: "opus", at: new Date().toISOString(), verdict: "valid" as const, reason: "Confirmed" }
    const updated = await data.updatePageComment(created.id, { status: "accepted", triage })
    expect(updated).toMatchObject({ status: "accepted", triage })

    const open = await data.listPageComments({ lessonId: LESSON, statuses: ["open"] })
    expect(open.map((c) => c.id)).not.toContain(created.id)
    const accepted = await data.listPageComments({ lessonId: LESSON, statuses: ["accepted"], site: "preview" })
    expect(accepted.map((c) => c.id)).toEqual([created.id])

    await data.updatePageComment(created.id, { status: "withdrawn" })
    const after = await data.getPageCommentsForPath(PATH, { userId: USER })
    expect(after.map((c) => c.id)).not.toContain(created.id)
    expect((await data.getPageComment(created.id))?.status).toBe("withdrawn")

    await data.setBetaTester(USER, false, ADMIN)
    expect(await data.isBetaTester(USER)).toBe(false)
  })

  it("stores the action, shape and text edit, and the page shows every status but withdrawn", async () => {
    const data = await import("@/lib/data/page-comments")
    const hybridPath = `${PATH}/hybrid`
    const author = {
      userId: USER,
      authorEmail: "page-comments-migration@example.com",
      authorRole: "beta" as const,
      site: "local" as const,
    }

    const withAction = await data.createPageComment({
      ...author,
      pagePath: hybridPath,
      targetType: "text",
      quote: "the UK",
      comment: "",
      action: { category: "content", key: "simplify", label: "Simplify this" },
      shape: { kind: "point", rel: { x: 0.5, y: 0.25, w: 0, h: 0 } },
    })
    expect(withAction).toMatchObject({
      comment: "",
      action: { category: "content", key: "simplify", label: "Simplify this" },
      shape: { kind: "point", rel: { x: 0.5, y: 0.25, w: 0, h: 0 } },
    })
    expect("textEdit" in withAction).toBe(false)

    const withEdit = await data.createPageComment({
      ...author,
      pagePath: hybridPath,
      targetType: "area",
      comment: "",
      shape: { kind: "box", rel: { x: 0.1, y: 0.2, w: 0.5, h: 0.3 } },
      textEdit: { original: "the UK", replacement: "Britain" },
    })
    expect(withEdit.textEdit).toEqual({ original: "the UK", replacement: "Britain" })
    const [raw] = await sql`SELECT text_edit FROM page_comments WHERE id = ${withEdit.id}`
    expect(raw?.text_edit).toEqual({ original: "the UK", replacement: "Britain" })

    const fixed = await data.createPageComment({ ...author, pagePath: hybridPath, targetType: "page", comment: "Fixed one" })
    const declined = await data.createPageComment({ ...author, pagePath: hybridPath, targetType: "page", comment: "Declined one" })
    const gone = await data.createPageComment({ ...author, pagePath: hybridPath, targetType: "page", comment: "Withdrawn one" })
    const byAdmin = await data.createPageComment({
      ...author,
      userId: ADMIN,
      authorEmail: "page-comments-migration-admin@example.com",
      authorRole: "admin",
      pagePath: hybridPath,
      targetType: "page",
      comment: "Admin note",
    })
    await data.updatePageComment(fixed.id, { status: "fixed" })
    await data.updatePageComment(declined.id, { status: "declined" })
    await data.updatePageComment(gone.id, { status: "withdrawn" })
    // Pin distinct creation times so "newest first" is tested, not assumed.
    const order = [withAction, withEdit, fixed, declined, gone, byAdmin]
    for (const [index, comment] of order.entries()) {
      await sql`UPDATE page_comments SET created_at = NOW() - make_interval(mins => ${60 - index}) WHERE id = ${comment.id}`
    }

    const own = await data.getPageCommentsForPath(hybridPath, { userId: USER })
    expect(own.map((c) => c.id)).toEqual([declined.id, fixed.id, withEdit.id, withAction.id])
    expect(own.map((c) => c.status)).toEqual(["declined", "fixed", "open", "open"])

    const everyone = await data.getPageCommentsForPath(hybridPath)
    expect(everyone.map((c) => c.id)).toEqual([
      byAdmin.id,
      declined.id,
      fixed.id,
      withEdit.id,
      withAction.id,
    ])

    const listed = await data.listPageComments({ statuses: ["open"] })
    const listedAction = listed.find((c) => c.id === withAction.id)
    expect(listedAction?.action?.label).toBe("Simplify this")
  })
})
