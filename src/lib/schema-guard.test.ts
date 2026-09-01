/**
 * Boot-time schema-guard tests (N7, QA round-3 defect 4).
 *
 * The guard's whole value is that it is a CONTROL rather than a paragraph, so
 * what is pinned here is that it actually blocks the bad case, actually names
 * the migration to run, and cannot itself take a healthy deploy down.
 */
import { afterEach, describe, expect, it, vi } from "vitest"

import { assertSchemaMigrated } from "./schema-guard"

const ALL_PRESENT = new Set([
  "lesson_progress.graded_by",
  "lesson_progress.quiz_answers",
  "edition_lessons.updated_at",
  "edition_lessons.decided_at",
  "edition_lessons.decided_by",
  "edition_lessons.review_note",
])

const ORIGINAL_URL = process.env.DATABASE_URL

afterEach(() => {
  if (ORIGINAL_URL === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = ORIGINAL_URL
  vi.restoreAllMocks()
})

describe("assertSchemaMigrated", () => {
  it("passes when every selected column exists", async () => {
    process.env.DATABASE_URL = "postgresql://x/y"
    await expect(
      assertSchemaMigrated(async () => ALL_PRESENT)
    ).resolves.toBeUndefined()
  })

  it("refuses to boot when a column is missing, naming the migration", async () => {
    process.env.DATABASE_URL = "postgresql://x/y"
    const missing = new Set(ALL_PRESENT)
    missing.delete("edition_lessons.review_note")
    await expect(
      assertSchemaMigrated(async () => missing)
    ).rejects.toThrow(/019_edition_ratification\.sql/)
  })

  it("groups everything outstanding into one message", async () => {
    process.env.DATABASE_URL = "postgresql://x/y"
    await expect(assertSchemaMigrated(async () => new Set())).rejects.toThrow(
      /016_server_grading\.sql[\s\S]*019_edition_ratification\.sql/
    )
  })

  it("is a no-op in mock mode (no DATABASE_URL)", async () => {
    delete process.env.DATABASE_URL
    const query = vi.fn()
    await expect(assertSchemaMigrated(query)).resolves.toBeUndefined()
    expect(query).not.toHaveBeenCalled()
  })

  it("does NOT crash the server when the database is merely unreachable", async () => {
    // A transient connection failure at boot must not turn a healthy deploy
    // into a crash-loop; only a definitive "the columns are absent" answer is
    // fatal.
    process.env.DATABASE_URL = "postgresql://x/y"
    vi.spyOn(console, "warn").mockImplementation(() => {})
    await expect(
      assertSchemaMigrated(async () => {
        throw new Error("ECONNREFUSED")
      })
    ).resolves.toBeUndefined()
  })
})
