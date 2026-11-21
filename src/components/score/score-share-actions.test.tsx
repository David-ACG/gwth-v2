import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react"
import { linkedInAddUrl } from "@/lib/score/share"

const action = vi.hoisted(() => vi.fn())
vi.mock("@/lib/actions/score-share", () => ({ setScorePublicAction: action }))

import { ScoreShareActions } from "./score-share-actions"

const view = {
  code: "abcde23456",
  isPublic: true,
  pageUrl: "https://gwth.ai/verify/abcde23456",
  linkedInUrl: linkedInAddUrl("abcde23456", new Date("2026-12-14T00:00:00Z"), "https://gwth.ai"),
}

describe("ScoreShareActions (bead gwth-launch-phjb)", () => {
  afterEach(cleanup)

  it("asks a learner who has not shared to make the page public first", async () => {
    action.mockResolvedValueOnce(view)
    render(<ScoreShareActions initial={null} />)
    expect(screen.queryByTestId("add-to-linkedin")).toBeNull()
    fireEvent.click(screen.getByTestId("make-score-public"))
    await waitFor(() => expect(screen.getByTestId("add-to-linkedin")).toBeTruthy())
    expect(action).toHaveBeenCalledWith(true)
  })

  it("sends Add to LinkedIn to LinkedIn's pre-filled form in a new tab", () => {
    render(<ScoreShareActions initial={view} />)
    const link = screen.getByTestId("add-to-linkedin") as HTMLAnchorElement
    expect(link.href).toContain("https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME")
    expect(link.href).toContain(encodeURIComponent("https://gwth.ai/verify/abcde23456"))
    expect(link.target).toBe("_blank")
    expect(link.rel).toContain("noopener")
  })

  it("copies the score page link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ScoreShareActions initial={view} />)
    fireEvent.click(screen.getByTestId("copy-score-link"))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://gwth.ai/verify/abcde23456"))
  })
})
