/**
 * Tests for PATCH /api/comments/[id]: who may change which comment.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const getPageComment = vi.fn()
const updatePageComment = vi.fn()
const getCommentRole = vi.fn()

vi.mock("@/lib/data/page-comments", () => ({
  getPageComment: (...a: unknown[]) => getPageComment(...a),
  updatePageComment: (...a: unknown[]) => updatePageComment(...a),
}))

vi.mock("@/lib/comments/role", () => ({
  getCommentRole: () => getCommentRole(),
}))

import { PATCH } from "./route"

const ID = "11111111-2222-4333-8444-555555555555"
const BETA = { role: "beta", identity: { id: "beta_1", name: "Bea", email: "bea@example.com" } }
const ADMIN = { role: "admin", identity: { id: "admin_1", name: "David", email: "david@gwth.ai" } }

function patch(body: unknown) {
  return PATCH(
    new Request(`http://localhost:3000/api/comments/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: ID }) }
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getPageComment.mockResolvedValue({ id: ID, userId: "beta_1", status: "open" })
  updatePageComment.mockImplementation(async (id: string, p: object) => ({
    id,
    userId: "beta_1",
    status: "open",
    ...p,
  }))
})

describe("PATCH /api/comments/[id]", () => {
  it("401 without a session, 403 without a role", async () => {
    getCommentRole.mockResolvedValue({ role: null, identity: null })
    expect((await patch({ status: "withdrawn" })).status).toBe(401)
    getCommentRole.mockResolvedValue({ role: null, identity: BETA.identity })
    expect((await patch({ status: "withdrawn" })).status).toBe(403)
    expect(updatePageComment).not.toHaveBeenCalled()
  })

  it("400 on an empty patch or bad JSON", async () => {
    getCommentRole.mockResolvedValue(BETA)
    expect((await patch({})).status).toBe(400)
    expect((await patch("{")).status).toBe(400)
  })

  it("the author withdraws their own open comment", async () => {
    getCommentRole.mockResolvedValue(BETA)
    const res = await patch({ status: "withdrawn" })
    expect(res.status).toBe(200)
    expect(updatePageComment).toHaveBeenCalledWith(ID, { status: "withdrawn" })
    expect((await res.json()).comment.status).toBe("withdrawn")
  })

  it("the author edits their own open comment", async () => {
    getCommentRole.mockResolvedValue(BETA)
    const res = await patch({ comment: " Better wording " })
    expect(res.status).toBe(200)
    expect(updatePageComment).toHaveBeenCalledWith(ID, { comment: "Better wording" })
  })

  it("a beta tester cannot set any status but withdrawn", async () => {
    getCommentRole.mockResolvedValue(BETA)
    const res = await patch({ status: "fixed" })
    expect(res.status).toBe(403)
    expect(updatePageComment).not.toHaveBeenCalled()
  })

  it("someone else's comment is 404 to a beta tester", async () => {
    getCommentRole.mockResolvedValue(BETA)
    getPageComment.mockResolvedValue({ id: ID, userId: "other", status: "open" })
    expect((await patch({ status: "withdrawn" })).status).toBe(404)
    expect(updatePageComment).not.toHaveBeenCalled()
  })

  it("409 once a comment has been picked up", async () => {
    getCommentRole.mockResolvedValue(BETA)
    getPageComment.mockResolvedValue({ id: ID, userId: "beta_1", status: "accepted" })
    expect((await patch({ status: "withdrawn" })).status).toBe(409)
  })

  it("the admin may set any status on anyone's comment", async () => {
    getCommentRole.mockResolvedValue(ADMIN)
    getPageComment.mockResolvedValue({ id: ID, userId: "other", status: "accepted" })
    const res = await patch({ status: "fixed" })
    expect(res.status).toBe(200)
    expect(updatePageComment).toHaveBeenCalledWith(ID, { status: "fixed" })
  })

  it("404 for an unknown id", async () => {
    getCommentRole.mockResolvedValue(ADMIN)
    getPageComment.mockResolvedValue(null)
    expect((await patch({ status: "fixed" })).status).toBe(404)
  })
})
