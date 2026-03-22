import { describe, it, expect } from "vitest"
import sitemap from "./sitemap"

describe("sitemap", () => {
  it("returns an empty array during pre-launch", () => {
    const result = sitemap()
    expect(result).toEqual([])
  })
})
