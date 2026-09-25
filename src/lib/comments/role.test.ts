import { beforeEach, describe, expect, it, vi } from "vitest"

const getSessionIdentity = vi.fn()
const isBetaTester = vi.fn()

vi.mock("@/lib/auth", () => ({
  getSessionIdentity: () => getSessionIdentity(),
}))
vi.mock("@/lib/data/page-comments", () => ({
  isBetaTester: (...a: unknown[]) => isBetaTester(...a),
}))

import { getCommentRole } from "./role"

const ADMIN = { id: "admin_1", name: "David", email: "David@GWTH.ai" }
const BETA = { id: "beta_1", name: "Bea", email: "bea@example.com" }

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("ADMIN_EMAILS", "david@gwth.ai")
  isBetaTester.mockImplementation(async (id: string) => id === "beta_1")
})

describe("getCommentRole", () => {
  it("nobody signed in: no role, no identity, no DB read", async () => {
    getSessionIdentity.mockResolvedValue(null)
    await expect(getCommentRole()).resolves.toEqual({ role: null, identity: null })
    expect(isBetaTester).not.toHaveBeenCalled()
  })

  it("an ADMIN_EMAILS address is admin", async () => {
    getSessionIdentity.mockResolvedValue(ADMIN)
    await expect(getCommentRole()).resolves.toEqual({ role: "admin", identity: ADMIN })
    expect(isBetaTester).not.toHaveBeenCalled()
  })

  it("a ticked user is beta", async () => {
    getSessionIdentity.mockResolvedValue(BETA)
    await expect(getCommentRole()).resolves.toEqual({ role: "beta", identity: BETA })
  })

  it("any other learner gets no role but keeps the identity", async () => {
    const learner = { id: "l1", name: "Lee", email: "lee@example.com" }
    getSessionIdentity.mockResolvedValue(learner)
    await expect(getCommentRole()).resolves.toEqual({ role: null, identity: learner })
  })

  it("a beta_testers read failure means no role, never a thrown page", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    getSessionIdentity.mockResolvedValue(BETA)
    isBetaTester.mockRejectedValue(new Error("relation does not exist"))
    await expect(getCommentRole()).resolves.toEqual({ role: null, identity: BETA })
  })
})
