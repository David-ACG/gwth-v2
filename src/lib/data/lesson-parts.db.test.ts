/**
 * DB-backed tests for the lessons-in-parts data layer (bead gwth-launch-hqyp).
 *
 * They run against the live dev Postgres (with migration 024 applied) and are
 * SKIPPED unless DATABASE_URL is set:
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/lib/data/lesson-parts.db.test.ts
 *
 * `getCurrentUser` is mocked; everything else (grading, the check rows, the
 * lesson_progress credit, the event log) is the real data layer.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const currentUser = vi.hoisted(() => ({ id: null as string | null }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => (currentUser.id ? { id: currentUser.id } : null),
}))

const USER = "00000000-0000-0000-0000-0000000024a1"
const COURSE_ID = "hqyp_test_course"
const SECTION_ID = "hqyp_test_section"
// Must match the content schema's /^m\d+_l\d{2}$/; no real lesson uses m9.
const LESSON_ID = "m9_l97"
const SESSION = "hqyp-test-session"

function content() {
  return {
    version: 1,
    lessonId: LESSON_ID,
    title: "Parts test lesson",
    parts: [
      {
        id: "p1",
        title: "Part one",
        minutes: 2,
        bodyMd: "Part one body.",
        check: {
          question: "Q1?",
          options: ["a", "b", "c"],
          answerIndex: 2,
          feedbackRight: "right 1",
          feedbackWrong: "wrong 1",
          explanation: "because 1",
        },
        read: { audio: "lessons/m9_l97/read_p1.mp3", words: [[0, "Part"]] },
        watch: { video: "lessons/m9_l97/video_p1.mp4" },
      },
      {
        id: "p2",
        title: "Part two",
        minutes: 3,
        bodyMd: "Part two body.",
        check: {
          question: "Q2?",
          options: ["x", "y"],
          answerIndex: 0,
          feedbackRight: "right 2",
          feedbackWrong: "wrong 2",
        },
        read: { audio: "lessons/m9_l97/read_p2.mp3" },
        watch: { video: "lessons/m9_l97/video_p2.mp4" },
      },
    ],
  }
}

describeDb("lesson parts data layer (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let data: typeof import("./lesson-parts")
  let stored: Awaited<ReturnType<typeof data.upsertLessonParts>>

  async function cleanup() {
    await sql`delete from lesson_events where user_id = ${USER} or lesson_id = ${LESSON_ID}`
    await sql`delete from lesson_part_checks where lesson_id = ${LESSON_ID}`
    await sql`delete from lesson_progress where lesson_id = ${LESSON_ID}`
    await sql`delete from learner_preferences where user_id = ${USER}`
    await sql`delete from lesson_parts where lesson_id = ${LESSON_ID}`
    await sql`delete from lessons where id = ${LESSON_ID}`
    await sql`delete from sections where id = ${SECTION_ID}`
    await sql`delete from courses where id = ${COURSE_ID}`
    await sql`delete from "user" where id = ${USER}`
  }

  function answer(partId: string, optionIndex: number) {
    return data.recordPartCheckAnswer({
      userId: USER,
      content: stored,
      partId,
      optionIndex,
      format: "read",
      sessionId: SESSION,
    })
  }

  async function checkRow(partId: string) {
    const [row] = await sql`select * from lesson_part_checks
      where user_id = ${USER} and lesson_id = ${LESSON_ID} and part_id = ${partId}`
    return row
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    data = await import("./lesson-parts")
    await cleanup()
    await sql`insert into "user" (id, name, email) values (${USER}, 'HQYP Parts Test', 'hqyp-parts-test@example.com')`
    await sql`insert into courses (id, slug, title) values (${COURSE_ID}, ${COURSE_ID}, 'HQYP Test Course')`
    await sql`insert into sections (id, course_id, title, month) values (${SECTION_ID}, ${COURSE_ID}, 'HQYP Test Section', 1)`
    await sql`insert into lessons (id, slug, title, section_id, course_id, month)
              values (${LESSON_ID}, ${LESSON_ID}, 'HQYP Test Lesson', ${SECTION_ID}, ${COURSE_ID}, 1)`
  })

  afterAll(async () => {
    await cleanup()
    await sql.end({ timeout: 5 })
  })

  it("upsertLessonParts + getLessonPartsContent round-trip, and upsert replaces", async () => {
    stored = await data.upsertLessonParts(content(), "test")
    expect(stored.lessonId).toBe(LESSON_ID)

    const read = await data.getLessonPartsContent(LESSON_ID)
    expect(read).toEqual(stored)
    expect(read?.parts[1]?.read.words).toEqual([])

    const changed = content()
    changed.title = "Parts test lesson, revised"
    await data.upsertLessonParts(changed, "test-2")
    expect((await data.getLessonPartsContent(LESSON_ID))?.title).toBe("Parts test lesson, revised")
    const [row] = await sql`select source, version from lesson_parts where lesson_id = ${LESSON_ID}`
    expect(row?.source).toBe("test-2")
    expect(row?.version).toBe("1")

    stored = await data.upsertLessonParts(content(), "test")
  })

  it("upsertLessonParts refuses content that does not validate", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const bad = content()
    bad.parts[0]!.check.answerIndex = 7
    await expect(data.upsertLessonParts(bad, "test")).rejects.toThrow(/does not validate/)
    spy.mockRestore()
    expect(await data.getLessonPartsContent("m9_l96")).toBeNull()
  })

  it("an out-of-range option or unknown part returns null and writes nothing", async () => {
    expect(await answer("p1", 3)).toBeNull()
    expect(await answer("p1", -1)).toBeNull()
    expect(await answer("p1", 1.5)).toBeNull()
    expect(await answer("nope", 0)).toBeNull()
    expect(await checkRow("p1")).toBeUndefined()
    const [n] = await sql`select count(*)::int as n from lesson_events where user_id = ${USER}`
    expect(n?.n).toBe(0)
  })

  it("wrong, wrong on part 1 resolves it with a reveal and resolved_at set", async () => {
    const first = await answer("p1", 0)
    expect(first).toMatchObject({ correct: false, reveal: null, lessonComplete: false })
    expect(first?.state.resolved).toBe(false)
    const afterFirst = await checkRow("p1")
    expect(afterFirst?.resolved_at).toBeNull()
    expect(afterFirst?.tries).toBe(1)

    const second = await answer("p1", 1)
    expect(second?.correct).toBe(false)
    expect(second?.state.resolved).toBe(true)
    expect(second?.reveal).toEqual({ answerIndex: 2, explanation: "because 1" })
    expect(second?.lessonComplete).toBe(false)

    const row = await checkRow("p1")
    expect(row?.resolved_at).not.toBeNull()
    expect(row?.tries).toBe(2)
    expect(row?.wrong_tries).toBe(2)
    expect(row?.first_right).toBe(false)
    expect(row?.answers).toEqual([0, 1])

    // Part 1 resolved, lesson not complete: partial credit, not completed.
    const [progress] = await sql`select * from lesson_progress where user_id = ${USER} and lesson_id = ${LESSON_ID}`
    expect(progress?.is_completed).toBe(false)
    expect(progress?.quiz_passed).toBe(false)
    expect(Number(progress?.progress)).toBeCloseTo(0.495, 3)
  })

  it("answering a resolved part again changes nothing in lesson_part_checks", async () => {
    const before = await checkRow("p1")
    const again = await answer("p1", 2)
    expect(again?.correct).toBe(true)
    expect(again?.state.resolved).toBe(true)
    expect(again?.state.tries).toBe(2)
    expect(again?.lessonComplete).toBe(false)
    const after = await checkRow("p1")
    expect(after).toEqual(before)
  })

  it("right on part 2 completes the lesson and credits lesson_progress", async () => {
    const r = await answer("p2", 0)
    expect(r?.correct).toBe(true)
    expect(r?.state.firstRight).toBe(true)
    expect(r?.lessonComplete).toBe(true)

    const [progress] = await sql`select * from lesson_progress where user_id = ${USER} and lesson_id = ${LESSON_ID}`
    expect(progress?.is_completed).toBe(true)
    expect(progress?.quiz_passed).toBe(true)
    expect(Number(progress?.intro_video_progress)).toBe(1)
    expect(Number(progress?.progress)).toBe(1)
    expect(Number(progress?.best_quiz_score)).toBe(50) // one of two right first time
    expect(Number(progress?.quiz_score)).toBe(50)
    expect(progress?.graded_by).toBe("server")
    expect(progress?.completed_at).not.toBeNull()
  })

  it("wrote check_answer and lesson_completed events", async () => {
    const events = await sql`select event, part_index, format, detail, session_id from lesson_events
      where user_id = ${USER} and lesson_id = ${LESSON_ID} order by id`
    expect(events.map((e) => e.event)).toEqual([
      "check_answer",
      "check_answer",
      "check_answer",
      "check_answer",
      "lesson_completed",
    ])
    expect(events.every((e) => e.session_id === SESSION && e.format === "read")).toBe(true)
    expect(events[0]?.detail).toMatchObject({ option: 0, correct: false, try: 1, afterResolved: false })
    expect(events[2]?.detail).toMatchObject({ option: 2, correct: true, try: null, afterResolved: true })
    expect(events[3]?.part_index).toBe(1)
    expect(events[4]?.detail).toEqual({ score: 50 })
  })

  it("answering after completion does not write a second lesson_completed", async () => {
    await answer("p2", 1)
    const [n] = await sql`select count(*)::int as n from lesson_events
      where user_id = ${USER} and lesson_id = ${LESSON_ID} and event = 'lesson_completed'`
    expect(n?.n).toBe(1)
  })

  it("recordLessonEvents stores valid client events and drops invalid ones", async () => {
    const written = await data.recordLessonEvents(USER, LESSON_ID, SESSION, [
      { event: "part_opened", partIndex: 0, format: "watch" },
      { event: "check_answer", partIndex: 0 },
      { event: "rating", detail: { value: "good" } },
      { event: "rating", detail: { value: "meh" } },
      { event: "nonsense" },
    ])
    expect(written).toBe(2)
    const rows = await sql`select event, format from lesson_events
      where user_id = ${USER} and event in ('part_opened', 'rating') order by id`
    expect(rows.map((r) => r.event)).toEqual(["part_opened", "rating"])
    expect(rows[0]?.format).toBe("watch")
    expect(await data.recordLessonEvents(USER, LESSON_ID, SESSION, [{ event: "lesson_completed" }])).toBe(0)
  })

  it("setLearnerPrefs inserts, then patches only the given fields", async () => {
    expect(await data.setLearnerPrefs(USER, { lessonFormat: "watch" })).toEqual({ lessonFormat: "watch", readAlong: true })
    expect(await data.setLearnerPrefs(USER, { readAlong: false })).toEqual({ lessonFormat: "watch", readAlong: false })
    expect(await data.setLearnerPrefs(USER, { lessonFormat: "read" })).toEqual({ lessonFormat: "read", readAlong: false })
    currentUser.id = USER
    expect(await data.getLearnerPrefs()).toEqual({ lessonFormat: "read", readAlong: false })
    currentUser.id = null
  })
})
