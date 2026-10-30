import { describe, expect, it, vi } from "vitest"

const failure = vi.hoisted(() => ({ error: null as unknown }))
vi.mock("@/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: async () => {
          throw failure.error
        },
      }),
    }),
  }),
}))

import { getCapstoneBestTotals } from "./capstone-score"

describe("getCapstoneBestTotals without the hand-in tables", () => {
  it("reads as no capstones when migration 028 has not run (42P01)", async () => {
    failure.error = Object.assign(new Error("query failed"), {
      cause: Object.assign(new Error('relation "capstone_submissions" does not exist'), { code: "42P01" }),
    })
    expect(await getCapstoneBestTotals("u1")).toEqual({})
  })

  it("throws any other database error", async () => {
    failure.error = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" })
    await expect(getCapstoneBestTotals("u1")).rejects.toThrow("connection refused")
  })
})
