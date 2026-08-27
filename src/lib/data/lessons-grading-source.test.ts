/**
 * Regression: the server-side grading key must come from the DB, never
 * silently from the bundled mock fixture (gwth-launch-avo, N2 QA defect 7).
 *
 * Before this guard, `getQuizQuestionsByLessonId` fell back to the mock
 * answer key whenever the configured database held zero quiz rows for the
 * lesson — so a production lesson whose `quiz_questions` rows were dropped
 * or never seeded graded (and persisted) real submissions against the mock
 * fixture with no error anywhere. Now:
 *   - DB configured + lesson row exists + zero quiz rows  → []  (grading
 *     fails loudly upstream: "has no quiz to grade")
 *   - DB configured + lesson row absent                   → mock fallback
 *     (the dev "lesson not imported yet" case, matching getLesson)
 *   - no DB configured                                    → mock fallback
 *
 * The fake DB distinguishes the two queries by their terminal call: the quiz
 * read ends in `.orderBy(...)`, the lesson-existence probe in `.limit(1)`.
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

// A lesson that EXISTS in the mock fixture with a real answer key — the
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

  it("returns [] — NOT the mock key — for a DB lesson with zero quiz rows", async () => {
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

  it("still falls back to the mock set for a lesson the DB has never seen", async () => {
    dbState.quizRows = []
    dbState.lessonRows = [] // not imported: the dev fallback case
    const questions = await getQuizQuestionsByLessonId(MOCK_LESSON_ID)
    expect(questions.length).toBeGreaterThan(0)
    expect(questions[0]!.id).toMatch(/^m1_l01_q/)
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

  it("falls back to the mock set when the DB has never seen the lesson", async () => {
    dbState.lessonRows = []
    expect(await getLessonMonthById(MOCK_LESSON_ID)).toBe(1)
  })

  it("returns null for a lesson id nobody knows", async () => {
    dbState.lessonRows = []
    expect(await getLessonMonthById("no_such_lesson")).toBeNull()
  })
})
