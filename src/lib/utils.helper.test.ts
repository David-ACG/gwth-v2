import { describe, expect, it } from "vitest"
import { truncate } from "./utils"

describe("truncate", () => {
  it("returns short strings unchanged", () => {
    expect(truncate("Short", 10)).toBe("Short")
  })

  it("returns the string unchanged when it equals the max length", () => {
    expect(truncate("exactly10!", 10)).toBe("exactly10!")
  })

  it("truncates and appends an ellipsis, never exceeding max", () => {
    const result = truncate("AI Fundamentals", 10)
    expect(result).toBe("AI Fundam…")
    expect(result.length).toBe(10)
  })

  it("trims trailing whitespace before the ellipsis", () => {
    expect(truncate("hello world", 7)).toBe("hello…")
  })

  it("returns an empty string for a non-positive max", () => {
    expect(truncate("anything", 0)).toBe("")
    expect(truncate("anything", -5)).toBe("")
  })
})
