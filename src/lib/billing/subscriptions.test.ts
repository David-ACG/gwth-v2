import { describe, expect, it } from "vitest"
import { payerHoldTarget } from "./subscriptions"

const d = (iso: string) => new Date(iso)
const NOW = d("2027-01-20T12:00:00Z")
const DAY = 24 * 60 * 60 * 1000

describe("hold the clock for monthly payers", () => {
  it("leaves a charge alone while the next month's charge is more than 3 days away and unfinished", () => {
    expect(payerHoldTarget({ opens: null, chargeAt: d("2027-01-25T12:00:00Z"), held: false, now: NOW })).toBeNull()
  })

  it("pushes the charge back a week when it is close and the month is unfinished", () => {
    const target = payerHoldTarget({ opens: null, chargeAt: d("2027-01-22T12:00:00Z"), held: false, now: NOW })
    expect(target).toEqual(new Date(NOW.getTime() + 7 * DAY))
  })

  it("keeps rolling a held charge forward a week at a time, but not every run", () => {
    expect(payerHoldTarget({ opens: null, chargeAt: d("2027-01-26T12:00:00Z"), held: true, now: NOW })).toBeNull()
    expect(payerHoldTarget({ opens: null, chargeAt: d("2027-01-22T12:00:00Z"), held: true, now: NOW })).toEqual(
      new Date(NOW.getTime() + 7 * DAY)
    )
  })

  it("moves the charge to a known future open date that is later than the charge", () => {
    const opens = d("2027-02-10T00:00:00Z")
    expect(payerHoldTarget({ opens, chargeAt: d("2027-01-22T12:00:00Z"), held: false, now: NOW })).toEqual(opens)
  })

  it("does not move an unheld charge earlier just because the month opens before it", () => {
    expect(
      payerHoldTarget({ opens: d("2027-01-21T00:00:00Z"), chargeAt: d("2027-01-25T12:00:00Z"), held: false, now: NOW })
    ).toBeNull()
  })

  it("brings a held charge forward to the open date once one is set", () => {
    const opens = d("2027-01-23T00:00:00Z")
    expect(payerHoldTarget({ opens, chargeAt: d("2027-01-27T12:00:00Z"), held: true, now: NOW })).toEqual(opens)
  })

  it("takes a held charge now once the month has opened", () => {
    expect(
      payerHoldTarget({ opens: d("2027-01-19T00:00:00Z"), chargeAt: d("2027-01-24T12:00:00Z"), held: true, now: NOW })
    ).toBe("now")
  })

  it("does nothing once the month is open and the charge was never held", () => {
    expect(
      payerHoldTarget({ opens: d("2027-01-01T00:00:00Z"), chargeAt: d("2027-01-24T12:00:00Z"), held: false, now: NOW })
    ).toBeNull()
  })

  it("does nothing when the charge already sits on the open date", () => {
    const opens = d("2027-02-10T00:00:00Z")
    expect(payerHoldTarget({ opens, chargeAt: opens, held: true, now: NOW })).toBeNull()
  })
})
