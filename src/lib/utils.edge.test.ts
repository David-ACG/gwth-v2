import { describe, expect, it } from "vitest"

import { formatProgress } from "./utils"

describe("formatProgress edge cases", () => {
  it("treats NaN as no progress", () => {
    expect(formatProgress(NaN)).toBe("0%")
  })

  it("treats Infinity and -Infinity as no progress", () => {
    expect(formatProgress(Infinity)).toBe("0%")
    expect(formatProgress(-Infinity)).toBe("0%")
  })

  it("still clamps finite out-of-range values", () => {
    expect(formatProgress(-0.5)).toBe("0%")
    expect(formatProgress(1.5)).toBe("100%")
  })

  it("still formats normal in-range values", () => {
    expect(formatProgress(0.756)).toBe("76%")
  })
})
