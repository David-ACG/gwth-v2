import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { EmptyState } from "./empty-state"

afterEach(cleanup)

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Start by creating something."
      />
    )
    expect(screen.getByText("Nothing here")).toBeInTheDocument()
    expect(screen.getByText("Start by creating something.")).toBeInTheDocument()
  })

  it("renders the default mono kicker when none is given", () => {
    render(<EmptyState title="Nothing here" description="Test" />)
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument()
  })

  it("renders a custom kicker", () => {
    render(
      <EmptyState kicker="No results" title="Nothing here" description="Test" />
    )
    expect(screen.getByText("No results")).toBeInTheDocument()
  })

  it("renders no illustration icon (FDE recipe)", () => {
    const { container } = render(
      <EmptyState title="Nothing here" description="Test" />
    )
    // The FDE recipe drops icons-in-circles; the mono kicker replaces them.
    expect(container.querySelector("svg")).not.toBeInTheDocument()
  })

  it("renders a single CTA button when action is provided", () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Test"
        action={{ label: "Go create", href: "/create" }}
      />
    )
    const link = screen.getByRole("link", { name: "Go create" })
    expect(link).toHaveAttribute("href", "/create")
  })

  it("does not render a CTA button when action is omitted", () => {
    render(
      <EmptyState title="No items" description="Nothing to show" />
    )
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
