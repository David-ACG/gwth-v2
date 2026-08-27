/**
 * Regression: the quiz write is ONE atomic upsert (gwth-launch-avo, N2 QA
 * defects 5 + 6).
 *
 * The DB-path test uses a fake Drizzle client to pin the SHAPE of the write:
 * every derived field must be a SQL expression computed by the database from
 * the row it is updating (increment, GREATEST, cap), never a number computed
 * in JS from an earlier read — that earlier-read pattern is exactly the race
 * the defect describes (two concurrent submissions read the same prior row;
 * one attempt increment is lost and a slower low score overwrites a passing
 * one). The end-to-end behaviour against a real Postgres — including two
 * genuinely concurrent submissions — is covered in progress.db.test.ts.
 *
 * The mock-mode path shares the cap and GREATEST semantics in TS, tested
 * below against the in-memory store.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SQL } from "drizzle-orm"

const fakeDb = vi.hoisted(() => {
  const state = {
    insertCalls: [] as { values: Record<string, unknown>; config: any }[],
    returningRows: [] as Record<string, unknown>[],
    selectRows: [] as Record<string, unknown>[],
  }
  const db = {
    insert: () => ({
      values: (values: Record<string, unknown>) => ({
        onConflictDoUpdate: (config: unknown) => ({
          returning: () => {
            state.insertCalls.push({ values, config })
            return Promise.resolve(state.returningRows)
          },
        }),
      }),
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(state.selectRows),
        }),
      }),
    }),
  }
  return { state, db }
})

vi.mock("@/db", () => ({ getDb: () => fakeDb.db }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => ({ id: "user_atomic_test" }),
}))

import { recordQuizSubmission } from "./progress"

const LESSON_ID = "atomic_test_lesson"
const OPTS = { passMark: 67, maxAttempts: 3 }

/** A full lesson_progress row as Drizzle would return it. */
function dbRow(overrides: Record<string, unknown> = {}) {
  return {
    lessonId: LESSON_ID,
    isCompleted: false,
    completedAt: null,
    progress: 0,
    introVideoProgress: 0,
    quizScore: 50,
    bestQuizScore: 50,
    quizPassed: false,
    quizAttempts: 1,
    timeSpent: 0,
    lastAccessedAt: new Date().toISOString(),
    ...overrides,
  }
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://gwth:x@localhost:5443/gwth_v2"
  fakeDb.state.insertCalls = []
  fakeDb.state.returningRows = [dbRow()]
  fakeDb.state.selectRows = []
})

describe("recordQuizSubmission is one atomic SQL statement (QA defect 6)", () => {
  it("computes every derived field IN SQL, from the row being updated", async () => {
    await recordQuizSubmission(LESSON_ID, 50, OPTS)

    expect(fakeDb.state.insertCalls).toHaveLength(1)
    const { config } = fakeDb.state.insertCalls[0]!

    // The race-carrying fields must be SQL expressions (increment, GREATEST,
    // derived pass/completion) — a plain number here means a JS-side
    // read-modify-write crept back in.
    expect(config.set.quizAttempts).toBeInstanceOf(SQL)
    expect(config.set.bestQuizScore).toBeInstanceOf(SQL)
    expect(config.set.quizPassed).toBeInstanceOf(SQL)
    expect(config.set.isCompleted).toBeInstanceOf(SQL)
    expect(config.set.completedAt).toBeInstanceOf(SQL)
    // The current-attempt score is legitimately this submission's number.
    expect(config.set.quizScore).toBe(50)
  })

  it("enforces the attempt cap inside the same statement (setWhere)", async () => {
    await recordQuizSubmission(LESSON_ID, 50, OPTS)
    const { config } = fakeDb.state.insertCalls[0]!
    expect(config.setWhere).toBeInstanceOf(SQL)
  })

  it("treats an empty RETURNING set as the cap refusal, writing nothing else", async () => {
    fakeDb.state.returningRows = [] // setWhere excluded the row
    fakeDb.state.selectRows = [dbRow({ quizAttempts: 3, bestQuizScore: 50 })]

    const result = await recordQuizSubmission(LESSON_ID, 100, OPTS)
    expect(result.outcome).toBe("attempt-limit")
    expect(result.progress.quizAttempts).toBe(3)
    expect(result.progress.bestQuizScore).toBe(50)
    // Exactly one write was ATTEMPTED; no retry, no fallback write.
    expect(fakeDb.state.insertCalls).toHaveLength(1)
  })

  it("returns the persisted row on success", async () => {
    fakeDb.state.returningRows = [
      dbRow({ quizAttempts: 2, quizScore: 100, bestQuizScore: 100, quizPassed: true }),
    ]
    const result = await recordQuizSubmission(LESSON_ID, 100, OPTS)
    expect(result.outcome).toBe("recorded")
    expect(result.progress.bestQuizScore).toBe(100)
    expect(result.progress.quizAttempts).toBe(2)
  })
})

describe("recordQuizSubmission mock-mode semantics (cap + best score)", () => {
  it("caps attempts and keeps the best score in mock mode too", async () => {
    delete process.env.DATABASE_URL
    const lessonId = `mock_cap_${Date.now()}`

    const first = await recordQuizSubmission(lessonId, 80, OPTS)
    expect(first.outcome).toBe("recorded")
    expect(first.progress.quizAttempts).toBe(1)
    expect(first.progress.quizPassed).toBe(true)

    const second = await recordQuizSubmission(lessonId, 30, OPTS)
    expect(second.outcome).toBe("recorded")
    // GREATEST semantics: a later low score never lowers the best.
    expect(second.progress.bestQuizScore).toBe(80)
    expect(second.progress.quizPassed).toBe(true)
    expect(second.progress.quizAttempts).toBe(2)

    const third = await recordQuizSubmission(lessonId, 30, OPTS)
    expect(third.outcome).toBe("recorded")
    expect(third.progress.quizAttempts).toBe(3)

    const fourth = await recordQuizSubmission(lessonId, 100, OPTS)
    expect(fourth.outcome).toBe("attempt-limit")
    // The refused submission wrote nothing.
    expect(fourth.progress.quizAttempts).toBe(3)
    expect(fourth.progress.bestQuizScore).toBe(80)
  })
})
