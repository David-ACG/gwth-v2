/**
 * POST /api/lesson-draft/verdict: admin-only proxy from the comment pane to
 * the pipeline v3 verdict endpoint (bead gwth-launch-8ksq).
 */
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const authState = vi.hoisted(() => ({ user: null as unknown }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => Promise.resolve(authState.user),
}))

const draftState = vi.hoisted(() => ({
  dir: "/drafts" as string | null,
  folder: "m1_l01_welcome" as string | null,
  lookups: [] as string[],
}))
vi.mock("@/lib/lessons/draft", () => ({
  LESSON_ID_PATTERN: /^m\d+_l\d{2}$/,
  getLessonDraftsDir: () => draftState.dir,
  resolveLessonFolder: async (id: string) => {
    draftState.lookups.push(id)
    return draftState.folder
  },
}))

import { POST } from "./route"

const ADMIN = { id: "u1", email: "david@agilecommercegroup.com" }

function post(body: unknown): NextRequest {
  return new NextRequest(new URL("https://preview.test/api/lesson-draft/verdict"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

const fetchMock = vi.fn()

describe("POST /api/lesson-draft/verdict", () => {
  beforeEach(() => {
    authState.user = ADMIN
    draftState.dir = "/drafts"
    draftState.folder = "m1_l01_welcome"
    draftState.lookups = []
    vi.stubEnv("ADMIN_EMAILS", ADMIN.email)
    vi.stubEnv("PIPELINE_V3_URL", "")
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("refuses anonymous callers and non-admins", async () => {
    authState.user = null
    expect((await POST(post({ lessonId: "m1_l01", verdict: "approved" }))).status).toBe(401)
    authState.user = { id: "u2", email: "tester@example.com" }
    expect((await POST(post({ lessonId: "m1_l01", verdict: "approved" }))).status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("answers 404 drafts-disabled when LESSON_DRAFTS_DIR is unset", async () => {
    draftState.dir = null
    const res = await POST(post({ lessonId: "m1_l01", verdict: "approved" }))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: "drafts-disabled" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects a bad body", async () => {
    for (const body of [
      { lessonId: "../../etc", verdict: "approved" },
      { lessonId: "m1_l01", verdict: "maybe" },
      { lessonId: "m1_l01", verdict: "sent_back", note: "x".repeat(4001) },
    ]) {
      expect((await POST(post(body))).status).toBe(400)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("answers 404 when no lesson folder matches", async () => {
    draftState.folder = null
    const res = await POST(post({ lessonId: "m1_l09", verdict: "approved" }))
    expect(res.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("proxies to v3 with stage lesson and returns its status and body", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, state: "approved" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    )
    const res = await POST(
      post({ lessonId: "m1_l01", verdict: "sent_back", note: "Too long" })
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, state: "approved" })
    expect(draftState.lookups).toEqual(["m1_l01"])
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe("http://127.0.0.1:8110/api/lesson/m1_l01_welcome/verdict")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body)).toEqual({
      stage: "lesson",
      verdict: "sent_back",
      note: "Too long",
    })
  })

  it("uses PIPELINE_V3_URL and passes v3 errors through", async () => {
    vi.stubEnv("PIPELINE_V3_URL", "http://v3.test:9000/")
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "not ready" }), { status: 409 })
    )
    const res = await POST(post({ lessonId: "m1_l01", verdict: "approved" }))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: "not ready" })
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://v3.test:9000/api/lesson/m1_l01_welcome/verdict"
    )
  })

  it("answers 502 when the pipeline cannot be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))
    const res = await POST(post({ lessonId: "m1_l01", verdict: "approved" }))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: "pipeline-unreachable" })
  })
})
