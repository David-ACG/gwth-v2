/**
 * Tests for PATCH /api/pipeline/comments/[id]: the triage script's write.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const updatePageComment = vi.fn()

vi.mock("@/lib/data/page-comments", () => ({
  updatePageComment: (...a: unknown[]) => updatePageComment(...a),
}))

import { PATCH } from "./route"

const KEY = "test-pipeline-key"
const ID = "11111111-2222-4333-8444-555555555555"
const TRIAGE = {
  by: "opus",
  at: "2026-09-25T10:00:00Z",
  verdict: "valid",
  reason: "Typo confirmed",
  bead: "gwth-launch-abcd",
}

function patch(body: unknown, headers: Record<string, string> = { "x-api-key": KEY }) {
  return PATCH(
    new Request(`http://localhost:3000/api/pipeline/comments/${ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: ID }) }
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("PIPELINE_API_KEY", KEY)
  updatePageComment.mockImplementation(async (id: string, p: object) => ({ id, ...p }))
})

describe("PATCH /api/pipeline/comments/[id]", () => {
  it("fails closed without a configured key, 401 with a wrong one", async () => {
    vi.stubEnv("PIPELINE_API_KEY", "")
    expect((await patch({ status: "accepted" })).status).toBe(500)
    vi.stubEnv("PIPELINE_API_KEY", KEY)
    expect((await patch({ status: "accepted" }, { "x-api-key": "wrong" })).status).toBe(401)
    expect((await patch({ status: "accepted" }, {})).status).toBe(401)
    expect(updatePageComment).not.toHaveBeenCalled()
  })

  it("accepts the key in the body", async () => {
    const res = await patch({ status: "accepted", apiKey: KEY }, {})
    expect(res.status).toBe(200)
    expect(updatePageComment).toHaveBeenCalledWith(ID, { status: "accepted" })
  })

  it("records a status and the triage record", async () => {
    const res = await patch({ status: "accepted", triage: TRIAGE })
    expect(res.status).toBe(200)
    expect(updatePageComment).toHaveBeenCalledWith(ID, { status: "accepted", triage: TRIAGE })
    expect((await res.json()).comment).toMatchObject({ id: ID, status: "accepted" })
  })

  it("400 on a missing or unknown status, or a triage without by/at", async () => {
    expect((await patch({})).status).toBe(400)
    expect((await patch({ status: "done" })).status).toBe(400)
    expect((await patch({ status: "fixed", triage: { reason: "x" } })).status).toBe(400)
    expect((await patch("{")).status).toBe(400)
    expect(updatePageComment).not.toHaveBeenCalled()
  })

  it("404 for an unknown id", async () => {
    updatePageComment.mockResolvedValue(null)
    expect((await patch({ status: "fixed" })).status).toBe(404)
  })
})
