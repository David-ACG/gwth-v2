/**
 * Authority tests for the institution admin actions (N7).
 *
 * The property under test is the one that matters: authority is re-derived
 * from the SESSION on every call and never taken from the arguments. An org
 * admin's own edition id is the only edition they can write, a tutor cannot
 * write at all, the preview mode cannot write at all, and a core lesson
 * cannot be switched off even when the form says so.
 *
 * The DB is mocked at the `getDb()` seam with a small fluent double; the
 * real query shapes are exercised against Postgres in
 * src/db/org-admin.db.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const orgLayer = vi.hoisted(() => ({
  resolveEditionEditor: vi.fn(),
}))

const dbLayer = vi.hoisted(() => ({
  lessonRows: [] as unknown[],
  editionLessonRows: [] as unknown[],
  returningRows: [] as unknown[],
  deletes: [] as unknown[],
  inserts: [] as unknown[],
  updates: [] as unknown[],
}))

vi.mock("@/lib/data/org-admin", () => ({
  resolveEditionEditor: orgLayer.resolveEditionEditor,
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("@/db", () => {
  /**
   * A minimal thenable query double. `select()` chains resolve to whichever
   * fixture the test set; `update()/delete()/insert()` record their calls.
   */
  function selectChain(rows: unknown[]) {
    const chain = {
      from: () => chain,
      leftJoin: () => chain,
      innerJoin: () => chain,
      where: () => chain,
      limit: () => Promise.resolve(rows),
      orderBy: () => Promise.resolve(rows),
      groupBy: () => chain,
      then: (resolve: (value: unknown[]) => unknown) => resolve(rows),
    }
    return chain
  }
  let selectCall = 0
  return {
    getDb: () => ({
      select: () => {
        // First select in each action reads the lesson; the second reads the
        // existing edition_lessons row.
        const rows =
          selectCall++ % 2 === 0 ? dbLayer.lessonRows : dbLayer.editionLessonRows
        return selectChain(rows)
      },
      delete: () => ({
        where: (predicate: unknown) => {
          dbLayer.deletes.push(predicate)
          return Promise.resolve([])
        },
      }),
      insert: () => ({
        values: (values: unknown) => {
          dbLayer.inserts.push(values)
          return { onConflictDoNothing: () => Promise.resolve([]) }
        },
      }),
      update: () => ({
        set: (values: unknown) => {
          dbLayer.updates.push(values)
          return {
            where: () => ({
              returning: () => Promise.resolve(dbLayer.returningRows),
              then: (resolve: (value: unknown) => unknown) => resolve([]),
            }),
          }
        },
      }),
      __resetSelectCall: () => {
        selectCall = 0
      },
    }),
  }
})

const { getDb } = await import("@/db")
const {
  decideEditionLessonAction,
  setEditionLessonIncludedAction,
  setEditionPassMarkAction,
} = await import("./org-admin")

/** The editor context a signed-in institution admin resolves to. */
const ADMIN_CONTEXT = {
  userId: "user_admin",
  userName: "Ben",
  role: "admin" as const,
  organisationId: "org_cipd",
  organisationName: "CIPD",
  organisationType: "institution",
  editionId: "edition_cipd",
  editionName: "CIPD edition 2026",
  editionStatus: "live" as const,
  coBrandLabel: "Curated by CIPD",
  passMark: 75,
  courseId: "course_gwth",
  courseTitle: "Applied AI Skills",
  isPreview: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  dbLayer.lessonRows = []
  dbLayer.editionLessonRows = []
  dbLayer.returningRows = []
  dbLayer.deletes = []
  dbLayer.inserts = []
  dbLayer.updates = []
  ;(getDb() as unknown as { __resetSelectCall: () => void }).__resetSelectCall()
  orgLayer.resolveEditionEditor.mockResolvedValue({
    ok: true,
    context: ADMIN_CONTEXT,
  })
})

describe("authority is re-derived from the session, never the arguments", () => {
  it("refuses an edition id that is not the caller's own", async () => {
    const result = await setEditionLessonIncludedAction(
      "edition_someone_else",
      "m2_l11",
      false
    )
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/not part of your organisation/i)
    expect(dbLayer.deletes).toHaveLength(0)
  })

  it("refuses a tutor (read-only role)", async () => {
    orgLayer.resolveEditionEditor.mockResolvedValue({
      ok: false,
      message: "Tutors have read-only access.",
    })
    const result = await setEditionPassMarkAction("edition_cipd", 80)
    expect(result.ok).toBe(false)
    expect(dbLayer.updates).toHaveLength(0)
  })

  it("refuses every write in preview mode", async () => {
    orgLayer.resolveEditionEditor.mockResolvedValue({
      ok: false,
      message: "Preview mode: changes are not saved.",
    })
    const result = await decideEditionLessonAction(
      "edition_cipd",
      "m2_l11",
      "ratify"
    )
    expect(result.ok).toBe(false)
    expect(dbLayer.updates).toHaveLength(0)
  })

  it("refuses a signed-out caller", async () => {
    orgLayer.resolveEditionEditor.mockResolvedValue({
      ok: false,
      message: "Sign in as an organisation admin to change this.",
    })
    const result = await setEditionPassMarkAction("edition_cipd", 80)
    expect(result.ok).toBe(false)
  })
})

describe("setEditionLessonIncludedAction", () => {
  it("refuses a lesson from another course", async () => {
    dbLayer.lessonRows = [
      {
        id: "other_l01",
        title: "Another course's lesson",
        isOptional: true,
        month: 1,
        order: 1,
        courseId: "course_other",
      },
    ]
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "other_l01",
      true
    )
    expect(result.ok).toBe(false)
    expect(dbLayer.inserts).toHaveLength(0)
  })

  it("refuses to switch a CORE lesson off (D-N7-3)", async () => {
    dbLayer.lessonRows = [
      {
        id: "m1_l01",
        title: "Welcome to GWTH",
        isOptional: false,
        month: 1,
        order: 1,
        courseId: "course_gwth",
      },
    ]
    dbLayer.editionLessonRows = [{ tier: "core" }]
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "m1_l01",
      false
    )
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/core lessons/i)
    expect(dbLayer.deletes).toHaveLength(0)
  })

  it("removes an optional lesson from the edition", async () => {
    dbLayer.lessonRows = [
      {
        id: "m2_l09",
        title: "Meeting notes",
        isOptional: true,
        month: 2,
        order: 9,
        courseId: "course_gwth",
      },
    ]
    dbLayer.editionLessonRows = [{ tier: "optional" }]
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "m2_l09",
      false
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.deletes).toHaveLength(1)
  })

  it("re-adds an EXCLUSIVE lesson as a draft, never silently ratified", async () => {
    dbLayer.lessonRows = [
      {
        id: "m2_x01",
        title: "Recruitment screening",
        isOptional: true,
        month: 2,
        order: 20,
        courseId: "course_gwth",
      },
    ]
    dbLayer.editionLessonRows = [{ tier: "exclusive" }]
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "m2_x01",
      true
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.inserts[0]).toMatchObject({
      editionId: "edition_cipd",
      lessonId: "m2_x01",
      tier: "exclusive",
      state: "draft",
    })
  })
})

describe("decideEditionLessonAction", () => {
  it("requires a note when sending a lesson back", async () => {
    const result = await decideEditionLessonAction(
      "edition_cipd",
      "m2_x01",
      "send-back"
    )
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/say what needs to change/i)
    expect(dbLayer.updates).toHaveLength(0)
  })

  it("ratifies, clearing any earlier review note and stamping the decider", async () => {
    dbLayer.returningRows = [{ lessonId: "m2_x01" }]
    const result = await decideEditionLessonAction(
      "edition_cipd",
      "m2_x01",
      "ratify"
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.updates[0]).toMatchObject({
      state: "ratified",
      reviewNote: null,
      decidedBy: "user_admin",
    })
  })

  it("sends back as a DRAFT with the note (D-N7-2: no third state)", async () => {
    dbLayer.returningRows = [{ lessonId: "m2_x01" }]
    const result = await decideEditionLessonAction(
      "edition_cipd",
      "m2_x01",
      "send-back",
      "Add the 2026 DSIT guidance."
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.updates[0]).toMatchObject({
      state: "draft",
      reviewNote: "Add the 2026 DSIT guidance.",
    })
  })

  it("reports a miss rather than claiming success", async () => {
    dbLayer.returningRows = []
    const result = await decideEditionLessonAction(
      "edition_cipd",
      "not_in_this_edition",
      "ratify"
    )
    expect(result.ok).toBe(false)
  })
})

describe("setEditionPassMarkAction", () => {
  it("accepts a whole number in range and says what happens next", async () => {
    const result = await setEditionPassMarkAction("edition_cipd", 80)
    expect(result.ok).toBe(true)
    expect(dbLayer.updates[0]).toMatchObject({ passMark: 80 })
    expect(result.message).toMatch(/already passed keeps their pass/i)
  })

  it.each([
    ["above 100", 101],
    ["below 0", -1],
    ["fractional", 66.5],
    ["not a number", Number.NaN],
  ])("refuses a pass mark that is %s", async (_label, value) => {
    const result = await setEditionPassMarkAction("edition_cipd", value)
    expect(result.ok).toBe(false)
    expect(dbLayer.updates).toHaveLength(0)
  })
})
