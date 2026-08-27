/**
 * Regression: the server-side grading key must come from the DB, never
 * silently from the bundled mock fixture (gwth-launch-avo, N2 QA defect 7).
 *
 * Before this guard, `getQuizQuestionsByLessonId` fell back to the mock
 * answer key whenever the configured database held zero quiz rows for the
 * lesson - so a production lesson whose `quiz_questions` rows were dropped
 * or never seeded graded (and persisted) real submissions against the mock
 * fixture with no error anywhere. Now, with a database configured, the DB
 * is the ONLY source (round-2 defect 9 closed the "lesson row absent" mock
 * fallback too): zero quiz rows mean [] (grading fails loudly upstream:
 * "has no quiz to grade") and an unknown lesson id resolves no month, so
 * the access gate refuses. The mock set serves pure mock mode (no
 * DATABASE_URL) only.
 *
 * The fake DB distinguishes the two queries by their terminal call: the quiz
 * read ends in `.orderBy(...)`, the lessons read in `.limit(1)`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dbState = vi.hoisted(() => ({
  quizRows: [] as Record<string, unknown>[],
  lessonRows: [] as Record<string, unknown>[],
}))

vi.mock("@/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve(dbState.quizRows),
          limit: () => Promise.resolve(dbState.lessonRows),
        }),
      }),
    }),
  }),
}))

import { getLessonMonthById, getQuizQuestionsByLessonId } from "./lessons"
import { mockLessons } from "./mock-data"

// A lesson that EXISTS in the mock fixture with a real answer key - the
// dangerous fallback source.
const MOCK_LESSON_ID = "m1_l01"

const originalDbUrl = process.env.DATABASE_URL

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://gwth:x@localhost:5443/gwth_v2"
  dbState.quizRows = []
  dbState.lessonRows = []
})

afterEach(() => {
  if (originalDbUrl === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = originalDbUrl
})

describe("getQuizQuestionsByLessonId grading source (QA defect 7)", () => {
  it("serves the DB rows when they exist", async () => {
    dbState.quizRows = [
      {
        id: "db_q1",
        question: "From the database?",
        options: ["no", "yes"],
        correctOptionIndex: 1,
        explanation: "Straight from quiz_questions.",
        lessonId: MOCK_LESSON_ID,
        order: 1,
      },
    ]
    const questions = await getQuizQuestionsByLessonId(MOCK_LESSON_ID)
    expect(questions).toHaveLength(1)
    expect(questions[0]!.id).toBe("db_q1")
  })

  it("returns [] - NOT the mock key - for a DB lesson with zero quiz rows", async () => {
    dbState.quizRows = []
    dbState.lessonRows = [{ id: MOCK_LESSON_ID }] // the lesson IS imported

    const questions = await getQuizQuestionsByLessonId(MOCK_LESSON_ID)
    expect(questions).toEqual([])

    // Belt and braces: the mock fixture DOES hold questions for this id, so
    // an empty result proves the fallback did not fire.
    const mockQuestions =
      mockLessons.find((l) => l.id === MOCK_LESSON_ID)?.questions ?? []
    expect(mockQuestions.length).toBeGreaterThan(0)
  })

  it("returns [] even when the lessons row itself is gone (round-2 defect 9)", async () => {
    // A deleted/re-keyed lessons row must fail loudly too - the old
    // "lesson not imported" probe fell back to the mock key here.
    dbState.quizRows = []
    dbState.lessonRows = []
    const questions = await getQuizQuestionsByLessonId(MOCK_LESSON_ID)
    expect(questions).toEqual([])
  })

  it("uses the mock set when no database is configured", async () => {
    delete process.env.DATABASE_URL
    const questions = await getQuizQuestionsByLessonId(MOCK_LESSON_ID)
    expect(questions.length).toBeGreaterThan(0)
  })
})

describe("getLessonMonthById", () => {
  it("reads the month from the DB row", async () => {
    dbState.lessonRows = [{ month: 2 }]
    expect(await getLessonMonthById(MOCK_LESSON_ID)).toBe(2)
  })

  it("returns null - the access gate then REFUSES - when the DB has never seen the lesson", async () => {
    // Round-2 defect 9: resolving a month from the mock fixture here let
    // the access check pass and grading proceed against fixture data.
    dbState.lessonRows = []
    expect(await getLessonMonthById(MOCK_LESSON_ID)).toBeNull()
  })

  it("reads the month from the mock set in pure mock mode only", async () => {
    delete process.env.DATABASE_URL
    expect(await getLessonMonthById(MOCK_LESSON_ID)).toBe(1)
    expect(await getLessonMonthById("no_such_lesson")).toBeNull()
  })
})
