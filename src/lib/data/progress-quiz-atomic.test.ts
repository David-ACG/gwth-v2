/**
 * Regression: the quiz write is ONE atomic upsert (gwth-launch-avo, N2 QA
 * defects 5 + 6).
 *
 * The DB-path test uses a fake Drizzle client to pin the SHAPE of the write:
 * every derived field must be a SQL expression computed by the database from
 * the row it is updating (increment, GREATEST, cap), never a number computed
 * in JS from an earlier read - that earlier-read pattern is exactly the race
 * the defect describes (two concurrent submissions read the same prior row;
 * one attempt increment is lost and a slower low score overwrites a passing
 * one). The end-to-end behaviour against a real Postgres - including two
 * genuinely concurrent submissions - is covered in progress.db.test.ts.
 *
 * The mock-mode path shares the cap and GREATEST semantics in TS, tested
 * below against the in-memory store.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { SQL } from "drizzle-orm"

const fakeDb = vi.hoisted(() => {
  const state = {
    insertCalls: [] as { values: Record<string, unknown>; config: any }[],
    returningRows: [] as Record<string, unknown>[],
    selectRows: [] as Record<string, unknown>[],
    executed: [] as unknown[],
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
    // recordIntroVideoProgress wraps its upsert in a transaction that first
    // takes the per-user advisory lock; the fake records the lock call.
    execute: (query: unknown) => {
      state.executed.push(query)
      return Promise.resolve([])
    },
    transaction: async <T,>(fn: (tx: unknown) => Promise<T>): Promise<T> =>
      fn(db),
  }
  return { state, db }
})

vi.mock("@/db", () => ({ getDb: () => fakeDb.db }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => ({ id: "user_atomic_test" }),
}))

import { recordIntroVideoProgress, recordQuizSubmission } from "./progress"
import { mockLessonProgress } from "./mock-data"

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

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://gwth:x@localhost:5443/gwth_v2"
  fakeDb.state.insertCalls = []
  fakeDb.state.returningRows = [dbRow()]
  fakeDb.state.selectRows = []
  fakeDb.state.executed = []
})

afterAll(() => {
  // Never leak the fake DATABASE_URL into later test files (QA round-3
  // style note 4).
  if (ORIGINAL_DATABASE_URL === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = ORIGINAL_DATABASE_URL
})

describe("recordQuizSubmission is one atomic SQL statement (QA defect 6)", () => {
  it("computes every derived field IN SQL, from the row being updated", async () => {
    await recordQuizSubmission(LESSON_ID, 50, OPTS)

    expect(fakeDb.state.insertCalls).toHaveLength(1)
    const { config } = fakeDb.state.insertCalls[0]!

    // The race-carrying fields must be SQL expressions (increment, GREATEST,
    // derived pass/completion) - a plain number here means a JS-side
    // read-modify-write crept back in.
    expect(config.set.quizAttempts).toBeInstanceOf(SQL)
    expect(config.set.bestQuizScore).toBeInstanceOf(SQL)
    expect(config.set.quizPassed).toBeInstanceOf(SQL)
    expect(config.set.isCompleted).toBeInstanceOf(SQL)
    expect(config.set.completedAt).toBeInstanceOf(SQL)
    // The current-attempt score is legitimately this submission's number.
    expect(config.set.quizScore).toBe(50)
    // The overall fraction is DERIVED in the same statement, never taken
    // from a client (QA round-2 defect 5).
    expect(config.set.progress).toBeInstanceOf(SQL)
  })

  it("enforces the quiz-closure rule (cap + passed) inside the same statement", async () => {
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

describe("recordIntroVideoProgress is one atomic SQL statement (QA round-2 defect 8)", () => {
  it("computes the credit, bank, fraction and completion IN SQL, from the row being updated", async () => {
    await recordIntroVideoProgress(LESSON_ID, 0.85)

    expect(fakeDb.state.insertCalls).toHaveLength(1)
    const { values, config } = fakeDb.state.insertCalls[0]!

    // A fresh row may only hold the bootstrap credit, whatever was claimed.
    expect(values.introVideoProgress).toBeCloseTo(0.15, 5)

    // Every derived field is a SQL expression over the OLD row: elapsed
    // time, the banked seconds, the credited fraction, completion and the
    // derived overall fraction - a plain number here means a JS-side
    // read-modify-write crept back in (the round-1 defect).
    expect(config.set.introVideoProgress).toBeInstanceOf(SQL)
    expect(config.set.timeSpent).toBeInstanceOf(SQL)
    expect(config.set.isCompleted).toBeInstanceOf(SQL)
    expect(config.set.completedAt).toBeInstanceOf(SQL)
    expect(config.set.progress).toBeInstanceOf(SQL)
    // No cap-refusal clause here: video reports are never refused, only
    // credit-limited.
    expect(config.setWhere).toBeUndefined()
    // The per-user advisory lock ran first, inside the same transaction, so
    // concurrent reports cannot double-spend one wall-clock window
    // (round-3 defect 3).
    expect(fakeDb.state.executed.length).toBeGreaterThanOrEqual(1)
  })
})

describe("recordIntroVideoProgress mock-mode crediting", () => {
  /** Backdates every row in the store: the credit clock is USER-wide
   *  (round-3 defect 3), so one recent row anywhere zeroes the window. */
  function backdateStore(seconds: number) {
    const then = new Date(Date.now() - seconds * 1000)
    for (const row of mockLessonProgress) {
      if (new Date(row.lastAccessedAt).getTime() > then.getTime()) {
        row.lastAccessedAt = then
      }
    }
  }

  it("banks wall-clock time and credits monotonically", async () => {
    delete process.env.DATABASE_URL
    const lessonId = `mock_video_${Date.now()}`

    // A forged full-watch first report earns only the bootstrap.
    const first = await recordIntroVideoProgress(lessonId, 1)
    expect(first.introVideoProgress).toBeCloseTo(0.15, 5)

    // Backdate the user's last write by 30s: the next report may bank
    // 30s, allowing 30 * 2 / 180 = 1/3 of the video.
    backdateStore(30)
    const second = await recordIntroVideoProgress(lessonId, 1)
    expect(second.timeSpent).toBe(30)
    expect(second.introVideoProgress).toBeCloseTo(1 / 3, 2)

    // A lower report never regresses the stored fraction.
    backdateStore(30)
    const third = await recordIntroVideoProgress(lessonId, 0.1)
    expect(third.introVideoProgress).toBeCloseTo(1 / 3, 2)
  })

  it("the credit clock is USER-wide: a recent write on ANOTHER lesson zeroes the window (round-3 defect 3)", async () => {
    delete process.env.DATABASE_URL
    const lessonA = `mock_video_a_${Date.now()}`
    const lessonB = `mock_video_b_${Date.now()}`

    await recordIntroVideoProgress(lessonA, 1) // bootstrap A
    await recordIntroVideoProgress(lessonB, 1) // bootstrap B
    backdateStore(45)

    // A banks the 45-second window and stamps the user-wide clock...
    const a = await recordIntroVideoProgress(lessonA, 1)
    expect(a.introVideoProgress).toBeCloseTo(0.5, 2)

    // ...so B, reporting immediately after, may NOT bank those same
    // seconds again: its fraction stays at the bootstrap.
    const b = await recordIntroVideoProgress(lessonB, 1)
    expect(b.introVideoProgress).toBeCloseTo(0.15, 2)
  })

  it("ignores a legacy row's time_spent that this path never credited (round-3 defect 5)", async () => {
    delete process.env.DATABASE_URL
    const lessonId = `mock_video_legacy_${Date.now()}`
    // A legacy row: junk time_spent, but NO credited watch fraction.
    mockLessonProgress.push({
      lessonId,
      isCompleted: false,
      progress: 0,
      quizScore: null,
      bestQuizScore: null,
      quizAttempts: 0,
      timeSpent: 300,
      lastAccessedAt: new Date(),
      completedAt: null,
      introVideoProgress: 0,
      quizPassed: false,
    })
    const result = await recordIntroVideoProgress(lessonId, 1)
    // 300 junk seconds grant nothing: bootstrap only.
    expect(result.introVideoProgress).toBeCloseTo(0.15, 2)
  })
})

describe("recordQuizSubmission mock-mode semantics (cap + best score)", () => {
  it("caps attempts and keeps the best score in mock mode too", async () => {
    delete process.env.DATABASE_URL
    const lessonId = `mock_cap_${Date.now()}`

    const first = await recordQuizSubmission(lessonId, 50, OPTS)
    expect(first.outcome).toBe("recorded")
    expect(first.progress.quizAttempts).toBe(1)
    expect(first.progress.quizPassed).toBe(false)

    const second = await recordQuizSubmission(lessonId, 30, OPTS)
    expect(second.outcome).toBe("recorded")
    // GREATEST semantics: a later low score never lowers the best.
    expect(second.progress.bestQuizScore).toBe(50)
    expect(second.progress.quizAttempts).toBe(2)

    const third = await recordQuizSubmission(lessonId, 40, OPTS)
    expect(third.outcome).toBe("recorded")
    expect(third.progress.quizAttempts).toBe(3)

    const fourth = await recordQuizSubmission(lessonId, 100, OPTS)
    expect(fourth.outcome).toBe("attempt-limit")
    // The refused submission wrote nothing.
    expect(fourth.progress.quizAttempts).toBe(3)
    expect(fourth.progress.bestQuizScore).toBe(50)
  })

  it("a PASS closes the quiz: no further grading, whatever attempts remain (round-3 defect 8)", async () => {
    delete process.env.DATABASE_URL
    const lessonId = `mock_pass_${Date.now()}`

    const passRun = await recordQuizSubmission(lessonId, 80, OPTS)
    expect(passRun.outcome).toBe("recorded")
    expect(passRun.progress.quizPassed).toBe(true)
    expect(passRun.progress.quizAttempts).toBe(1)

    // The post-pass reveal can never be resubmitted to inflate the record.
    const after = await recordQuizSubmission(lessonId, 100, OPTS)
    expect(after.outcome).toBe("attempt-limit")
    expect(after.progress.bestQuizScore).toBe(80)
    expect(after.progress.quizAttempts).toBe(1)
  })
})
