import { beforeEach, describe, expect, it, vi } from "vitest"
import type { BookmarkTarget } from "@/lib/types"

const fixtureBookmarks = vi.hoisted(() => [] as Array<{
  id: string
  userId: string
  lessonId: string | null
  labId: string | null
  createdAt: Date
}>)
const mode = vi.hoisted(() => vi.fn())
const getDb = vi.hoisted(() => vi.fn())

vi.mock("./mock-data", () => ({ mockBookmarks: fixtureBookmarks }))
vi.mock("./mode", () => ({ resolveDataMode: mode }))
vi.mock("@/db", () => ({ getDb }))

import { getBookmarks, isBookmarked, toggleBookmark } from "./bookmarks"

describe("bookmark data access", () => {
  beforeEach(() => {
    fixtureBookmarks.splice(0)
    mode.mockReset()
    getDb.mockReset()
  })

  it("keeps the existing mock-mode lesson and lab toggle behaviour", async () => {
    mode.mockResolvedValue({ kind: "mock" })

    await expect(toggleBookmark({ lessonId: "lesson-1" })).resolves.toBe(true)
    await expect(isBookmarked({ lessonId: "lesson-1" })).resolves.toBe(true)
    await expect(isBookmarked({ labId: "lab-1" })).resolves.toBe(false)
    await expect(toggleBookmark({ lessonId: "lesson-1" })).resolves.toBe(false)
  })

  it("returns no rows and refuses writes without an authenticated data mode", async () => {
    mode.mockResolvedValue({ kind: "anonymous" })

    await expect(getBookmarks()).resolves.toEqual([])
    await expect(isBookmarked({ lessonId: "lesson-1" })).resolves.toBe(false)
    await expect(toggleBookmark({ lessonId: "lesson-1" })).rejects.toThrow(
      "Authentication required"
    )
    expect(getDb).not.toHaveBeenCalled()
  })

  it("rejects ambiguous targets before touching persistence", async () => {
    const invalid = {
      lessonId: "lesson-1",
      labId: "lab-1",
    } as unknown as BookmarkTarget
    await expect(toggleBookmark(invalid)).rejects.toThrow("exactly one")
    expect(mode).not.toHaveBeenCalled()
  })

  it("writes only the user id resolved from the authenticated mode", async () => {
    mode.mockResolvedValue({ kind: "user", userId: "validated-user" })
    const values = vi.fn(() => ({
      onConflictDoNothing: () => ({
        returning: async () => [{ id: "bookmark-1" }],
      }),
    }))
    getDb.mockReturnValue({
      delete: () => ({
        where: () => ({ returning: async () => [] }),
      }),
      insert: () => ({ values }),
    })

    await expect(toggleBookmark({ lessonId: "lesson-1" })).resolves.toBe(true)
    expect(values).toHaveBeenCalledWith({
      userId: "validated-user",
      lessonId: "lesson-1",
      labId: null,
    })
  })
})
