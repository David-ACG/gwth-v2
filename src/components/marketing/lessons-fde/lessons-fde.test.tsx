import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { LessonsFde } from "./lessons-fde"
import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"

afterEach(cleanup)

/** All visible text of the rendered page, whitespace collapsed. */
function text(): string {
  return (document.body.textContent ?? "").replace(/\s+/g, " ")
}

/**
 * /lessons against the launch readiness review of 2026-10-20 (bead
 * gwth-launch-ajqs.2, both reviewers): wrong counts, waitlist buttons on
 * launch day, beta wording, and a picture of Bill Gates, Warren Buffett, Elon
 * Musk and Oprah Winfrey that read as an endorsement.
 */
describe("LessonsFde launch readiness", () => {
  it("sends both main buttons to the waitlist before sales open", () => {
    render(<LessonsFde selling={false} />)
    for (const id of ["lessons-primary-cta", "lessons-closing-cta"]) {
      const cta = screen.getByTestId(id)
      expect(cta).toHaveAttribute("href", "/waitlist")
      expect(cta).toHaveTextContent("Join the waitlist")
    }
  })

  it("sends both main buttons to the prices once sales are open", () => {
    render(<LessonsFde selling />)
    for (const id of ["lessons-primary-cta", "lessons-closing-cta"]) {
      const cta = screen.getByTestId(id)
      expect(cta).toHaveAttribute("href", "/pricing")
      expect(cta).toHaveTextContent("Join the course")
    }
    expect(text()).not.toMatch(/waitlist/i)
  })

  it("prints only counts read from config", () => {
    render(<LessonsFde />)
    const body = text()
    expect(body).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons`)
    for (const month of MONTH_CONFIGS) {
      expect(body).toContain(
        `Month ${month.month}, ${month.mandatoryLessons} core lessons`
      )
    }
    expect(body).not.toMatch(/\b(66|26) core\b/)
    expect(body).not.toMatch(/twenty core lessons/i)
  })

  it("says when each month opens, with no beta wording", () => {
    render(<LessonsFde />)
    const note = screen.getByTestId("months-availability").textContent ?? ""
    expect(note).toMatch(/Month 1 is open from 1 December 2026/)
    expect(note).toMatch(/Month 2 opens around 1 January 2027/)
    expect(note).toMatch(/Month 3 around 1 February 2027/)
    expect(note).toMatch(/paused/)
    expect(text()).not.toMatch(/\bbeta\b|invite-only|testers|intake/i)
  })

  it("has no celebrity picture or millionaire claims", () => {
    const { container } = render(<LessonsFde />)
    expect(container.querySelector('img[src*="five-hour-rule"]')).toBeNull()
    expect(text()).not.toMatch(
      /Bill Gates|Warren Buffett|Elon Musk|Oprah|millionaires|5-Hour Rule/i
    )
    // One plain sentence on why a lesson is about an hour stays.
    expect(text()).toMatch(/Each lesson takes about an hour/)
  })

  it("does not promise a step-by-step video in every lesson", () => {
    render(<LessonsFde />)
    expect(text()).not.toMatch(/video showing you exactly what to do/i)
    expect(text()).toMatch(/short film/i)
  })

  it("does not link to pages closed at launch", () => {
    const { container } = render(<LessonsFde />)
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    )
    for (const hidden of ["/for-teams", "/news", "/tech-radar", "/score"]) {
      expect(hrefs).not.toContain(hidden)
    }
  })

  it("uses plain month descriptions, without the old jargon", () => {
    render(<LessonsFde />)
    expect(text()).not.toMatch(
      /six primitives|main spine|strategic layer|actionable transformation roadmap/i
    )
  })
})
