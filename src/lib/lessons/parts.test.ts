/**
 * Lessons in parts (bead gwth-launch-hqyp): schema, the answer-stripping
 * public copy, and the pure check state machine.
 */
import { describe, expect, it, vi } from "vitest"

// mediaUrl reads the CDN base at module load: make sure it is unset so media
// keys pass through unchanged.
vi.hoisted(() => {
  delete process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
})

import {
  MAX_WRONG_BEFORE_EXPLAIN,
  allPartsResolved,
  applyCheckAnswer,
  emptyCheckState,
  firstOpenPart,
  lessonPartsSchema,
  parseLessonParts,
  rightFirstTimeScore,
  toPublicParts,
  type LessonPartsContent,
  type PartCheckContent,
  type PartCheckState,
} from "./parts"

function fixture(): Record<string, unknown> {
  return {
    version: 1,
    lessonId: "m1_l10",
    title: "Prompts that work",
    intro: {
      video: "lessons/m1_l10/formats/intro.mp4",
      poster: "lessons/m1_l10/formats/intro.jpg",
      seconds: 40,
      captions: "WEBVTT\n\n00:00.000 --> 00:01.000\nHello",
    },
    parts: [
      {
        id: "p1",
        title: "Say what you want",
        minutes: 2.4,
        bodyMd: "First paragraph.\n\nSecond paragraph.",
        image: { light: "lessons/m1_l10/formats/p1-light.png", alt: "A lever" },
        check: {
          question: "What helps most?",
          options: ["Being vague", "Being specific", "Shouting"],
          answerIndex: 1,
          feedbackRight: "RIGHT-FEEDBACK-P1",
          feedbackWrong: "WRONG-FEEDBACK-P1",
          explanation: "EXPLANATION-P1",
        },
        read: { audio: "lessons/m1_l10/formats/read_p1.mp3", seconds: 30, words: [[0, "Hello"]] },
        watch: {
          video: "lessons/m1_l10/formats/video_p1.mp4",
          poster: "lessons/m1_l10/formats/video_p1.jpg",
          captions: "WEBVTT",
        },
      },
      {
        id: "p2",
        title: "Check the answer",
        minutes: 3.3,
        bodyMd: "Only paragraph.",
        check: {
          question: "Should you check?",
          options: ["Yes", "No", "Sometimes"],
          answerIndex: 0,
          feedbackRight: "RIGHT-FEEDBACK-P2",
          feedbackWrong: "WRONG-FEEDBACK-P2",
        },
        read: { audio: "https://media.example.com/read_p2.mp3" },
        watch: { video: "lessons/m1_l10/formats/video_p2.mp4" },
      },
    ],
  }
}

type Fixture = { parts: Array<Record<string, unknown> & { check: Record<string, unknown> }> } & Record<string, unknown>

function valid(): LessonPartsContent {
  return lessonPartsSchema.parse(fixture())
}

const fakeRender = (md: string) => ({ lead: `<p>${md.length}</p>`, rest: "" })

describe("lessonPartsSchema", () => {
  it("accepts a valid two-part lesson and defaults words to []", () => {
    const parsed = lessonPartsSchema.safeParse(fixture())
    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.parts).toHaveLength(2)
    expect(parsed.data.parts[0]!.read.words).toEqual([[0, "Hello"]])
    expect(parsed.data.parts[1]!.read.words).toEqual([])
  })

  it("rejects an answerIndex outside the options", () => {
    const f = fixture() as Fixture
    f.parts[0]!.check.answerIndex = 3
    const parsed = lessonPartsSchema.safeParse(f)
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    expect(parsed.error.issues.some((i) => i.path.join(".") === "parts.0.check.answerIndex")).toBe(true)
  })

  it("rejects duplicate part ids", () => {
    const f = fixture() as Fixture
    f.parts[1]!.id = "p1"
    const parsed = lessonPartsSchema.safeParse(f)
    expect(parsed.success).toBe(false)
    if (parsed.success) return
    expect(parsed.error.issues.some((i) => i.message.includes("duplicate part id p1"))).toBe(true)
  })

  it.each(["m1_l1", "M1_L10", "lesson-10", "m1_l10x", ""])("rejects lessonId %j", (lessonId) => {
    const f = fixture()
    f.lessonId = lessonId
    expect(lessonPartsSchema.safeParse(f).success).toBe(false)
  })

  it("parseLessonParts returns null (and logs) for bad content", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(parseLessonParts({ version: 2 })).toBeNull()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
    expect(parseLessonParts(fixture())?.lessonId).toBe("m1_l10")
  })
})

describe("toPublicParts", () => {
  it("strips every answer and piece of feedback", () => {
    const pub = toPublicParts(valid(), fakeRender)
    const json = JSON.stringify(pub)
    for (const key of ["answerIndex", "feedbackRight", "feedbackWrong", "explanation", "bodyMd", "words\""]) {
      expect(json).not.toContain(key)
    }
    for (const text of ["RIGHT-FEEDBACK", "WRONG-FEEDBACK", "EXPLANATION-P1", "WEBVTT"]) {
      expect(json).not.toContain(text)
    }
    expect(pub.parts[0]!.check).toEqual({
      question: "What helps most?",
      options: ["Being vague", "Being specific", "Shouting"],
    })
  })

  it("passes media keys through mediaUrl unchanged when no CDN is set", () => {
    const pub = toPublicParts(valid(), fakeRender)
    expect(pub.intro?.video).toBe("lessons/m1_l10/formats/intro.mp4")
    expect(pub.intro?.poster).toBe("lessons/m1_l10/formats/intro.jpg")
    expect(pub.parts[0]!.read.audio).toBe("lessons/m1_l10/formats/read_p1.mp3")
    expect(pub.parts[0]!.watch.video).toBe("lessons/m1_l10/formats/video_p1.mp4")
    expect(pub.parts[0]!.watch.poster).toBe("lessons/m1_l10/formats/video_p1.jpg")
    expect(pub.parts[0]!.image).toEqual({
      light: "lessons/m1_l10/formats/p1-light.png",
      dark: null,
      alt: "A lever",
      caption: null,
    })
    expect(pub.parts[1]!.read.audio).toBe("https://media.example.com/read_p2.mp3")
    expect(pub.parts[1]!.watch.poster).toBeNull()
    expect(pub.parts[1]!.image).toBeNull()
  })

  it("points words and captions at same-origin routes only when there is data", () => {
    const pub = toPublicParts(valid(), fakeRender)
    expect(pub.intro?.captionsUrl).toBe("/api/lesson-parts/m1_l10/captions/intro")
    expect(pub.parts[0]!.read.wordsUrl).toBe("/api/lesson-parts/m1_l10/words/p1")
    expect(pub.parts[0]!.watch.captionsUrl).toBe("/api/lesson-parts/m1_l10/captions/p1")
    expect(pub.parts[1]!.read.wordsUrl).toBeNull()
    expect(pub.parts[1]!.watch.captionsUrl).toBeNull()
  })

  it("sums minutes, numbers parts and renders each body", () => {
    const render = vi.fn(fakeRender)
    const pub = toPublicParts(valid(), render)
    expect(pub.totalMinutes).toBe(6) // round(2.4 + 3.3)
    expect(pub.parts.map((p) => p.index)).toEqual([0, 1])
    expect(render).toHaveBeenCalledWith("First paragraph.\n\nSecond paragraph.")
    expect(render).toHaveBeenCalledTimes(2)
    expect(pub.parts[0]!.read.seconds).toBe(30)
    expect(pub.parts[1]!.read.seconds).toBeNull()
  })

  it("has a null intro when the content has none", () => {
    const f = fixture()
    delete f.intro
    expect(toPublicParts(lessonPartsSchema.parse(f), fakeRender).intro).toBeNull()
  })
})

describe("applyCheckAnswer", () => {
  const content = valid()
  const withExplanation: PartCheckContent = content.parts[0]!.check // answerIndex 1
  const withoutExplanation: PartCheckContent = content.parts[1]!.check // answerIndex 0

  it("right first try resolves with firstRight true and a reveal", () => {
    const r = applyCheckAnswer(emptyCheckState("p1"), withExplanation, 1)
    expect(r.correct).toBe(true)
    expect(r.feedback).toBe("RIGHT-FEEDBACK-P1")
    expect(r.state).toMatchObject({ tries: 1, wrongTries: 0, correct: true, firstRight: true, resolved: true, answers: [1] })
    expect(r.reveal).toEqual({ answerIndex: 1, explanation: "EXPLANATION-P1" })
  })

  it("wrong then right resolves with firstRight false and one wrong try", () => {
    const a = applyCheckAnswer(emptyCheckState("p1"), withExplanation, 0)
    expect(a.correct).toBe(false)
    expect(a.feedback).toBe("WRONG-FEEDBACK-P1")
    expect(a.state.resolved).toBe(false)
    expect(a.reveal).toBeNull()
    const b = applyCheckAnswer(a.state, withExplanation, 1)
    expect(b.state).toMatchObject({ tries: 2, wrongTries: 1, correct: true, firstRight: false, resolved: true, answers: [0, 1] })
    expect(b.reveal).not.toBeNull()
  })

  it(`resolves after ${MAX_WRONG_BEFORE_EXPLAIN} wrong tries and reveals the answer`, () => {
    expect(MAX_WRONG_BEFORE_EXPLAIN).toBe(2)
    const a = applyCheckAnswer(emptyCheckState("p1"), withExplanation, 0)
    const b = applyCheckAnswer(a.state, withExplanation, 2)
    expect(b.correct).toBe(false)
    expect(b.state).toMatchObject({ tries: 2, wrongTries: 2, correct: false, firstRight: false, resolved: true, answers: [0, 2] })
    expect(b.reveal).toEqual({ answerIndex: 1, explanation: "EXPLANATION-P1" })
  })

  it("falls back to feedbackRight when there is no explanation", () => {
    const a = applyCheckAnswer(emptyCheckState("p2"), withoutExplanation, 1)
    const b = applyCheckAnswer(a.state, withoutExplanation, 2)
    expect(b.reveal).toEqual({ answerIndex: 0, explanation: "RIGHT-FEEDBACK-P2" })
  })

  it("changes nothing once resolved, but still acknowledges the pick", () => {
    const a = applyCheckAnswer(emptyCheckState("p1"), withExplanation, 0)
    const b = applyCheckAnswer(a.state, withExplanation, 0)
    const c = applyCheckAnswer(b.state, withExplanation, 1)
    expect(c.state).toBe(b.state)
    expect(c.correct).toBe(true)
    expect(c.reveal).toEqual({ answerIndex: 1, explanation: "EXPLANATION-P1" })
    const d = applyCheckAnswer(b.state, withExplanation, 2)
    expect(d.state).toBe(b.state)
    expect(d.correct).toBe(false)
    expect(d.state.tries).toBe(2)
  })

  it("does not mutate the previous state", () => {
    const before = emptyCheckState("p1")
    applyCheckAnswer(before, withExplanation, 0)
    expect(before).toEqual(emptyCheckState("p1"))
  })
})

describe("lesson standing helpers", () => {
  const parts = [{ id: "p1" }, { id: "p2" }, { id: "p3" }]
  const resolved = (partId: string, firstRight: boolean): PartCheckState => ({
    ...emptyCheckState(partId),
    tries: 1,
    correct: firstRight,
    firstRight,
    resolved: true,
  })

  it("allPartsResolved: false for no parts, partial, true when all resolved", () => {
    expect(allPartsResolved([], {})).toBe(false)
    expect(allPartsResolved(parts, {})).toBe(false)
    expect(allPartsResolved(parts, { p1: resolved("p1", true), p2: resolved("p2", false) })).toBe(false)
    expect(
      allPartsResolved(parts, { p1: resolved("p1", true), p2: resolved("p2", false), p3: resolved("p3", true) })
    ).toBe(true)
  })

  it("rightFirstTimeScore: 0 for no parts, rounded share otherwise", () => {
    expect(rightFirstTimeScore([], {})).toBe(0)
    expect(rightFirstTimeScore(parts, {})).toBe(0)
    expect(rightFirstTimeScore(parts, { p1: resolved("p1", true), p2: resolved("p2", false) })).toBe(33)
    expect(
      rightFirstTimeScore(parts, { p1: resolved("p1", true), p2: resolved("p2", true), p3: resolved("p3", true) })
    ).toBe(100)
  })

  it("firstOpenPart: 0 for nothing resolved, length for empty list and all resolved", () => {
    expect(firstOpenPart([], {})).toBe(0)
    expect(firstOpenPart(parts, {})).toBe(0)
    expect(firstOpenPart(parts, { p1: resolved("p1", true) })).toBe(1)
    expect(firstOpenPart(parts, { p1: resolved("p1", true), p3: resolved("p3", true) })).toBe(1)
    expect(
      firstOpenPart(parts, { p1: resolved("p1", true), p2: resolved("p2", false), p3: resolved("p3", true) })
    ).toBe(3)
  })
})
