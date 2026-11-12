// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  SIGNED_LINK_SECONDS,
  collectLessonRefs,
  findLessonRefs,
  lessonKeyOf,
  rewriteLessonRefs,
  signingWindowStart,
} from "./signing-rules"

const CDN = "https://media.gwth.ai"

describe("lessonKeyOf", () => {
  it("takes lesson media on the CDN, legacy P520 URLs and bare keys", () => {
    expect(lessonKeyOf(`${CDN}/lessons/m1_l01/video/intro.mp4`, CDN)).toBe("lessons/m1_l01/video/intro.mp4")
    expect(lessonKeyOf("http://192.168.178.50:8088/api/lessons/m1_l01/audio/a.wav", CDN)).toBe("lessons/m1_l01/audio/a.wav")
    expect(lessonKeyOf("lessons/m1_l01/assets/fig%20one.png", CDN)).toBe("lessons/m1_l01/assets/fig one.png")
    expect(lessonKeyOf("/lessons/m1_l01/x.png?v=2", CDN)).toBe("lessons/m1_l01/x.png")
  })

  it("leaves public folders, other hosts and odd input alone", () => {
    expect(lessonKeyOf(`${CDN}/site/home-film/2026-10-21/film.mp4`, CDN)).toBeNull()
    expect(lessonKeyOf(`${CDN}/email/logo.png`, CDN)).toBeNull()
    expect(lessonKeyOf("https://evil.example/lessons/m1_l01/x.png", CDN)).toBeNull()
    expect(lessonKeyOf("data:image/png;base64,AAAA", CDN)).toBeNull()
    expect(lessonKeyOf("lessons/../secrets.txt", CDN)).toBeNull()
    expect(lessonKeyOf(null, CDN)).toBeNull()
  })
})

describe("findLessonRefs", () => {
  it("finds CDN URLs anywhere and bare keys only as image or link targets", () => {
    const md = [
      "Intro text mentions the lessons/ folder in passing.",
      "![Roadmap](lessons/m1_l01/assets/roadmap.png \"The roadmap\")",
      `<img src="${CDN}/lessons/m1_l01/images/a.png" alt="">`,
      `See ${CDN}/lessons/m1_l01/video/intro.mp4 for the film.`,
      `![Film still](${CDN}/site/home-film/still.png)`,
    ].join("\n")
    const keys = findLessonRefs(md, CDN).map((r) => r.key).sort()
    expect(keys).toEqual([
      "lessons/m1_l01/assets/roadmap.png",
      "lessons/m1_l01/images/a.png",
      "lessons/m1_l01/video/intro.mp4",
    ])
  })
})

describe("rewriteLessonRefs", () => {
  it("swaps every reference in nested props and leaves everything else", () => {
    const value = {
      intro: { video: `${CDN}/lessons/m1_l01/video/intro.mp4`, poster: null },
      parts: [{ html: `<p>Hi</p><img src="${CDN}/lessons/m1_l01/images/a.png">`, n: 3 }],
      body: "![x](lessons/m1_l01/assets/b.png)",
      film: `${CDN}/site/film.mp4`,
    }
    const refs = collectLessonRefs(value, CDN)
    expect(refs.size).toBe(3)
    const signed = new Map([...refs.keys()].map((ref) => [ref, `https://signed.example/${encodeURIComponent(ref)}?sig=1`]))
    const out = rewriteLessonRefs(value, signed)
    expect(out.intro.video).toMatch(/^https:\/\/signed\.example\//)
    expect(out.intro.poster).toBeNull()
    expect(out.parts[0]?.html).toContain('src="https://signed.example/')
    expect(out.parts[0]?.n).toBe(3)
    expect(out.body).toMatch(/^!\[x\]\(https:\/\/signed\.example\//)
    expect(out.film).toBe(`${CDN}/site/film.mp4`)
    // The original is untouched.
    expect(value.intro.video).toBe(`${CDN}/lessons/m1_l01/video/intro.mp4`)
  })

  it("never replaces a bare key that sits inside a longer URL", () => {
    const text = `![a](lessons/m1_l01/a.png) and ${CDN}/lessons/m1_l01/a.png`
    const refs = collectLessonRefs(text, CDN)
    const signed = new Map([...refs.keys()].map((ref) => [ref, `S(${ref})`]))
    const out = rewriteLessonRefs(text, signed)
    expect(out).toBe(`![a](S(lessons/m1_l01/a.png)) and S(${CDN}/lessons/m1_l01/a.png)`)
  })
})

describe("signing window", () => {
  it("signs from the start of the hour, so a link lives 2 to 3 hours", () => {
    const now = new Date("2026-11-12T10:59:30Z")
    const start = signingWindowStart(now)
    expect(start.toISOString()).toBe("2026-11-12T10:00:00.000Z")
    const expires = start.getTime() + SIGNED_LINK_SECONDS * 1000
    expect(expires - now.getTime()).toBeGreaterThan(2 * 3600_000 - 60_000)
    expect(expires - now.getTime()).toBeLessThanOrEqual(3 * 3600_000)
  })
})
