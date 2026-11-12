import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { CourseHoldNotice } from "./course-hold-notice"

const gate = { month: 2 as const, done: 5, need: 20, total: 26, percent: 75 }

describe("CourseHoldNotice (bead gwth-launch-735c)", () => {
  afterEach(cleanup)

  it("tells a learner the 75% rule on the course page before it holds them", () => {
    render(<CourseHoldNotice onHoldFor={null} accessSource="prepaid" nextGate={gate} showAhead />)
    expect(screen.getByTestId("course-gate-notice").textContent).toBe(
      "Month 2 opens once you've finished 75% of the core lessons in Month 1: 20 of 26 lessons. You've finished 5 so far."
    )
  })

  it("stays quiet on the dashboard until the gate holds them", () => {
    const { container } = render(<CourseHoldNotice onHoldFor={null} accessSource="prepaid" nextGate={gate} />)
    expect(container.textContent).toBe("")
  })

  it("explains a gate hold, with the clock held for a pass and for a payer", () => {
    const { unmount } = render(<CourseHoldNotice onHoldFor={2} accessSource="prepaid" reason="progress" nextGate={gate} />)
    const pass = screen.getByTestId("course-hold-notice").textContent ?? ""
    expect(pass).toContain("Month 2 opens when you've finished 20 core lessons from Month 1")
    expect(pass).toContain("You've finished 5 of 26 so far.")
    expect(pass).toContain("paid course time is paused")
    unmount()
    render(<CourseHoldNotice onHoldFor={2} accessSource="stripe_course" reason="progress" nextGate={gate} />)
    expect(screen.getByTestId("course-hold-notice").textContent).toContain("We won't charge you for Month 2 until it opens.")
  })

  it("explains a review hold without accusing anyone, with a way to ask", () => {
    render(<CourseHoldNotice onHoldFor={2} accessSource="prepaid" reason="review" />)
    const notice = screen.getByTestId("course-hold-notice")
    expect(notice.dataset.reason).toBe("review")
    expect(notice.textContent).toContain("Month 2 opens after a quick check")
    expect(notice.textContent).toContain("usually done within a day")
    expect(screen.getByRole("link", { name: /contact us/i }).getAttribute("href")).toBe("/contact")
  })

  it("keeps the old wording when the month is simply not ready for anyone", () => {
    render(<CourseHoldNotice onHoldFor={2} accessSource="prepaid" reason="release" />)
    expect(screen.getByTestId("course-hold-notice").textContent).toContain("Month 2 isn't ready yet")
  })
})
