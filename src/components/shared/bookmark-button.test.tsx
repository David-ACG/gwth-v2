import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const toggleBookmarkAction = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}))

vi.mock("@/lib/actions/bookmarks", () => ({ toggleBookmarkAction }))
vi.mock("sonner", () => ({ toast }))

import { BookmarkButton } from "./bookmark-button"

describe("BookmarkButton", () => {
  beforeEach(() => {
    toggleBookmarkAction.mockReset()
    toast.success.mockReset()
    toast.info.mockReset()
    toast.error.mockReset()
  })
  afterEach(cleanup)

  it("keeps the optimistic saved state after the server confirms it", async () => {
    toggleBookmarkAction.mockResolvedValue(true)
    render(<BookmarkButton initialBookmarked={false} lessonId="lesson-1" />)

    await userEvent.click(screen.getByRole("button", { name: "Add bookmark" }))

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Remove bookmark" })
      ).toHaveAttribute("aria-pressed", "true")
    })
    expect(toggleBookmarkAction).toHaveBeenCalledWith({
      lessonId: "lesson-1",
    })
    expect(toast.success).toHaveBeenCalled()
  })

  it("rolls back the optimistic state and reports a failed save", async () => {
    toggleBookmarkAction.mockRejectedValue(new Error("database unavailable"))
    render(<BookmarkButton initialBookmarked={false} lessonId="lesson-1" />)

    await userEvent.click(screen.getByRole("button", { name: "Add bookmark" }))

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add bookmark" })
      ).toHaveAttribute("aria-pressed", "false")
    })
    expect(toast.error).toHaveBeenCalledWith("Bookmark not saved", {
      description: "Please try again.",
    })
  })
})
