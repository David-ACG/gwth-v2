/**
 * Authority tests for the institution admin actions (N7).
 *
 * The property under test is the one that matters HERE: authority is
 * re-derived from the SESSION on every call and never taken from the
 * arguments. An org admin's own edition id is the only edition they can
 * write, a tutor cannot write at all, and preview mode cannot write at all.
 *
 * The DB is mocked at the `getDb()` seam with a small fluent double, so this
 * suite deliberately does NOT claim to prove anything about SQL predicates —
 * a mock that ignores `where()` would pass whether or not a guard exists (QA
 * round-2 style note 1). The guard clauses that keep a stale send-back from
 * unpublishing live content, and a core lesson from being dropped, are proved
 * against real rows in src/db/org-admin-actions.db.test.ts; the read shapes
 * in src/db/org-admin.db.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const orgLayer = vi.hoisted(() => ({
  resolveEditionEditor: vi.fn(),
}))

const dbLayer = vi.hoisted(() => ({
  /** Rows keyed by the table each select reads, so adding or reordering a
   *  query cannot silently feed the wrong fixture (QA round-1 style note 10:
   *  the earlier double routed by call parity). */
  rows: {} as Record<string, unknown[]>,
  returningRows: [] as unknown[],
  deletes: [] as unknown[],
  inserts: [] as unknown[],
  updates: [] as unknown[],
  selectedTables: [] as string[],
}))

vi.mock("@/lib/data/org-admin", () => ({
  resolveEditionEditor: orgLayer.resolveEditionEditor,
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("@/db", () => {
  /**
   * A minimal thenable query double. `.from(table)` decides which fixture the
   * chain resolves to — keyed by the drizzle table's own name, so a query
   * added, removed or reordered inside an action still reads the right rows
   * (or loudly resolves to none) instead of silently shifting every later
   * select onto the wrong fixture.
   */
  function selectChain() {
    let table = "?"
    const resolve = () => dbLayer.rows[table] ?? []
    const chain = {
      from: (t: Record<symbol, string>) => {
        // Drizzle stores the SQL table name under this symbol at runtime.
        table = t?.[Symbol.for("drizzle:Name")] ?? "?"
        dbLayer.selectedTables.push(table)
        return chain
      },
      leftJoin: () => chain,
      innerJoin: () => chain,
      where: () => chain,
      limit: () => Promise.resolve(resolve()),
      orderBy: () => Promise.resolve(resolve()),
      groupBy: () => chain,
      then: (done: (value: unknown[]) => unknown) => done(resolve()),
    }
    return chain
  }
  return {
    getDb: () => ({
      select: () => selectChain(),
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
    }),
  }
})

const {
  decideEditionLessonAction,
  setEditionLessonIncludedAction,
  setEditionLessonMandatoryAction,
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
  edition: {
    id: "edition_cipd",
    name: "CIPD edition 2026",
    status: "live" as const,
    coBrandLabel: "Curated by CIPD",
    passMark: 75,
  },
  courseId: "course_gwth",
  courseTitle: "Applied AI Skills",
  isPreview: false,
}

/** Shorthand for the lessons-table fixture one action call will read. */
function seedLesson(overrides: Record<string, unknown> = {}) {
  dbLayer.rows.lessons = [
    {
      id: "m2_l09",
      title: "Meeting notes",
      isOptional: true,
      month: 2,
      order: 9,
      courseId: "course_gwth",
      ...overrides,
    },
  ]
}

/** Shorthand for the edition_lessons row the action will find (or not). */
function seedEditionRow(tier: string | null) {
  dbLayer.rows.edition_lessons = tier === null ? [] : [{ tier }]
}

beforeEach(() => {
  vi.clearAllMocks()
  dbLayer.rows = {}
  dbLayer.returningRows = []
  dbLayer.deletes = []
  dbLayer.inserts = []
  dbLayer.updates = []
  dbLayer.selectedTables = []
  orgLayer.resolveEditionEditor.mockResolvedValue({
    ok: true,
    context: ADMIN_CONTEXT,
    edition: ADMIN_CONTEXT.edition,
  })
})

describe("authority is re-derived from the session, never the arguments", () => {
  it("refuses an edition id that is not the caller's own", async () => {
    seedLesson()
    seedEditionRow("optional")
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
    seedLesson({ id: "other_l01", courseId: "course_other" })
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "other_l01",
      true
    )
    expect(result.ok).toBe(false)
    expect(dbLayer.inserts).toHaveLength(0)
  })

  it("refuses to switch a CORE lesson off (D-N7-3)", async () => {
    seedLesson({ id: "m1_l01", title: "Welcome to GWTH", isOptional: false })
    seedEditionRow("core")
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
    seedLesson()
    seedEditionRow("optional")
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "m2_l09",
      false
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.deletes).toHaveLength(1)
  })

  it("adds an optional lesson back as an ordinary ratified row", async () => {
    seedLesson()
    seedEditionRow(null)
    const result = await setEditionLessonIncludedAction(
      "edition_cipd",
      "m2_l09",
      true
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.inserts[0]).toMatchObject({
      editionId: "edition_cipd",
      lessonId: "m2_l09",
      tier: "optional",
      state: "ratified",
      isMandatory: false,
    })
  })

  it("refuses to switch an EXCLUSIVE lesson at all (QA round-1 defects 7+8)", async () => {
    // Removing one would destroy its tier, its decision audit and the
    // institution's review note; re-adding would publish it as an ordinary
    // optional lesson with no sign-off. The ratification screen owns it.
    seedLesson({ id: "m2_x01", title: "Recruitment screening" })
    seedEditionRow("exclusive")
    for (const included of [true, false]) {
      const result = await setEditionLessonIncludedAction(
        "edition_cipd",
        "m2_x01",
        included
      )
      expect(result.ok).toBe(false)
      expect(result.message).toMatch(/ratification screen/i)
    }
    expect(dbLayer.deletes).toHaveLength(0)
    expect(dbLayer.inserts).toHaveLength(0)
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

  it("reports a decision that matched nothing without claiming success", async () => {
    // The UPDATE carries two guards — tier='exclusive' (round-1 defect 6) and
    // state='draft' (round-2 defect 2) — and a row failing either matches
    // nothing. This mock cannot evaluate a predicate, so the guards
    // themselves are proved against real rows in
    // src/db/org-admin-actions.db.test.ts; what is pinned here is that a
    // zero-row result is reported honestly rather than as a success.
    dbLayer.returningRows = []
    const result = await decideEditionLessonAction(
      "edition_cipd",
      "m1_l01",
      "send-back",
      "please hide this"
    )
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/no longer waiting for a decision/i)
  })
})

describe("setEditionLessonMandatoryAction", () => {
  it("sets the baseline flag on a row of the caller's own edition", async () => {
    dbLayer.returningRows = [{ lessonId: "m2_l09" }]
    const result = await setEditionLessonMandatoryAction(
      "edition_cipd",
      "m2_l09",
      true
    )
    expect(result.ok).toBe(true)
    expect(dbLayer.updates[0]).toMatchObject({ isMandatory: true })
  })

  it("refuses an edition that is not the caller's own", async () => {
    const result = await setEditionLessonMandatoryAction(
      "edition_someone_else",
      "m2_l09",
      true
    )
    expect(result.ok).toBe(false)
    expect(dbLayer.updates).toHaveLength(0)
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
