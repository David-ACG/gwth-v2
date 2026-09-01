/**
 * N7 — the institution admin WRITE paths against a live Postgres.
 *
 * The unit suite (src/lib/actions/org-admin.test.ts) proves the authority
 * rules with a mocked DB, which is exactly what it should do — but a mock
 * that ignores `where()` predicates can pass whether or not the guard clauses
 * exist (QA round-2 style notes 1 + 2). The guards are the security-relevant
 * part of these actions, so they are re-proved here against real rows and a
 * real query planner:
 *
 *   - a send-back cannot flip an already-RATIFIED lesson back to draft
 *     (round-2 defect 2 — a stale tab must not unpublish live content);
 *   - a decision cannot touch a CORE lesson (round-1 defect 6);
 *   - a core lesson missing from an edition CAN be added back
 *     (round-2 defect 5), and still cannot be removed;
 *   - an exclusive lesson cannot be switched off in the picker
 *     (round-1 defects 7 + 8);
 *   - the pass mark lands on the right edition row.
 *
 * Only the AUTHORITY seam is stubbed (`resolveEditionEditor`, which reads
 * cookies); everything below it is the real Drizzle query.
 *
 * SKIPPED unless DATABASE_URL is set. Run:
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/db/org-admin-actions.db.test.ts
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const P = "n7act"
const COURSE_ID = `${P}_course`
const SECTION_ID = `${P}_section`
const ORG_ID = `${P}_org`
const EDITION_ID = `${P}_edition`
const OTHER_EDITION_ID = `${P}_other_edition`

const CONTEXT = {
  userId: `${P}_admin`,
  userName: "Org admin",
  role: "admin" as const,
  organisationId: ORG_ID,
  organisationName: "N7 actions org",
  organisationType: "institution",
  edition: {
    id: EDITION_ID,
    name: "N7 actions edition",
    status: "live" as const,
    coBrandLabel: "Curated by N7",
    passMark: 70,
  },
  courseId: COURSE_ID,
  courseTitle: "N7 actions course",
  isPreview: false,
}

const orgLayer = vi.hoisted(() => ({ resolveEditionEditor: vi.fn() }))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

// Only the cookie-reading authority seam is stubbed; the module's DB access
// (getDb + the real Drizzle predicates) is untouched.
vi.mock("@/lib/data/org-admin", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/data/org-admin")>()),
  resolveEditionEditor: orgLayer.resolveEditionEditor,
}))

describeDb("N7 institution admin writes (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let actions: typeof import("@/lib/actions/org-admin")

  async function cleanup() {
    await sql`DELETE FROM edition_lessons WHERE edition_id IN (${EDITION_ID}, ${OTHER_EDITION_ID})`
    await sql`DELETE FROM syllabus_edition WHERE id IN (${EDITION_ID}, ${OTHER_EDITION_ID})`
    await sql`DELETE FROM organisation WHERE id = ${ORG_ID}`
    await sql`DELETE FROM lessons WHERE course_id = ${COURSE_ID}`
    await sql`DELETE FROM sections WHERE id = ${SECTION_ID}`
    await sql`DELETE FROM courses WHERE id = ${COURSE_ID}`
    await sql`DELETE FROM "user" WHERE id = ${`${P}_admin`}`
  }

  /** The edition_lessons row as it stands, for assertions. */
  async function row(lessonId: string) {
    const rows = await sql<
      { tier: string; state: string; is_mandatory: boolean; review_note: string | null }[]
    >`
      SELECT tier, state, is_mandatory, review_note FROM edition_lessons
      WHERE edition_id = ${EDITION_ID} AND lesson_id = ${lessonId}
    `
    return rows[0] ?? null
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    await cleanup()

    await sql`
      INSERT INTO "user" (id, name, email, email_verified)
      VALUES (${`${P}_admin`}, 'N7 actions admin', ${`${P}_admin@example.test`}, TRUE)
    `
    await sql`
      INSERT INTO courses (id, slug, title, description)
      VALUES (${COURSE_ID}, ${`${P}-course`}, 'N7 actions course', 'fixture')
    `
    await sql`
      INSERT INTO sections (id, title, "order", course_id, month)
      VALUES (${SECTION_ID}, 'N7 actions section', 1, ${COURSE_ID}, 1)
    `
    await sql`
      INSERT INTO organisation (id, name, slug, type)
      VALUES (${ORG_ID}, 'N7 actions org', ${`${ORG_ID}-slug`}, 'institution')
    `
    await sql`
      INSERT INTO syllabus_edition
        (id, organisation_id, course_id, name, slug, is_org_default, pass_mark, status)
      VALUES (${EDITION_ID}, ${ORG_ID}, ${COURSE_ID}, 'N7 actions edition',
              ${`${EDITION_ID}-slug`}, TRUE, 70, 'live')
    `
    await sql`
      INSERT INTO syllabus_edition
        (id, organisation_id, course_id, name, slug, is_org_default, pass_mark, status)
      VALUES (${OTHER_EDITION_ID}, ${ORG_ID}, ${COURSE_ID}, 'N7 other edition',
              ${`${OTHER_EDITION_ID}-slug`}, FALSE, 70, 'draft')
    `
    for (const [id, order, optional] of [
      [`${P}_core`, 1, false],
      [`${P}_core_missing`, 2, false],
      [`${P}_opt`, 3, true],
      [`${P}_excl`, 4, true],
      [`${P}_excl_live`, 5, true],
    ] as const) {
      await sql`
        INSERT INTO lessons (id, slug, title, "order", section_id, course_id, course_slug, month, is_optional)
        VALUES (${id}, ${id}, ${`Lesson ${id}`}, ${order}, ${SECTION_ID}, ${COURSE_ID},
                ${`${P}-course`}, 1, ${optional})
      `
    }

    actions = await import("@/lib/actions/org-admin")
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    orgLayer.resolveEditionEditor.mockResolvedValue({
      ok: true,
      context: CONTEXT,
      edition: CONTEXT.edition,
    })
    // Reset the edition to a known shape before every case.
    await sql`DELETE FROM edition_lessons WHERE edition_id = ${EDITION_ID}`
    await sql`
      INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order)
      VALUES
        (${EDITION_ID}, ${`${P}_core`},      'core',      'ratified', TRUE,  1001),
        (${EDITION_ID}, ${`${P}_opt`},       'optional',  'ratified', FALSE, 1003),
        (${EDITION_ID}, ${`${P}_excl`},      'exclusive', 'draft',    TRUE,  1004),
        (${EDITION_ID}, ${`${P}_excl_live`}, 'exclusive', 'ratified', TRUE,  1005)
    `
    // ${P}_core_missing is deliberately absent: the repair case.
  })

  describe("decideEditionLessonAction", () => {
    it("ratifies a draft exclusive lesson and stamps the decider", async () => {
      const result = await actions.decideEditionLessonAction(
        EDITION_ID,
        `${P}_excl`,
        "ratify"
      )
      expect(result.ok).toBe(true)
      expect(await row(`${P}_excl`)).toMatchObject({
        state: "ratified",
        review_note: null,
      })
      const stamped = await sql<{ decided_by: string | null }[]>`
        SELECT decided_by FROM edition_lessons
        WHERE edition_id = ${EDITION_ID} AND lesson_id = ${`${P}_excl`}
      `
      expect(stamped[0]!.decided_by).toBe(`${P}_admin`)
    })

    it("sends a draft back with its note, still hidden from learners", async () => {
      const result = await actions.decideEditionLessonAction(
        EDITION_ID,
        `${P}_excl`,
        "send-back",
        "Add the UK worked example."
      )
      expect(result.ok).toBe(true)
      expect(await row(`${P}_excl`)).toMatchObject({
        state: "draft",
        review_note: "Add the UK worked example.",
      })
    })

    it("CANNOT unpublish an already-ratified lesson (round-2 defect 2)", async () => {
      const before = await row(`${P}_excl_live`)
      const result = await actions.decideEditionLessonAction(
        EDITION_ID,
        `${P}_excl_live`,
        "send-back",
        "stale tab"
      )
      expect(result.ok).toBe(false)
      expect(result.message).toMatch(/no longer waiting for a decision/i)
      expect(await row(`${P}_excl_live`)).toEqual(before)
    })

    it("CANNOT touch a core lesson (round-1 defect 6)", async () => {
      const before = await row(`${P}_core`)
      const result = await actions.decideEditionLessonAction(
        EDITION_ID,
        `${P}_core`,
        "send-back",
        "hide this"
      )
      expect(result.ok).toBe(false)
      expect(await row(`${P}_core`)).toEqual(before)
    })

    it("a stale ratify cannot wipe a colleague's request for changes (round-3 defect 9)", async () => {
      // Admin A sends the lesson back...
      expect(
        (
          await actions.decideEditionLessonAction(
            EDITION_ID,
            `${P}_excl`,
            "send-back",
            "Needs a UK example."
          )
        ).ok
      ).toBe(true)
      // ...admin B's tab still shows it as "waiting on you" (no note) and
      // ratifies. The review-note predicate refuses it.
      const stale = await actions.decideEditionLessonAction(
        EDITION_ID,
        `${P}_excl`,
        "ratify",
        undefined,
        /* sawReviewNote */ false
      )
      expect(stale.ok).toBe(false)
      expect(await row(`${P}_excl`)).toMatchObject({
        state: "draft",
        review_note: "Needs a UK example.",
      })
      // Ratifying from a view that DOES show the note is allowed: the admin
      // has seen it and is accepting the lesson as it stands.
      const informed = await actions.decideEditionLessonAction(
        EDITION_ID,
        `${P}_excl`,
        "ratify",
        undefined,
        /* sawReviewNote */ true
      )
      expect(informed.ok).toBe(true)
      expect(await row(`${P}_excl`)).toMatchObject({
        state: "ratified",
        review_note: null,
      })
    })

    it("cannot reach another edition's rows", async () => {
      const before = await row(`${P}_excl`)
      const result = await actions.decideEditionLessonAction(
        OTHER_EDITION_ID,
        `${P}_excl`,
        "ratify"
      )
      expect(result.ok).toBe(false)
      expect(await row(`${P}_excl`)).toEqual(before)
    })
  })

  describe("setEditionLessonIncludedAction", () => {
    it("removes and re-adds an optional lesson", async () => {
      expect((await actions.setEditionLessonIncludedAction(EDITION_ID, `${P}_opt`, false)).ok).toBe(true)
      expect(await row(`${P}_opt`)).toBeNull()
      expect((await actions.setEditionLessonIncludedAction(EDITION_ID, `${P}_opt`, true)).ok).toBe(true)
      expect(await row(`${P}_opt`)).toMatchObject({
        tier: "optional",
        state: "ratified",
        is_mandatory: false,
      })
    })

    it("adds a MISSING core lesson back, mandatory (round-2 defect 5)", async () => {
      const result = await actions.setEditionLessonIncludedAction(
        EDITION_ID,
        `${P}_core_missing`,
        true
      )
      expect(result.ok).toBe(true)
      expect(await row(`${P}_core_missing`)).toMatchObject({
        tier: "core",
        state: "ratified",
        is_mandatory: true,
      })
    })

    it("still refuses to REMOVE a core lesson (D-N7-3)", async () => {
      const result = await actions.setEditionLessonIncludedAction(
        EDITION_ID,
        `${P}_core`,
        false
      )
      expect(result.ok).toBe(false)
      expect(await row(`${P}_core`)).not.toBeNull()
    })

    it("refuses to switch an exclusive lesson either way (round-1 defects 7+8)", async () => {
      for (const included of [false, true]) {
        const result = await actions.setEditionLessonIncludedAction(
          EDITION_ID,
          `${P}_excl`,
          included
        )
        expect(result.ok).toBe(false)
      }
      expect(await row(`${P}_excl`)).toMatchObject({ state: "draft" })
    })
  })

  describe("setEditionLessonMandatoryAction", () => {
    it("flips the baseline flag on a ratified exclusive lesson (round-2 defect 3)", async () => {
      const result = await actions.setEditionLessonMandatoryAction(
        EDITION_ID,
        `${P}_excl_live`,
        false
      )
      expect(result.ok).toBe(true)
      expect(await row(`${P}_excl_live`)).toMatchObject({ is_mandatory: false })
    })

    it("cannot drop a CORE lesson out of the baseline (round-3 defect 8)", async () => {
      // The parallel write path must not undo D-N7-3 by the other door: an
      // admin who could zero every core lesson would leave a credential that
      // attests only to their own optional picks.
      const result = await actions.setEditionLessonMandatoryAction(
        EDITION_ID,
        `${P}_core`,
        false
      )
      expect(result.ok).toBe(false)
      expect(result.message).toMatch(/always count toward the baseline/i)
      expect(await row(`${P}_core`)).toMatchObject({ is_mandatory: true })
    })
  })

  describe("setEditionPassMarkAction", () => {
    it("writes the pass mark to the caller's own edition only", async () => {
      const result = await actions.setEditionPassMarkAction(EDITION_ID, 85)
      expect(result.ok).toBe(true)
      const rows = await sql<{ id: string; pass_mark: number }[]>`
        SELECT id, pass_mark FROM syllabus_edition
        WHERE id IN (${EDITION_ID}, ${OTHER_EDITION_ID}) ORDER BY id
      `
      const byId = new Map(rows.map((r) => [r.id, r.pass_mark]))
      expect(byId.get(EDITION_ID)).toBe(85)
      expect(byId.get(OTHER_EDITION_ID)).toBe(70)
      // Restore so the pass mark does not leak into another case.
      await sql`UPDATE syllabus_edition SET pass_mark = 70 WHERE id = ${EDITION_ID}`
    })

    it("refuses an out-of-range pass mark before touching the row", async () => {
      const result = await actions.setEditionPassMarkAction(EDITION_ID, 140)
      expect(result.ok).toBe(false)
      const rows = await sql<{ pass_mark: number }[]>`
        SELECT pass_mark FROM syllabus_edition WHERE id = ${EDITION_ID}
      `
      expect(rows[0]!.pass_mark).toBe(70)
    })
  })
})
