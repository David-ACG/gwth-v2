import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { START_HERE_FILM } from "./media"

// David, 20 Nov 2026: "Once you finish rendering please put all the videos
// into the site". The ink and watercolour lesson zero film replaced the
// 6 Nov film, in paper and night editions under a new dated key.
describe("START_HERE_FILM", () => {
  it("plays both editions from the new dated key", () => {
    const base = "https://media.gwth.ai/site/start-here/2026-11-20-watercolour"
    expect(START_HERE_FILM.paper.src).toBe(`${base}/lesson-zero-watercolour-paper.mp4`)
    expect(START_HERE_FILM.night.src).toBe(`${base}/lesson-zero-watercolour-night.mp4`)
    expect(START_HERE_FILM.paper.poster).toBe(`${base}/poster-paper.jpg`)
    expect(START_HERE_FILM.night.poster).toBe(`${base}/poster-night.jpg`)
  })

  it("serves the captions from this site, because media.gwth.ai sends no CORS header", () => {
    expect(START_HERE_FILM.captions).toBe("/start-here-film/lesson-zero-film.vtt")
    const file = path.join(process.cwd(), "public", START_HERE_FILM.captions)
    expect(existsSync(file)).toBe(true)
    expect(readFileSync(file, "utf8").startsWith("WEBVTT")).toBe(true)
  })
})
