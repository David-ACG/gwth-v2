import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ProgressRing } from "./progress-ring"

describe("ProgressRing", () => {
  it("renders an SVG element", () => {
    const { container } = render(<ProgressRing value={0.5} />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders two circles (background + progress)", () => {
    const { container } = render(<ProgressRing value={0.5} />)
    const circles = container.querySelectorAll("circle")
    expect(circles).toHaveLength(2)
  })

  it("renders children inside the ring", () => {
    render(
      <ProgressRing value={0.75}>
        <span>75%</span>
      </ProgressRing>
    )
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("applies custom size", () => {
    const { container } = render(<ProgressRing value={0.5} size={100} />)
    const svg = container.querySelector("svg")
    expect(svg).toHaveAttribute("width", "100")
    expect(svg).toHaveAttribute("height", "100")
  })

  it("handles zero progress", () => {
    const { container } = render(<ProgressRing value={0} />)
    const progressCircle = container.querySelectorAll("circle")[1]
    // At 0%, the offset should equal the circumference
    expect(progressCircle).toBeInTheDocument()
  })

  it("handles full progress", () => {
    const { container } = render(<ProgressRing value={1} />)
    const progressCircle = container.querySelectorAll("circle")[1]
    // At 100%, the offset should be 0
    expect(progressCircle).toHaveAttribute("stroke-dashoffset", "0")
  })
})
