import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

/**
 * mediaUrl reads NEXT_PUBLIC_MEDIA_CDN_BASE_URL at module-eval time, so each
 * scenario sets the env then imports the module fresh (resetModules).
 */
async function loadMediaUrl(base?: string) {
  vi.resetModules()
  if (base === undefined) {
    delete process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
  } else {
    process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL = base
  }
  const mod = await import("./url")
  return mod.mediaUrl
}

describe("mediaUrl", () => {
  const OLD = process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
  afterEach(() => {
    if (OLD === undefined) delete process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
    else process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL = OLD
  })

  describe("no CDN configured (dev / pre-cutover)", () => {
    let mediaUrl: (r: string | null | undefined) => string | null | undefined
    beforeEach(async () => {
      mediaUrl = await loadMediaUrl(undefined)
    })
    it("passes absolute URLs through unchanged", () => {
      expect(mediaUrl("http://192.168.178.50:8088/api/lessons/m1_l01/video/intro.mp4")).toBe(
        "http://192.168.178.50:8088/api/lessons/m1_l01/video/intro.mp4",
      )
    })
    it("passes relative keys through unchanged", () => {
      expect(mediaUrl("lessons/m1_l01/video/intro.mp4")).toBe(
        "lessons/m1_l01/video/intro.mp4",
      )
    })
    it("preserves null / undefined / empty", () => {
      expect(mediaUrl(null)).toBeNull()
      expect(mediaUrl(undefined)).toBeUndefined()
      expect(mediaUrl("")).toBe("")
    })
  })

  describe("CDN configured", () => {
    let mediaUrl: (r: string | null | undefined) => string | null | undefined
    beforeEach(async () => {
      // trailing slash intentionally, to prove it's normalised
      mediaUrl = await loadMediaUrl("https://media.gwth.ai/")
    })
    it("folds a legacy absolute P520 /api/lessons URL onto the CDN, dropping /api", () => {
      expect(mediaUrl("http://192.168.178.50:8088/api/lessons/m1_l01/video/intro.mp4")).toBe(
        "https://media.gwth.ai/lessons/m1_l01/video/intro.mp4",
      )
    })
    it("folds a site-relative /api/lessons path onto the CDN", () => {
      expect(mediaUrl("/api/lessons/m1_l01/audio/kokoro_main.wav")).toBe(
        "https://media.gwth.ai/lessons/m1_l01/audio/kokoro_main.wav",
      )
    })
    it("prefixes a bare relative key", () => {
      expect(mediaUrl("lessons/m1_l01/video/intro.mp4")).toBe(
        "https://media.gwth.ai/lessons/m1_l01/video/intro.mp4",
      )
    })
    it("leaves an already-CDN absolute URL unchanged", () => {
      expect(mediaUrl("https://media.gwth.ai/lessons/m1_l01/video/intro.mp4")).toBe(
        "https://media.gwth.ai/lessons/m1_l01/video/intro.mp4",
      )
    })
    it("leaves an unrelated absolute URL unchanged", () => {
      expect(mediaUrl("https://videodelivery.net/abc123/manifest/video.m3u8")).toBe(
        "https://videodelivery.net/abc123/manifest/video.m3u8",
      )
    })
    it("preserves null / undefined", () => {
      expect(mediaUrl(null)).toBeNull()
      expect(mediaUrl(undefined)).toBeUndefined()
    })
  })
})
