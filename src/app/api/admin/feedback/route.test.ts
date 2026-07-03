/**
 * W4 — /api/admin/feedback tests: the read/unread marker is gated identically
 * to the /admin layout (session + ADMIN_EMAILS allowlist) and writes through
 * the feedback data layer.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const authState = vi.hoisted(() => ({ user: null as unknown }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => Promise.resolve(authState.user),
}))

const dataLayer = vi.hoisted(() => ({
  calls: [] as Array<{ id: string; read: boolean }>,
  fail: false,
}))
vi.mock("@/lib/data/feedback", () => ({
  setFeedbackRead: async (id: string, read: boolean) => {
    if (dataLayer.fail) throw new Error("db down")
    dataLayer.calls.push({ id, read })
  },
}))

import { PATCH } from "./route"

const FEEDBACK_ID = "3f9d2b1c-8a45-4e6b-9d21-abc123def456"

function patchRequest(body: unknown): NextRequest {
  return new NextRequest(new URL("https://gwth.ai/api/admin/feedback"), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("PATCH /api/admin/feedback (W4)", () => {
  const originalAdmins = process.env.ADMIN_EMAILS

  beforeEach(() => {
    authState.user = null
    dataLayer.calls = []
    dataLayer.fail = false
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
  })

  afterEach(() => {
    if (originalAdmins === undefined) delete process.env.ADMIN_EMAILS
    else process.env.ADMIN_EMAILS = originalAdmins
  })

  it("returns 401 for anonymous callers", async () => {
    const response = await PATCH(patchRequest({ id: FEEDBACK_ID, read: true }))
    expect(response.status).toBe(401)
    expect(dataLayer.calls).toHaveLength(0)
  })

  it("returns 401 for an authenticated non-admin", async () => {
    authState.user = { id: "u2", email: "tester@example.com" }
    const response = await PATCH(patchRequest({ id: FEEDBACK_ID, read: true }))
    expect(response.status).toBe(401)
    expect(dataLayer.calls).toHaveLength(0)
  })

  it("rejects a non-uuid id with 400", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }
    const response = await PATCH(patchRequest({ id: "nope", read: true }))
    expect(response.status).toBe(400)
  })

  it("marks read and unread for an admin", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }

    const markRead = await PATCH(patchRequest({ id: FEEDBACK_ID, read: true }))
    expect(markRead.status).toBe(200)

    const markUnread = await PATCH(patchRequest({ id: FEEDBACK_ID, read: false }))
    expect(markUnread.status).toBe(200)

    expect(dataLayer.calls).toEqual([
      { id: FEEDBACK_ID, read: true },
      { id: FEEDBACK_ID, read: false },
    ])
  })

  it("returns 500 when the data layer fails", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }
    dataLayer.fail = true
    const response = await PATCH(patchRequest({ id: FEEDBACK_ID, read: true }))
    expect(response.status).toBe(500)
  })
})
