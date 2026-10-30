import { describe, expect, it } from "vitest"
import { CAP_ENV, monthlyCapPence, wouldExceedCap } from "./spend"

describe("monthlyCapPence", () => {
  it("reads whole pounds and pounds and pence", () => {
    expect(monthlyCapPence({ [CAP_ENV]: "25" })).toBe(2500)
    expect(monthlyCapPence({ [CAP_ENV]: "12.5" })).toBe(1250)
    expect(monthlyCapPence({ [CAP_ENV]: " 12.05 " })).toBe(1205)
  })

  it("fails closed: unset, empty or invalid means nothing may be spent", () => {
    for (const value of [undefined, "", "abc", "-5", "£20", "1e3", "10.999", "10,00"]) {
      expect(monthlyCapPence({ [CAP_ENV]: value })).toBe(0)
    }
  })
})

describe("wouldExceedCap", () => {
  it("allows spend up to the cap and refuses beyond it", () => {
    expect(wouldExceedCap(0, 100, 2500)).toBe(false)
    expect(wouldExceedCap(2400, 100, 2500)).toBe(false)
    expect(wouldExceedCap(2400, 101, 2500)).toBe(true)
    expect(wouldExceedCap(2600, 0, 2500)).toBe(true)
  })

  it("a cap of 0 refuses any spend", () => {
    expect(wouldExceedCap(0, 0, 0)).toBe(true)
    expect(wouldExceedCap(0, 1, 0)).toBe(true)
  })

  it("refuses a negative or non-numeric amount", () => {
    expect(() => wouldExceedCap(-1, 1, 100)).toThrow(RangeError)
    expect(() => wouldExceedCap(0, Number.NaN, 100)).toThrow(RangeError)
    expect(() => wouldExceedCap(0, 1, Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })
})
