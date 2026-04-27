import { describe, it, expect } from "vitest"
import { render, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ScoreExplainer } from "./score-explainer"
import {
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
  TOTAL_COURSE_MONTHS,
} from "@/lib/config"

const HANDS_ON_TOTAL = TOTAL_MANDATORY_LESSONS + TOTAL_OPTIONAL_LESSONS

const openPanel = async (container: HTMLElement) => {
  const user = userEvent.setup()
  const trigger = container.querySelector(
    '[data-role="score-explainer-trigger"]'
  ) as HTMLButtonElement
  await user.click(trigger)
  return trigger
}

describe("ScoreExplainer — structure (when open)", () => {
  it("renders all 5 bullet keys", async () => {
    const { container } = render(<ScoreExplainer />)
    await openPanel(container as HTMLElement)
    const list = container.querySelector(
      '[data-role="score-explainer-bullets"]'
    ) as HTMLElement
    expect(list).not.toBeNull()
    const text = list.textContent ?? ""
    expect(text).toContain("Always current.")
    expect(text).toContain("Hands-on, not lectured.")
    expect(text).toContain("Tested, not assumed.")
    expect(text).toContain("Paced, not crammed.")
    expect(text).toContain("A high score is a recent score.")
  })

  it("renders the locked number 100 in bullets (Hands-on + recent)", async () => {
    const { container } = render(<ScoreExplainer />)
    await openPanel(container as HTMLElement)
    const list = container.querySelector(
      '[data-role="score-explainer-bullets"]'
    ) as HTMLElement
    const numSpans = Array.from(
      list.querySelectorAll<HTMLSpanElement>(
        "span.font-bold.tabular-nums.text-primary"
      )
    ).map((el) => el.textContent ?? "")
    const hundreds = numSpans.filter((t) => t === "100")
    expect(hundreds.length).toBeGreaterThanOrEqual(2)
  })

  it("renders the dynamic numbers from config.ts", async () => {
    const { container } = render(<ScoreExplainer />)
    await openPanel(container as HTMLElement)
    const list = container.querySelector(
      '[data-role="score-explainer-bullets"]'
    ) as HTMLElement
    const numSpans = Array.from(
      list.querySelectorAll<HTMLSpanElement>(
        "span.font-bold.tabular-nums.text-primary"
      )
    ).map((el) => el.textContent ?? "")
    expect(numSpans).toContain(String(HANDS_ON_TOTAL))
    expect(numSpans).toContain("3")
    expect(numSpans).toContain(`${TOTAL_COURSE_MONTHS} months`)
  })

  it("uses the Num helper styling (font-bold tabular-nums text-primary)", async () => {
    const { container } = render(<ScoreExplainer />)
    await openPanel(container as HTMLElement)
    const list = container.querySelector(
      '[data-role="score-explainer-bullets"]'
    ) as HTMLElement
    const numSpans = list.querySelectorAll(
      "span.font-bold.tabular-nums.text-primary"
    )
    expect(numSpans.length).toBeGreaterThan(0)
  })
})

describe("ScoreExplainer — trigger labelling", () => {
  it("renders the trigger label and credibility caption", () => {
    const { container } = render(<ScoreExplainer />)
    const trigger = container.querySelector(
      '[data-role="score-explainer-trigger"]'
    ) as HTMLElement
    expect(trigger).not.toBeNull()
    const within$ = within(trigger)
    expect(
      within$.getByText("What this score tells an employer")
    ).toBeInTheDocument()
    expect(within$.getByText(/5 reasons it/)).toBeInTheDocument()
  })
})

describe("ScoreExplainer — collapsible behaviour", () => {
  it("defaults to collapsed (data-state=closed and aria-expanded=false)", () => {
    const { container } = render(<ScoreExplainer />)
    const root = container.querySelector('[data-role="score-explainer"]')
    expect(root?.getAttribute("data-state")).toBe("closed")
    const trigger = container.querySelector(
      '[data-role="score-explainer-trigger"]'
    )
    expect(trigger?.getAttribute("aria-expanded")).toBe("false")
  })

  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup()
    const { container } = render(<ScoreExplainer />)
    const trigger = container.querySelector(
      '[data-role="score-explainer-trigger"]'
    ) as HTMLButtonElement
    await user.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    const root = container.querySelector('[data-role="score-explainer"]')
    expect(root?.getAttribute("data-state")).toBe("open")
  })

  it("opens on keyboard activation (Tab + Enter)", async () => {
    const user = userEvent.setup()
    const { container } = render(<ScoreExplainer />)
    await user.keyboard("{Tab}")
    const trigger = container.querySelector(
      '[data-role="score-explainer-trigger"]'
    ) as HTMLButtonElement
    expect(document.activeElement).toBe(trigger)
    await user.keyboard("{Enter}")
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
  })

  it("renders the bullets list in the document on open (5 items)", async () => {
    const user = userEvent.setup()
    const { container } = render(<ScoreExplainer />)
    const trigger = container.querySelector(
      '[data-role="score-explainer-trigger"]'
    ) as HTMLButtonElement
    await user.click(trigger)
    const list = container.querySelector('[data-role="score-explainer-bullets"]')
    expect(list).not.toBeNull()
    expect(list?.querySelectorAll("li").length).toBe(5)
  })
})
