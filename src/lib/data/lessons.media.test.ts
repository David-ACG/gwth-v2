/**
 * Found 2026-07-26: a production lesson page shipped the raw pipeline LAN URL
 * `http://192.168.178.50:8088/api/lessons/.../audio/kokoro_main.wav` inside its
 * serialised props. The rendered <audio src> was correct because the component
 * called mediaUrl() itself, but the un-rewritten value rode along in the
 * payload, publishing the internal host and port to anyone viewing source.
 *
 * Media is now rewritten in `rowToLesson`, at the data boundary, so no raw LAN
 * address can reach a client component at all.
 */
import { describe, it, expect, vi, afterEach } from "vitest"

const ROW = {
  id: "m1_l01",
  slug: "welcome-to-gwth",
  title: "Welcome",
  description: "d",
  order: 1,
  duration: 45,
  difficulty: "beginner",
  category: "AI",
  sectionId: "s1",
  courseId: "c1",
  courseSlug: "applied-ai-skills",
  month: 1,
  isOptional: false,
  optionalTrack: null,
  introVideoUrl:
    "http://192.168.178.50:8088/api/lessons/19e4bc1c/video/lesson_01_intro.mp4",
  learnContent: "body",
  audioFileUrl:
    "http://192.168.178.50:8088/api/lessons/19e4bc1c/audio/kokoro_main.wav",
  audioDuration: 1931,
  buildVideoUrl:
    "http://192.168.178.50:8088/api/lessons/19e4bc1c/video/build.mp4",
  buildInstructions: null,
  status: "available",
  createdAt: null,
  updatedAt: null,
}

/**
 * `rowToLesson` is module-private and mediaUrl reads its base at module-eval
 * time, so the module is imported fresh with the CDN configured and the mapper
 * is exercised through `getLesson`'s DB path via a stubbed Drizzle client.
 */
async function mapRow(cdnBase: string) {
  vi.resetModules()
  process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL = cdnBase
  process.env.DATABASE_URL = "postgresql://stub/stub"

  const chain = (rows: unknown[]) => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(rows),
        orderBy: () => Promise.resolve(rows),
      }),
    }),
  })
  let call = 0
  vi.doMock("@/db", () => ({
    getDb: () => ({
      select: () => {
        call += 1
        // First select: the lesson row. Later selects: questions, resources.
        return chain(call === 1 ? [ROW] : [])
      },
    }),
  }))

  const mod = await import("./lessons")
  return mod.getLesson("welcome-to-gwth")
}

describe("lesson media is rewritten at the data boundary", () => {
  const OLD_CDN = process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
  const OLD_DB = process.env.DATABASE_URL
  afterEach(() => {
    vi.doUnmock("@/db")
    if (OLD_CDN === undefined) delete process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
    else process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL = OLD_CDN
    if (OLD_DB === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = OLD_DB
  })

  it("never leaves a LAN address on any media field", async () => {
    const lesson = await mapRow("https://media.gwth.ai")
    expect(lesson).not.toBeNull()
    const serialised = JSON.stringify(lesson)
    expect(serialised).not.toContain("192.168.")
    expect(serialised).not.toContain(":8088")
  })

  it("folds each media field onto the CDN", async () => {
    const lesson = await mapRow("https://media.gwth.ai")
    expect(lesson!.audioFileUrl).toBe(
      "https://media.gwth.ai/lessons/19e4bc1c/audio/kokoro_main.wav"
    )
    expect(lesson!.introVideoUrl).toBe(
      "https://media.gwth.ai/lessons/19e4bc1c/video/lesson_01_intro.mp4"
    )
    expect(lesson!.buildVideoUrl).toBe(
      "https://media.gwth.ai/lessons/19e4bc1c/video/build.mp4"
    )
  })

  it("passes values through untouched when no CDN is configured", async () => {
    const lesson = await mapRow("")
    // Dev and pre-cutover behaviour is unchanged: without a CDN base the raw
    // pipeline URL is still what the app has to use.
    expect(lesson!.audioFileUrl).toBe(ROW.audioFileUrl)
  })
})
