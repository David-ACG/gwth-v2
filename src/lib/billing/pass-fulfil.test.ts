import { describe, expect, it } from "vitest"
import { wasScheduled } from "./pass-fulfil"

describe("which gifts get the buyer's 'gift sent' email", () => {
  const bought = new Date("2026-12-03T10:00:00Z")
  it("a gift scheduled for a later day does", () => {
    expect(wasScheduled({ createdAt: bought, deliverAt: new Date("2026-12-25T07:00:00Z") })).toBe(true)
  })
  it("a 'straight away' gift does not: its receipt already says it has gone", () => {
    expect(wasScheduled({ createdAt: bought, deliverAt: new Date(bought.getTime() + 2000) })).toBe(false)
  })
})
