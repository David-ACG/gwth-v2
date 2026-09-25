/**
 * Tests for GET /api/pipeline/comments: the triage script's read.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const listPageComments = vi.fn()

vi.mock("@/lib/data/page-comments", () => ({
  listPageComments: (...a: unknown[]) => listPageComments(...a),
}))

import { GET } from "./route"

const KEY = "test-pipeline-key"

function get(query: string, headers: Record<string, string> = { "x-api-key": KEY }) {
  return GET(
    new Request(`http://localhost:3000/api/pipeline/comments${query}`, { headers })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("PIPELINE_API_KEY", KEY)
  listPageComments.mockResolvedValue([{ id: "c1" }])
})

describe("GET /api/pipeline/comments", () => {
  it("fails closed when PIPELINE_API_KEY is not configured", async () => {
    vi.stubEnv("PIPELINE_API_KEY", "")
    const res = await get("?status=open")
    expect(res.status).toBe(500)
    expect(listPageComments).not.toHaveBeenCalled()
  })

  it("401 without the key or with the wrong key", async () => {
    expect((await get("?status=open", {})).status).toBe(401)
    expect((await get("?status=open", { "x-api-key": "nope" })).status).toBe(401)
    expect(listPageComments).not.toHaveBeenCalled()
  })

  it("accepts the key as ?apiKey= like import-lessons", async () => {
    const res = await get(`?apiKey=${KEY}`, {})
    expect(res.status).toBe(200)
  })

  it("filters by lesson, comma-separated statuses and site", async () => {
    const res = await get("?lesson=m1_l01&status=open,asked&site=preview")
    expect(res.status).toBe(200)
    expect(listPageComments).toHaveBeenCalledWith({
      lessonId: "m1_l01",
      statuses: ["open", "asked"],
      site: "preview",
    })
    expect(await res.json()).toEqual({ comments: [{ id: "c1" }] })
  })

  it("without filters lists everything", async () => {
    await get("")
    expect(listPageComments).toHaveBeenCalledWith({
      lessonId: undefined,
      statuses: undefined,
      site: undefined,
    })
  })

  it("returns action, shape and textEdit for the triage", async () => {
    const stored = {
      id: "c2",
      targetType: "text",
      comment: "",
      action: { category: "content", key: "correct", label: "This is wrong, correct it" },
      shape: { kind: "box", rel: { x: 0, y: 0.1, w: 1, h: 0.2 } },
      textEdit: { original: "the UK", replacement: "Britain" },
    }
    listPageComments.mockResolvedValue([stored])
    const res = await get("?status=open")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ comments: [stored] })
  })

  it("400 on an unknown status or site", async () => {
    expect((await get("?status=open,bogus")).status).toBe(400)
    expect((await get("?site=mars")).status).toBe(400)
    expect(listPageComments).not.toHaveBeenCalled()
  })
})
