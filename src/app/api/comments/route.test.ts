/**
 * Tests for /api/comments (comment on the real student view).
 *
 * The real role resolution runs (src/lib/comments/role.ts over the real
 * getSessionIdentity), so these pin the gate end to end: no session is 401,
 * a signed-in learner who is neither admin nor beta is 403 and nothing is
 * read or written, and the server, not the browser, stamps who wrote it.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const createPageComment = vi.fn()
const getPageCommentsForPath = vi.fn()
const isBetaTester = vi.fn()
const getSession = vi.fn()

vi.mock("@/lib/data/page-comments", () => ({
  createPageComment: (...a: unknown[]) => createPageComment(...a),
  getPageCommentsForPath: (...a: unknown[]) => getPageCommentsForPath(...a),
  isBetaTester: (...a: unknown[]) => isBetaTester(...a),
}))

vi.mock("@/lib/better-auth", () => ({
  getAuth: () => ({ api: { getSession } }),
}))

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}))

import { GET, POST } from "./route"

const ADMIN = { user: { id: "admin_1", name: "David", email: "david@gwth.ai" } }
const BETA = { user: { id: "beta_1", name: "Bea", email: "bea@example.com" } }
const LEARNER = { user: { id: "learner_1", name: "Lee", email: "lee@example.com" } }

const VALID_BODY = {
  pagePath: "/course/month-1/lesson/m1_l01",
  pageTitle: "Lesson 1",
  lessonId: "m1_l01",
  lessonPage: 5,
  lessonVariant: "draft",
  targetType: "text",
  quote: "the UK",
  quotePrefix: null,
  comment: "  This sentence reads oddly.  ",
  viewport: "1440x900",
}

function postRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json", "user-agent": "vitest" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

function getRequest(path?: string): Request {
  const url = new URL("http://localhost:3000/api/comments")
  if (path !== undefined) url.searchParams.set("path", path)
  return new Request(url)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("DATABASE_URL", "postgres://test")
  vi.stubEnv("ADMIN_EMAILS", "david@gwth.ai")
  vi.stubEnv("BETTER_AUTH_URL", "https://hlab.taila51191.ts.net:9458")
  isBetaTester.mockImplementation(async (id: string) => id === "beta_1")
  createPageComment.mockImplementation(async (input: Record<string, unknown>) => ({
    id: "c1",
    status: "open",
    triage: null,
    createdAt: "2026-09-25T10:00:00.000Z",
    updatedAt: "2026-09-25T10:00:00.000Z",
    ...input,
  }))
  getPageCommentsForPath.mockResolvedValue([{ id: "c1" }])
})

describe("POST /api/comments", () => {
  it("401 without a session", async () => {
    getSession.mockResolvedValue(null)
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: "Unauthorized" })
    expect(createPageComment).not.toHaveBeenCalled()
  })

  it("403 for a signed-in learner who is neither admin nor beta", async () => {
    getSession.mockResolvedValue(LEARNER)
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(403)
    expect(createPageComment).not.toHaveBeenCalled()
  })

  it("400 on bad JSON", async () => {
    getSession.mockResolvedValue(BETA)
    const res = await POST(postRequest("{not json"))
    expect(res.status).toBe(400)
  })

  it.each([
    ["an empty comment", { comment: "   " }],
    ["a path without a leading slash", { pagePath: "course/x" }],
    ["an unknown target type", { targetType: "video" }],
    ["an unknown lesson variant", { lessonVariant: "staging" }],
    ["an over-long quote", { quote: "x".repeat(1001) }],
    ["an over-long comment", { comment: "x".repeat(4001) }],
  ])("400 on %s", async (_label, patch) => {
    getSession.mockResolvedValue(BETA)
    const res = await POST(postRequest({ ...VALID_BODY, ...patch }))
    expect(res.status).toBe(400)
    expect(typeof (await res.json()).error).toBe("string")
    expect(createPageComment).not.toHaveBeenCalled()
  })

  it("saves a beta tester's comment with server-stamped author, role and site", async () => {
    getSession.mockResolvedValue(BETA)
    const res = await POST(
      postRequest({ ...VALID_BODY, userId: "spoofed", authorRole: "admin", site: "production" })
    )
    expect(res.status).toBe(201)
    const input = createPageComment.mock.calls[0]?.[0]
    expect(input).toMatchObject({
      userId: "beta_1",
      authorEmail: "bea@example.com",
      authorRole: "beta",
      site: "preview",
      userAgent: "vitest",
      pagePath: "/course/month-1/lesson/m1_l01",
      lessonId: "m1_l01",
      lessonPage: 5,
      lessonVariant: "draft",
      targetType: "text",
      quote: "the UK",
      comment: "This sentence reads oddly.",
    })
    expect(input.quotePrefix).toBeUndefined()
    const data = await res.json()
    expect(data.comment).toMatchObject({ id: "c1", authorRole: "beta", status: "open" })
  })

  it("stamps the admin role for David without asking beta_testers", async () => {
    getSession.mockResolvedValue(ADMIN)
    const res = await POST(postRequest({ pagePath: "/", targetType: "page", comment: "Hi" }))
    expect(res.status).toBe(201)
    expect(createPageComment.mock.calls[0]?.[0]).toMatchObject({
      userId: "admin_1",
      authorRole: "admin",
    })
    expect(isBetaTester).not.toHaveBeenCalled()
  })

  it("accepts a canned action with no words and returns the stored label", async () => {
    getSession.mockResolvedValue(BETA)
    const res = await POST(
      postRequest({
        ...VALID_BODY,
        comment: "",
        action: { category: "content", key: "simplify", label: "spoofed label" },
        shape: { kind: "point", rel: { x: 0.5, y: 0.25, w: 0, h: 0 } },
      })
    )
    expect(res.status).toBe(201)
    const input = createPageComment.mock.calls[0]?.[0]
    expect(input).toMatchObject({
      comment: "",
      action: { category: "content", key: "simplify", label: "Simplify this" },
      shape: { kind: "point", rel: { x: 0.5, y: 0.25, w: 0, h: 0 } },
    })
    const data = await res.json()
    expect(data.comment.action).toEqual({
      category: "content",
      key: "simplify",
      label: "Simplify this",
    })
  })

  it("accepts an in-place text edit with no words", async () => {
    getSession.mockResolvedValue(BETA)
    const res = await POST(
      postRequest({
        ...VALID_BODY,
        comment: "",
        textEdit: { original: "the UK", replacement: "Britain" },
      })
    )
    expect(res.status).toBe(201)
    expect(createPageComment.mock.calls[0]?.[0]).toMatchObject({
      comment: "",
      textEdit: { original: "the UK", replacement: "Britain" },
    })
  })

  it("accepts a drawn area", async () => {
    getSession.mockResolvedValue(ADMIN)
    const res = await POST(
      postRequest({
        pagePath: "/dashboard",
        targetType: "area",
        selector: "main > section:nth-of-type(2)",
        shape: { kind: "box", rel: { x: 0.1, y: 0.2, w: 0.5, h: 0.3 } },
        comment: "Too cramped",
      })
    )
    expect(res.status).toBe(201)
    expect(createPageComment.mock.calls[0]?.[0]).toMatchObject({
      targetType: "area",
      shape: { kind: "box", rel: { x: 0.1, y: 0.2, w: 0.5, h: 0.3 } },
    })
  })

  it.each([
    ["an unknown action", { action: { category: "content", key: "delete_everything" } }],
    ["an action in the wrong category", { action: { category: "image", key: "rewrite" } }],
    ["an empty comment with neither an action nor a text edit", { comment: "" }],
    [
      "a text edit that changes nothing",
      { comment: "", textEdit: { original: "the UK", replacement: "the UK" } },
    ],
    ["a shape out of range", { shape: { kind: "box", rel: { x: 0, y: 0, w: 3, h: 1 } } }],
  ])("400 on %s", async (_label, patch) => {
    getSession.mockResolvedValue(BETA)
    const res = await POST(postRequest({ ...VALID_BODY, ...patch }))
    expect(res.status).toBe(400)
    expect(typeof (await res.json()).error).toBe("string")
    expect(createPageComment).not.toHaveBeenCalled()
  })

  it("500 when the row cannot be saved", async () => {
    getSession.mockResolvedValue(BETA)
    vi.spyOn(console, "error").mockImplementation(() => {})
    createPageComment.mockRejectedValue(new Error("db down"))
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: "Unable to save comment" })
  })

  it("403, not a crash, when beta_testers cannot be read", async () => {
    getSession.mockResolvedValue(BETA)
    vi.spyOn(console, "warn").mockImplementation(() => {})
    isBetaTester.mockRejectedValue(new Error('relation "beta_testers" does not exist'))
    const res = await POST(postRequest(VALID_BODY))
    expect(res.status).toBe(403)
  })
})

describe("GET /api/comments", () => {
  it("401 without a session and 403 for a learner", async () => {
    getSession.mockResolvedValue(null)
    expect((await GET(getRequest("/x"))).status).toBe(401)
    getSession.mockResolvedValue(LEARNER)
    expect((await GET(getRequest("/x"))).status).toBe(403)
    expect(getPageCommentsForPath).not.toHaveBeenCalled()
  })

  it("400 without a usable path", async () => {
    getSession.mockResolvedValue(BETA)
    expect((await GET(getRequest())).status).toBe(400)
    expect((await GET(getRequest("x"))).status).toBe(400)
  })

  it("a beta tester reads only their own comments on the page", async () => {
    getSession.mockResolvedValue(BETA)
    const res = await GET(getRequest("/course/x"))
    expect(res.status).toBe(200)
    expect(getPageCommentsForPath).toHaveBeenCalledWith("/course/x", { userId: "beta_1" })
    expect(await res.json()).toEqual({ comments: [{ id: "c1" }] })
  })

  it("the admin reads every comment on the page", async () => {
    getSession.mockResolvedValue(ADMIN)
    await GET(getRequest("/course/x"))
    expect(getPageCommentsForPath).toHaveBeenCalledWith("/course/x", {})
  })
})
