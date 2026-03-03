/**
 * Tests for the Pipeline-to-Site conversion utilities.
 */
import { describe, it, expect } from "vitest"
import { pipelinePayloadToLesson } from "./pipeline"
import type { PipelineLessonPayload } from "./pipeline"

/** Creates a minimal valid payload for testing. */
function makePayload(overrides: Partial<PipelineLessonPayload> = {}): PipelineLessonPayload {
  return {
    id: "m1_l01",
    slug: "welcome-to-gwth",
    title: "Welcome to GWTH",
    description: "Your first AI lesson",
    order: 1,
    duration: 45,
    difficulty: "beginner",
    category: "Foundations",
    sectionId: "m1_w1",
    courseId: "course_gwth",
    courseSlug: "applied-ai-skills",
    month: 1,
    introVideoUrl: null,
    learnContent: "# Welcome\n\nLesson content here.",
    audioFileUrl: null,
    audioDuration: null,
    buildVideoUrl: null,
    buildInstructions: null,
    questions: [],
    resources: [],
    status: "available",
    ...overrides,
  }
}

describe("pipelinePayloadToLesson", () => {
  it("converts basic fields correctly", () => {
    const payload = makePayload()
    const lesson = pipelinePayloadToLesson(payload)

    expect(lesson.id).toBe("m1_l01")
    expect(lesson.slug).toBe("welcome-to-gwth")
    expect(lesson.title).toBe("Welcome to GWTH")
    expect(lesson.description).toBe("Your first AI lesson")
    expect(lesson.order).toBe(1)
    expect(lesson.duration).toBe(45)
    expect(lesson.difficulty).toBe("beginner")
    expect(lesson.category).toBe("Foundations")
    expect(lesson.sectionId).toBe("m1_w1")
    expect(lesson.courseId).toBe("course_gwth")
    expect(lesson.courseSlug).toBe("applied-ai-skills")
    expect(lesson.month).toBe(1)
    expect(lesson.status).toBe("available")
  })

  it("converts ISO date strings to Date objects", () => {
    const payload = makePayload({
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-02T14:30:00.000Z",
    })
    const lesson = pipelinePayloadToLesson(payload)

    expect(lesson.createdAt).toBeInstanceOf(Date)
    expect(lesson.updatedAt).toBeInstanceOf(Date)
    expect(lesson.createdAt.toISOString()).toBe("2026-03-01T10:00:00.000Z")
    expect(lesson.updatedAt.toISOString()).toBe("2026-03-02T14:30:00.000Z")
  })

  it("uses current date when timestamps are missing", () => {
    const before = new Date()
    const payload = makePayload()
    const lesson = pipelinePayloadToLesson(payload)
    const after = new Date()

    expect(lesson.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(lesson.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(lesson.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(lesson.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it("preserves quiz questions array", () => {
    const payload = makePayload({
      questions: [
        {
          id: "m1_l01_q1",
          question: "What is AI?",
          options: ["Artificial Intelligence", "A robot", "A language", "A database"],
          correctOptionIndex: 0,
          explanation: "AI stands for Artificial Intelligence.",
        },
        {
          id: "m1_l01_q2",
          question: "What is GWTH?",
          options: ["A course", "A game", "A tool", "A framework"],
          correctOptionIndex: 0,
          explanation: "GWTH is a learning course.",
        },
      ],
    })
    const lesson = pipelinePayloadToLesson(payload)

    expect(lesson.questions).toHaveLength(2)
    expect(lesson.questions[0].id).toBe("m1_l01_q1")
    expect(lesson.questions[0].options).toHaveLength(4)
    expect(lesson.questions[0].correctOptionIndex).toBe(0)
    expect(lesson.questions[1].id).toBe("m1_l01_q2")
  })

  it("preserves resources array", () => {
    const payload = makePayload({
      resources: [
        { title: "Docs", url: "https://gwth.ai/docs", type: "link" as const },
        { title: "Video", url: "https://gwth.ai/video", type: "video" as const },
      ],
    })
    const lesson = pipelinePayloadToLesson(payload)

    expect(lesson.resources).toHaveLength(2)
    expect(lesson.resources[0].title).toBe("Docs")
    expect(lesson.resources[0].type).toBe("link")
    expect(lesson.resources[1].type).toBe("video")
  })

  it("handles optional fields correctly", () => {
    const payload = makePayload({
      isOptional: true,
      optionalTrack: "Healthcare",
      introVideoUrl: "https://cdn.gwth.ai/intro.mp4",
      audioFileUrl: "https://cdn.gwth.ai/audio.mp3",
      audioDuration: 1234,
      buildVideoUrl: "https://cdn.gwth.ai/build.mp4",
      buildInstructions: "## Step 1\n\nDo this.",
    })
    const lesson = pipelinePayloadToLesson(payload)

    expect(lesson.isOptional).toBe(true)
    expect(lesson.optionalTrack).toBe("Healthcare")
    expect(lesson.introVideoUrl).toBe("https://cdn.gwth.ai/intro.mp4")
    expect(lesson.audioFileUrl).toBe("https://cdn.gwth.ai/audio.mp3")
    expect(lesson.audioDuration).toBe(1234)
    expect(lesson.buildVideoUrl).toBe("https://cdn.gwth.ai/build.mp4")
    expect(lesson.buildInstructions).toBe("## Step 1\n\nDo this.")
  })

  it("converts null optionalTrack to undefined", () => {
    const payload = makePayload({ optionalTrack: null })
    const lesson = pipelinePayloadToLesson(payload)
    expect(lesson.optionalTrack).toBeUndefined()
  })

  it("handles all difficulty levels", () => {
    for (const diff of ["beginner", "intermediate", "advanced"] as const) {
      const payload = makePayload({ difficulty: diff })
      const lesson = pipelinePayloadToLesson(payload)
      expect(lesson.difficulty).toBe(diff)
    }
  })

  it("handles all month values", () => {
    for (const month of [1, 2, 3] as const) {
      const payload = makePayload({ month })
      const lesson = pipelinePayloadToLesson(payload)
      expect(lesson.month).toBe(month)
    }
  })

  it("preserves markdown content with custom syntax", () => {
    const content = `# Lesson Title

:::note
This is a note.
:::

:::warning
Be careful!
:::

:::tip
Here's a tip.
:::

:::deep-dive[Advanced Topic]
Deep content here.
:::

The ==AI primitive|A fundamental capability== is important.`

    const payload = makePayload({ learnContent: content })
    const lesson = pipelinePayloadToLesson(payload)
    expect(lesson.learnContent).toBe(content)
    expect(lesson.learnContent).toContain(":::note")
    expect(lesson.learnContent).toContain(":::warning")
    expect(lesson.learnContent).toContain("==AI primitive|A fundamental capability==")
  })
})
