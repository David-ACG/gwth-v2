import { describe, expect, it } from "vitest"
import { agreementReport, measureAgreement, type CheckedMark, type MarkPair } from "./agreement"
import type { Band } from "./rules"

const pair = (david: Band, dt: number, judge: Band, jt: number): MarkPair => ({ david: { band: david, total: dt }, judge: { band: judge, total: jt } })
const many = <T,>(count: number, p: T): T[] => Array.from({ length: count }, () => p)

describe("the agreement test", () => {
  it("passes 18 same bands of 20, close totals, no big misses", () => {
    const r = measureAgreement([...many(18, pair("good", 70, "good", 72)), ...many(2, pair("pass", 50, "good", 61))])
    expect(r).toMatchObject({ checked: 20, sameBand: 18, twoBandsOff: 0, passedNotYet: 0, passed: true, failing: [] })
    expect(r.meanGap).toBe(2.9)
  })

  it("fails on 16 of 20 same bands", () => {
    const r = measureAgreement([...many(16, pair("good", 70, "good", 70)), ...many(4, pair("pass", 55, "good", 62))])
    expect(r.passed).toBe(false)
    expect(r.failing).toEqual(["same band on 16 of 20, needs 17"])
  })

  it("fails on a single mark two bands off, or a single pass of David's Not yet", () => {
    const base = many(19, pair("good", 70, "good", 70))
    expect(measureAgreement([...base, pair("pass", 45, "excellent", 85)]).failing).toContain("1 marked two bands away from yours")
    expect(measureAgreement([...base, pair("not_yet", 35, "pass", 42)]).failing).toContain("1 passed when you gave Not yet")
  })

  it("fails when totals are more than 8 points away on average", () => {
    const r = measureAgreement(many(20, pair("good", 62, "good", 71)))
    expect(r.failing).toEqual(["totals 9 points from yours on average, needs 8 or fewer"])
  })

  it("never passes before 20 checked hand-ins", () => {
    expect(measureAgreement(many(19, pair("good", 70, "good", 70))).failing).toEqual(["19 of 20 hand-ins checked so far"])
    expect(measureAgreement([]).meanGap).toBeNull()
  })

  it("reports each judge and the pair per capstone", () => {
    const report = agreementReport(
      many<CheckedMark>(20, {
        capstoneId: "familybot",
        david: { band: "good", total: 70 },
        luna: { band: "good", total: 71 },
        haiku: { band: "pass", total: 55 },
        pair: { band: "good", total: 66 },
      }),
      ["familybot", "askmyco"],
    )
    expect(report[0]).toMatchObject({ capstoneId: "familybot", luna: { passed: true }, haiku: { passed: false }, pair: { passed: true } })
    expect(report[1]!.pair.checked).toBe(0)
  })
})
