import { describe, expect, it } from "vitest"
import { isAllowedTimingsUrl } from "./route"

/**
 * This endpoint takes a URL from the client, so the origin pin is the whole
 * security story: without it, a lesson page could be used to fetch anything the
 * server can reach.
 */
describe("isAllowedTimingsUrl", () => {
  const CDN = "https://media.gwth.ai"

  it("allows a timings file on the configured CDN", () => {
    expect(
      isAllowedTimingsUrl(
        "https://media.gwth.ai/lessons/m1_l01/audio/kokoro_main_timestamps.json",
        CDN
      )
    ).toBe(true)
  })

  it("refuses any other host, including look-alikes", () => {
    for (const src of [
      "https://media.gwth.ai.evil.test/a_timestamps.json",
      "https://evil.test/a_timestamps.json",
      "http://media.gwth.ai/a_timestamps.json", // scheme is part of the origin
      "http://169.254.169.254/latest/meta-data_timestamps.json",
      "http://localhost:8090/a_timestamps.json",
      "file:///etc/passwd_timestamps.json",
    ]) {
      expect(isAllowedTimingsUrl(src, CDN), src).toBe(false)
    }
  })

  it("refuses any other file on the CDN", () => {
    for (const src of [
      "https://media.gwth.ai/lessons/m1_l01/audio/kokoro_main.wav",
      "https://media.gwth.ai/lessons/m1_l01/video/intro.mp4",
      "https://media.gwth.ai/",
    ]) {
      expect(isAllowedTimingsUrl(src, CDN), src).toBe(false)
    }
  })

  it("refuses a query or fragment smuggled onto the path", () => {
    expect(
      isAllowedTimingsUrl(
        "https://media.gwth.ai/a_timestamps.json?x=1",
        CDN
      )
    ).toBe(false)
  })

  it("refuses everything when no CDN is configured", () => {
    expect(
      isAllowedTimingsUrl("https://media.gwth.ai/a_timestamps.json", "")
    ).toBe(false)
  })

  it("refuses a malformed URL", () => {
    expect(isAllowedTimingsUrl("not a url", CDN)).toBe(false)
    expect(isAllowedTimingsUrl("/relative_timestamps.json", CDN)).toBe(false)
  })
})
