/**
 * Start Here sign-up, confirm and opt-out routes (bead gwth-launch-xw6s).
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const store = vi.hoisted(() => ({
  recentSignupCount: vi.fn(),
  recordConsent: vi.fn(),
  confirmConsent: vi.fn(),
  withdrawConsent: vi.fn(),
}))
const plunk = vi.hoisted(() => ({ sendPlunkEmail: vi.fn() }))

vi.mock("@/lib/start-here/store", () => ({
  ...store,
  MAX_SIGNUPS_PER_HOUR: 3,
  normaliseEmail: (e: string) => e.trim().toLowerCase(),
}))
vi.mock("@/lib/email/plunk", () => plunk)

import { POST } from "./route"
import { GET as CONFIRM } from "./confirm/route"
import { POST as UNSUBSCRIBE } from "./unsubscribe/route"
import { ACCESS_COOKIE, CONSENT_VERSION, signToken, verifyToken } from "@/lib/start-here/consent"

const ID = "3f2b9c1e-7d4a-4c2b-9e1f-0a1b2c3d4e5f"

function signup(body: unknown): Request {
  return new Request("http://localhost:3000/api/start-here", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("BETTER_AUTH_SECRET", "route-test-secret")
  vi.stubEnv("BETTER_AUTH_URL", "https://hlab.example.net:9458")
  store.recentSignupCount.mockResolvedValue(0)
  store.recordConsent.mockResolvedValue(ID)
  plunk.sendPlunkEmail.mockResolvedValue(true)
})

describe("POST /api/start-here", () => {
  it("records the consent and emails a confirm link, unlocking nothing", async () => {
    const res = await POST(signup({ email: " Reader@Example.com ", consentVersion: CONSENT_VERSION }))
    expect(res.status).toBe(200)
    expect(res.headers.get("set-cookie")).toBeNull()
    expect(store.recordConsent).toHaveBeenCalledWith("Reader@Example.com")
    const mail = plunk.sendPlunkEmail.mock.calls[0]![0]
    expect(mail.to).toBe("reader@example.com")
    expect(mail.subject).toBe("Your free GWTH lesson: Start Here")
    const confirm = /\/api\/start-here\/confirm\?t=([^"&\s]+)/.exec(mail.body)?.[1]
    expect(verifyToken("confirm", decodeURIComponent(confirm ?? ""))).toBe(ID)
  })

  it("rejects a bad email address", async () => {
    const res = await POST(signup({ email: "not-an-email", consentVersion: CONSENT_VERSION }))
    expect(res.status).toBe(400)
    expect(store.recordConsent).not.toHaveBeenCalled()
  })

  it("asks for a reload when the wording on screen is out of date", async () => {
    const res = await POST(signup({ email: "a@example.com", consentVersion: "old" }))
    expect(res.status).toBe(409)
    expect(store.recordConsent).not.toHaveBeenCalled()
  })

  it("stops after three sign-ups an hour for one address", async () => {
    store.recentSignupCount.mockResolvedValue(3)
    const res = await POST(signup({ email: "a@example.com", consentVersion: CONSENT_VERSION }))
    expect(res.status).toBe(429)
    expect(plunk.sendPlunkEmail).not.toHaveBeenCalled()
  })

  it("quietly ignores a form a bot filled in", async () => {
    const res = await POST(signup({ email: "a@example.com", consentVersion: CONSENT_VERSION, website: "x" }))
    expect(res.status).toBe(200)
    expect(store.recordConsent).not.toHaveBeenCalled()
  })

  it("says something went wrong when the database fails", async () => {
    store.recordConsent.mockRejectedValue(new Error("down"))
    const res = await POST(signup({ email: "a@example.com", consentVersion: CONSENT_VERSION }))
    expect(res.status).toBe(500)
  })
})

describe("GET /api/start-here/confirm", () => {
  it("confirms, sets the access cookie and goes back to the page", async () => {
    store.confirmConsent.mockResolvedValue("a@example.com")
    const t = signToken("confirm", ID)
    const res = await CONFIRM(new Request(`http://localhost:3000/api/start-here/confirm?t=${encodeURIComponent(t)}`))
    expect(res.status).toBe(303)
    expect(res.headers.get("location")).toBe("/start-here?welcome=1")
    expect(store.confirmConsent).toHaveBeenCalledWith(ID)
    const cookie = res.cookies.get(ACCESS_COOKIE)
    expect(verifyToken("access", cookie?.value)).toBe(ID)
    expect(cookie?.httpOnly).toBe(true)
  })

  it("sends a bad or wrong-purpose link back to the form", async () => {
    const wrong = signToken("access", ID)
    const res = await CONFIRM(new Request(`http://localhost:3000/api/start-here/confirm?t=${encodeURIComponent(wrong)}`))
    expect(res.headers.get("location")).toBe("/start-here?link=invalid")
    expect(store.confirmConsent).not.toHaveBeenCalled()
    expect(res.cookies.get(ACCESS_COOKIE)).toBeUndefined()
  })

  it("does not unlock a sign-up that no longer exists", async () => {
    store.confirmConsent.mockResolvedValue(null)
    const t = signToken("confirm", ID)
    const res = await CONFIRM(new Request(`http://localhost:3000/api/start-here/confirm?t=${encodeURIComponent(t)}`))
    expect(res.headers.get("location")).toBe("/start-here?link=invalid")
    expect(res.cookies.get(ACCESS_COOKIE)).toBeUndefined()
  })
})

describe("POST /api/start-here/unsubscribe", () => {
  it("opts out from the page's button", async () => {
    store.withdrawConsent.mockResolvedValue("a@example.com")
    const t = signToken("unsubscribe", ID)
    const res = await UNSUBSCRIBE(
      new Request(`http://localhost:3000/api/start-here/unsubscribe?t=${encodeURIComponent(t)}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "",
      })
    )
    expect(res.status).toBe(303)
    expect(res.headers.get("location")).toBe("/start-here/unsubscribe?done=1")
    expect(store.withdrawConsent).toHaveBeenCalledWith(ID)
  })

  it("answers an inbox's one-click unsubscribe (RFC 8058) with 200", async () => {
    store.withdrawConsent.mockResolvedValue("a@example.com")
    const t = signToken("unsubscribe", ID)
    const res = await UNSUBSCRIBE(
      new Request(`http://localhost:3000/api/start-here/unsubscribe?t=${encodeURIComponent(t)}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "List-Unsubscribe=One-Click",
      })
    )
    expect(res.status).toBe(200)
  })

  it("refuses a confirm token", async () => {
    const t = signToken("confirm", ID)
    const res = await UNSUBSCRIBE(
      new Request(`http://localhost:3000/api/start-here/unsubscribe?t=${encodeURIComponent(t)}`, { method: "POST" })
    )
    expect(res.headers.get("location")).toBe("/start-here/unsubscribe?failed=1")
    expect(store.withdrawConsent).not.toHaveBeenCalled()
  })
})
