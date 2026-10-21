import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

// The switched-on state of the Teams card (David, 2026-10-21, option B with
// his edits: "a dashboard where a manager sees who has finished each lesson
// and their quiz marks. We'll also be marking the big projects that they do
// each month. So we should say that as well.").
vi.mock("@/lib/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/config")>()),
  ENABLE_TEAM_DASHBOARD: true,
}))

const { default: PricingPage } = await import("./page")

describe("Pricing with the team dashboard switched on", () => {
  it("promises the manager dashboard with lessons, quiz marks and project marks", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Same learner experience\. More visibility for managers\./i,
      })
    ).toBeInTheDocument()
    const body = screen.getByTestId("teams-split-body").textContent ?? ""
    expect(body).toMatch(/manager dashboard/i)
    expect(body).toMatch(/finished each lesson/i)
    expect(body).toMatch(/quiz marks/i)
    expect(body).toMatch(/project they build each month/i)
    expect(body).not.toMatch(/screen/i)
    expect(screen.getAllByText("Manager dashboard").length).toBeGreaterThan(0)
  })
})
