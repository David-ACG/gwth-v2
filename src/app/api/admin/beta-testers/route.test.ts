/**
 * Tests for PATCH /api/admin/beta-testers: the roster's tick box.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextResponse } from "next/server"

const requireAdminForApi = vi.fn()
const setBetaTester = vi.fn()

vi.mock("@/lib/admin", () => ({
  requireAdminForApi: () => requireAdminForApi(),
}))

vi.mock("@/lib/data/page-comments", () => ({
  setBetaTester: (...a: unknown[]) => setBetaTester(...a),
}))

import { PATCH } from "./route"

function patch(body: unknown) {
  return PATCH(
    new Request("http://localhost:3000/api/admin/beta-testers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  requireAdminForApi.mockResolvedValue({ id: "admin_1", email: "david@gwth.ai" })
  setBetaTester.mockResolvedValue(undefined)
})

describe("PATCH /api/admin/beta-testers", () => {
  it("returns the admin gate's denial untouched", async () => {
    requireAdminForApi.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
    const res = await patch({ userId: "u1", betaTester: true })
    expect(res.status).toBe(401)
    expect(setBetaTester).not.toHaveBeenCalled()
  })

  it("ticks a user, recording which admin did it", async () => {
    const res = await patch({ userId: "u1", betaTester: true })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, userId: "u1", betaTester: true })
    expect(setBetaTester).toHaveBeenCalledWith("u1", true, "admin_1")
  })

  it("unticks a user", async () => {
    const res = await patch({ userId: "u1", betaTester: false })
    expect(res.status).toBe(200)
    expect(setBetaTester).toHaveBeenCalledWith("u1", false, "admin_1")
  })

  it("400 on a bad body", async () => {
    expect((await patch({ userId: "", betaTester: true })).status).toBe(400)
    expect((await patch({ userId: "u1", betaTester: "yes" })).status).toBe(400)
    expect((await patch("{")).status).toBe(400)
    expect(setBetaTester).not.toHaveBeenCalled()
  })

  it("404 when the user does not exist (foreign key)", async () => {
    setBetaTester.mockRejectedValue(Object.assign(new Error("fk"), { cause: { code: "23503" } }))
    expect((await patch({ userId: "ghost", betaTester: true })).status).toBe(404)
  })

  it("500 on any other failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    setBetaTester.mockRejectedValue(new Error("db down"))
    expect((await patch({ userId: "u1", betaTester: true })).status).toBe(500)
  })
})
