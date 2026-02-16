import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatusBadge } from "./status-badge"

describe("StatusBadge", () => {
  it("renders 'Completed' text for completed status", () => {
    render(<StatusBadge status="completed" />)
    expect(screen.getByText("Completed")).toBeInTheDocument()
  })

  it("renders 'In Progress' text for in-progress status", () => {
    render(<StatusBadge status="in-progress" />)
    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("renders 'Available' text for available status", () => {
    render(<StatusBadge status="available" />)
    expect(screen.getByText("Available")).toBeInTheDocument()
  })

  it("renders 'Locked' text for locked status", () => {
    render(<StatusBadge status="locked" />)
    expect(screen.getByText("Locked")).toBeInTheDocument()
  })

  it("renders an icon alongside text (not just color)", () => {
    const { container } = render(<StatusBadge status="completed" />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })
})
