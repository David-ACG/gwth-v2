/**
 * Tests for the /api/waitlist route.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"

// Mock the email module
vi.mock("@/lib/data/email", () => ({
  subscribeToWaitlist: vi.fn().mockResolvedValue({
    success: true,
    message: "You've been added to the waitlist!",
  }),
}))

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("/api/waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 200 with valid name and email", async () => {
    const res = await POST(createRequest({ name: "Alice", email: "alice@example.com" }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it("returns 400 when name is missing", async () => {
    const res = await POST(createRequest({ email: "alice@example.com" }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.errors?.name).toBeDefined()
  })

  it("returns 400 when email is missing", async () => {
    const res = await POST(createRequest({ name: "Alice" }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.errors?.email).toBeDefined()
  })

  it("returns 400 when email is invalid", async () => {
    const res = await POST(createRequest({ name: "Alice", email: "not-an-email" }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.errors?.email).toBeDefined()
  })

  it("returns 400 when body is empty", async () => {
    const res = await POST(createRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
  })

  it("calls subscribeToWaitlist with correct params", async () => {
    const { subscribeToWaitlist } = await import("@/lib/data/email")
    await POST(createRequest({ name: "Alice Test", email: "alice@example.com" }))
    expect(subscribeToWaitlist).toHaveBeenCalledWith({
      name: "Alice Test",
      email: "alice@example.com",
    })
  })
})
