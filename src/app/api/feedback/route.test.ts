/**
 * Tests for /api/feedback (W5 — tester feedback channel).
 *
 * The headline guarantee under test: the feedback row is ALWAYS persisted, and
 * a Plunk failure (throw OR a falsey return) never loses it or fails the
 * request. Per-user scoping on GET (own rows vs admin-all) is also covered.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Mocks ────────────────────────────────────────────────────────────────────
const createFeedback = vi.fn()
const markFeedbackEmailSent = vi.fn()
const getFeedbackForUser = vi.fn()
const getAllFeedback = vi.fn()
const sendPlunkEmail = vi.fn()
const getSession = vi.fn()

vi.mock("@/lib/data/feedback", () => ({
  createFeedback: (...a: unknown[]) => createFeedback(...a),
  markFeedbackEmailSent: (...a: unknown[]) => markFeedbackEmailSent(...a),
  getFeedbackForUser: (...a: unknown[]) => getFeedbackForUser(...a),
  getAllFeedback: (...a: unknown[]) => getAllFeedback(...a),
  // Use the real allowlist behaviour.
  isFeedbackAdmin: (email?: string | null) =>
    Boolean(
      email &&
        ["david@gwth.ai", "david@agilecommercegroup.com"].includes(
          email.toLowerCase()
        )
    ),
}))

vi.mock("@/lib/email/plunk", () => ({
  sendPlunkEmail: (...a: unknown[]) => sendPlunkEmail(...a),
}))

vi.mock("@/lib/better-auth", () => ({
  getAuth: () => ({ api: { getSession } }),
}))

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}))

import { POST, GET } from "./route"

function postRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json", "user-agent": "vitest" },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  category: "bug",
  message: "The mark complete button does nothing on lesson 3.",
  sourcePath: "/course/x/lesson/y",
}

const SESSION = { user: { id: "user_123", email: "tester@example.com" } }
const ROW = { id: "fb_1" }

describe("/api/feedback POST", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("DATABASE_URL", "postgres://test")
    getSession.mockResolvedValue(SESSION)
    createFeedback.mockResolvedValue(ROW)
    markFeedbackEmailSent.mockResolvedValue(undefined)
    sendPlunkEmail.mockResolvedValue(true)
  })

  it("401 when there is no session", async () => {
    getSession.mockResolvedValue(null)
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(401)
    expect(createFeedback).not.toHaveBeenCalled()
  })

  it("400 when the message is too short", async () => {
    const res = await POST(postRequest({ ...VALID_BODY, message: "too short" }))
    expect(res.status).toBe(400)
    expect(createFeedback).not.toHaveBeenCalled()
  })

  it("persists the row keyed on the session user and emails on success", async () => {
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ success: true, id: "fb_1", emailSent: true })
    expect(createFeedback).toHaveBeenCalledWith({
      userId: "user_123",
      sourcePath: "/course/x/lesson/y",
      category: "bug",
      message: VALID_BODY.message,
      userAgent: "vitest",
    })
    expect(markFeedbackEmailSent).toHaveBeenCalledWith("fb_1")
  })

  it("STILL persists the row when Plunk THROWS (email never loses feedback)", async () => {
    sendPlunkEmail.mockRejectedValue(new Error("Plunk down"))
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ success: true, id: "fb_1", emailSent: false })
    expect(createFeedback).toHaveBeenCalledTimes(1)
    expect(markFeedbackEmailSent).not.toHaveBeenCalled()
  })

  it("STILL persists the row when Plunk returns false (no key configured)", async () => {
    sendPlunkEmail.mockResolvedValue(false)
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ success: true, emailSent: false })
    expect(createFeedback).toHaveBeenCalledTimes(1)
    expect(markFeedbackEmailSent).not.toHaveBeenCalled()
  })

  it("500 only when the row itself cannot be saved", async () => {
    createFeedback.mockRejectedValue(new Error("db down"))
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(500)
  })
})

describe("/api/feedback GET scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("DATABASE_URL", "postgres://test")
    getFeedbackForUser.mockResolvedValue([{ id: "own" }])
    getAllFeedback.mockResolvedValue([{ id: "a" }, { id: "b" }])
  })

  it("a tester reads only their own rows", async () => {
    getSession.mockResolvedValue(SESSION)
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(getFeedbackForUser).toHaveBeenCalledWith("user_123")
    expect(getAllFeedback).not.toHaveBeenCalled()
    expect(data.feedback).toEqual([{ id: "own" }])
  })

  it("the admin reads every row", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin_1", email: "david@gwth.ai" },
    })
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(getAllFeedback).toHaveBeenCalled()
    expect(getFeedbackForUser).not.toHaveBeenCalled()
    expect(data.feedback).toHaveLength(2)
  })

  it("401 when there is no session", async () => {
    getSession.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })
})
