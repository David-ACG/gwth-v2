/**
 * Tests for the /api/admin/import-lessons route.
 * Validates API key auth, request validation, and the Drizzle import flow
 * (D1 — self-hosted Postgres; Supabase removed).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

// ─── Drizzle mock ─────────────────────────────────────────────────────────
// A thenable insert builder: `await db.insert(t).values(v)` resolves, and the
// optional `.onConflictDoNothing()` / `.onConflictDoUpdate()` terminators also
// resolve — matching how the route writes each table.
function makeInsertBuilder() {
  return {
    values: vi.fn(() => {
      const result: Record<string, unknown> = {
        onConflictDoNothing: vi.fn(() => Promise.resolve([])),
        onConflictDoUpdate: vi.fn(() => Promise.resolve([])),
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve([]).then(resolve),
      }
      return result
    }),
  }
}

const txInsert = vi.fn(() => makeInsertBuilder())
const txDelete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) }))
// N5: the route checks for the gwth-default syllabus edition inside the
// transaction (tx.select().from().where().limit()). Default: the edition
// exists, so the edition_lessons sync upsert runs; tests can override
// txSelectRows to simulate a DB without migration 014.
let txSelectRows: Array<Record<string, unknown>> = [{ id: "gwth-default" }]
const txSelectLimit = vi.fn(() => Promise.resolve(txSelectRows))
const txSelect = vi.fn(() => ({
  from: vi.fn(() => ({
    where: vi.fn(() => ({ limit: txSelectLimit })),
  })),
}))
const transaction = vi.fn(
  async (cb: (tx: unknown) => Promise<unknown>) =>
    cb({ insert: txInsert, delete: txDelete, select: txSelect })
)

// GET path: db.select({...}).from(lessons) resolves to an array of rows.
const selectFrom = vi.fn(() => Promise.resolve([{ id: "m1_l01" }]))
const select = vi.fn(() => ({ from: selectFrom }))

vi.mock("@/db", () => ({
  getDb: () => ({ transaction, select }),
}))

import { POST, GET } from "./route"

/** Helper to build a valid lesson payload for testing. */
function makeLesson(overrides: Record<string, unknown> = {}) {
  return {
    id: "m1_l01",
    slug: "welcome-to-gwth",
    title: "Welcome to GWTH",
    description: "Your first lesson",
    order: 1,
    duration: 45,
    difficulty: "beginner",
    category: "Foundations",
    sectionId: "m1_w1",
    courseId: "course_gwth",
    courseSlug: "applied-ai-skills",
    month: 1,
    learnContent: "# Welcome\n\nThis is the lesson content.",
    questions: [
      {
        id: "m1_l01_q1",
        question: "What is GWTH?",
        options: ["A course", "A game", "A tool", "A language"],
        correctOptionIndex: 0,
        explanation: "GWTH is a course about applied AI skills.",
      },
    ],
    resources: [
      {
        title: "Official Docs",
        url: "https://gwth.ai/docs",
        type: "link",
      },
    ],
    status: "available",
    ...overrides,
  }
}

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/import-lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function createGetRequest(params?: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/admin/import-lessons")
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return new NextRequest(url.toString(), { method: "GET" })
}

describe("/api/admin/import-lessons", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      PIPELINE_API_KEY: "test-key-123",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // ─── Authentication ───────────────────────────────────────────────────────

  it("returns 500 when PIPELINE_API_KEY is not configured", async () => {
    delete process.env.PIPELINE_API_KEY

    const res = await POST(createPostRequest({ lessons: [makeLesson()], apiKey: "any" }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toContain("PIPELINE_API_KEY not configured")
  })

  it("returns 401 when API key is wrong", async () => {
    const res = await POST(createPostRequest({ lessons: [makeLesson()], apiKey: "wrong-key" }))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe("Invalid API key")
  })

  it("returns 401 when API key is missing", async () => {
    const res = await POST(createPostRequest({ lessons: [makeLesson()] }))
    expect(res.status).toBe(401)
  })

  it("returns 500 when DATABASE_URL is not configured", async () => {
    delete process.env.DATABASE_URL
    const res = await POST(
      createPostRequest({ lessons: [makeLesson()], apiKey: "test-key-123" })
    )
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toContain("DATABASE_URL not configured")
  })

  // ─── Request Validation ───────────────────────────────────────────────────

  it("returns 400 when lessons array is missing", async () => {
    const res = await POST(createPostRequest({ apiKey: "test-key-123" }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("non-empty 'lessons' array")
  })

  it("returns 400 when lessons array is empty", async () => {
    const res = await POST(createPostRequest({ lessons: [], apiKey: "test-key-123" }))
    expect(res.status).toBe(400)
  })

  // ─── Lesson Validation ────────────────────────────────────────────────────

  it("rejects a lesson missing required id", async () => {
    const res = await POST(
      createPostRequest({
        lessons: [makeLesson({ id: "" })],
        apiKey: "test-key-123",
      })
    )
    const data = await res.json()
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toContain("id")
  })

  it("rejects a lesson missing required slug", async () => {
    const res = await POST(
      createPostRequest({
        lessons: [makeLesson({ slug: "" })],
        apiKey: "test-key-123",
      })
    )
    const data = await res.json()
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toContain("slug")
  })

  it("rejects a lesson with invalid month", async () => {
    const res = await POST(
      createPostRequest({
        lessons: [makeLesson({ month: 5 })],
        apiKey: "test-key-123",
      })
    )
    const data = await res.json()
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toContain("month")
  })

  it("rejects a lesson with invalid difficulty", async () => {
    const res = await POST(
      createPostRequest({
        lessons: [makeLesson({ difficulty: "Expert" })],
        apiKey: "test-key-123",
      })
    )
    const data = await res.json()
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toContain("difficulty")
  })

  // ─── Successful Import ────────────────────────────────────────────────────

  it("imports a valid lesson successfully via Drizzle", async () => {
    const res = await POST(
      createPostRequest({
        lessons: [makeLesson()],
        apiKey: "test-key-123",
      })
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.total).toBe(1)
    expect(data.successful).toBe(1)
    expect(data.failed).toBe(0)
    expect(data.results[0].lessonId).toBe("m1_l01")
    expect(data.results[0].success).toBe(true)
    expect(data.results[0].questionsCount).toBe(1)
    expect(data.results[0].resourcesCount).toBe(1)
  })

  it("runs the import inside a transaction and writes the content tables", async () => {
    await POST(
      createPostRequest({
        lessons: [makeLesson()],
        apiKey: "test-key-123",
      })
    )

    expect(transaction).toHaveBeenCalledTimes(1)
    // course + section + lesson + quiz questions = 4 inserts
    expect(txInsert).toHaveBeenCalled()
    // quiz + resources are replaced via delete-then-insert
    expect(txDelete).toHaveBeenCalled()
    // N5: the gwth-default edition row is kept in sync on import
    // (course + section + lesson + edition_lessons + quiz + resources = 6)
    expect(txSelect).toHaveBeenCalled()
    expect(txInsert).toHaveBeenCalledTimes(6)
  })

  it("still imports cleanly when the gwth-default edition does not exist (N5 guard)", async () => {
    txSelectRows = []
    try {
      const res = await POST(
        createPostRequest({
          lessons: [makeLesson()],
          apiKey: "test-key-123",
        })
      )
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.successful).toBe(1)
      // course + section + lesson + quiz + resources — no edition_lessons upsert
      expect(txInsert).toHaveBeenCalledTimes(5)
    } finally {
      txSelectRows = [{ id: "gwth-default" }]
    }
  })

  it("drops resources with an unsupported type", async () => {
    const res = await POST(
      createPostRequest({
        lessons: [
          makeLesson({
            resources: [
              { title: "ok", url: "https://x", type: "link" },
              { title: "bad", url: "https://y", type: "bogus" },
            ],
          }),
        ],
        apiKey: "test-key-123",
      })
    )
    const data = await res.json()
    expect(data.results[0].resourcesCount).toBe(1)
  })

  it("handles multiple lessons with mixed results", async () => {
    const goodLesson = makeLesson()
    const badLesson = makeLesson({ id: "", slug: "bad" })

    const res = await POST(
      createPostRequest({
        lessons: [goodLesson, badLesson],
        apiKey: "test-key-123",
      })
    )

    const data = await res.json()
    expect(data.total).toBe(2)
    expect(data.successful).toBe(1)
    expect(data.failed).toBe(1)
  })

  it("returns 422 when all imports fail", async () => {
    const bad1 = makeLesson({ id: "" })
    const bad2 = makeLesson({ id: "", slug: "bad-2" })

    const res = await POST(
      createPostRequest({
        lessons: [bad1, bad2],
        apiKey: "test-key-123",
      })
    )

    expect(res.status).toBe(422)
  })

  it("reports a failed lesson when the transaction throws", async () => {
    transaction.mockRejectedValueOnce(new Error("db down"))
    const res = await POST(
      createPostRequest({
        lessons: [makeLesson()],
        apiKey: "test-key-123",
      })
    )
    const data = await res.json()
    expect(data.failed).toBe(1)
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toContain("db down")
  })

  // ─── GET Endpoint ─────────────────────────────────────────────────────────

  it("GET returns 401 without API key", async () => {
    const res = await GET(createGetRequest())
    expect(res.status).toBe(401)
  })

  it("GET returns 401 with wrong API key", async () => {
    const res = await GET(createGetRequest({ apiKey: "wrong" }))
    expect(res.status).toBe(401)
  })

  it("GET returns lesson count with valid API key", async () => {
    const res = await GET(createGetRequest({ apiKey: "test-key-123" }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.lessonCount).toBe(1)
  })
})
