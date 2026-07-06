import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

/**
 * mediaUrl reads NEXT_PUBLIC_MEDIA_CDN_BASE_URL at module-eval time, so each
 * scenario sets the env then imports the module fresh (resetModules).
 */
async function loadMediaUrlModule(base?: string) {
  vi.resetModules()
  if (base === undefined) {
    delete process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
  } else {
    process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL = base
  }
  return import("./url")
}

async function loadMediaUrl(base?: string) {
  const mod = await loadMediaUrlModule(base)
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

describe("markdownImageUrl", () => {
  const OLD = process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
  afterEach(() => {
    if (OLD === undefined) delete process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL
    else process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL = OLD
  })

  describe("CDN configured", () => {
    let markdownImageUrl: (src: unknown) => string | null
    beforeEach(async () => {
      markdownImageUrl = (await loadMediaUrlModule("https://media.gwth.ai")).markdownImageUrl
    })
    it("resolves a bare lessons/ assets key onto the CDN (W16 authored figures)", () => {
      expect(markdownImageUrl("lessons/m1_l01/assets/generated/fig.png")).toBe(
        "https://media.gwth.ai/lessons/m1_l01/assets/generated/fig.png",
      )
    })
    it("resolves a bare lessons/ images key onto the CDN (W16 section figures)", () => {
      expect(markdownImageUrl("lessons/m1_l06/images/lesson_05_001.png")).toBe(
        "https://media.gwth.ai/lessons/m1_l06/images/lesson_05_001.png",
      )
    })
    it("folds a legacy /api/lessons ref onto the CDN", () => {
      expect(markdownImageUrl("/api/lessons/m1_l01/images/x.png")).toBe(
        "https://media.gwth.ai/lessons/m1_l01/images/x.png",
      )
    })
    it("passes absolute and data/blob URLs through", () => {
      expect(markdownImageUrl("https://example.com/a.png")).toBe("https://example.com/a.png")
      expect(markdownImageUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA")
    })
    it("hides unhosted relative refs and junk", () => {
      expect(markdownImageUrl("assets/generated/missing.png")).toBeNull()
      expect(markdownImageUrl("")).toBeNull()
      expect(markdownImageUrl(undefined)).toBeNull()
      expect(markdownImageUrl(42)).toBeNull()
    })
  })

  describe("no CDN configured", () => {
    it("hides bare lessons/ keys instead of emitting a relative 404", async () => {
      const { markdownImageUrl } = await loadMediaUrlModule(undefined)
      expect(markdownImageUrl("lessons/m1_l01/images/a.png")).toBeNull()
      expect(markdownImageUrl("https://example.com/a.png")).toBe("https://example.com/a.png")
    })
  })
})
