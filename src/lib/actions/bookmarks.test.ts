import { beforeEach, describe, expect, it, vi } from "vitest"

const toggleBookmark = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())

vi.mock("@/lib/data/bookmarks", () => ({ toggleBookmark }))
vi.mock("next/cache", () => ({ revalidatePath }))

import { toggleBookmarkAction } from "./bookmarks"

describe("toggleBookmarkAction", () => {
  beforeEach(() => {
    toggleBookmark.mockReset()
    revalidatePath.mockReset()
  })

  it("returns the persisted state and refreshes the saved-items page", async () => {
    toggleBookmark.mockResolvedValue(true)

    await expect(
      toggleBookmarkAction({ lessonId: "lesson-1" })
    ).resolves.toBe(true)
    expect(toggleBookmark).toHaveBeenCalledWith({ lessonId: "lesson-1" })
    expect(revalidatePath).toHaveBeenCalledWith("/bookmarks")
  })

  it("does not revalidate when authentication or persistence fails", async () => {
    toggleBookmark.mockRejectedValue(new Error("Authentication required"))

    await expect(toggleBookmarkAction({ labId: "lab-1" })).rejects.toThrow(
      "Authentication required"
    )
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
