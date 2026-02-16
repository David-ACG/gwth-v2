import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { EmptyState } from "./empty-state"
import { BookOpen } from "lucide-react"

afterEach(cleanup)

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={BookOpen}
        title="Nothing here"
        description="Start by creating something."
      />
    )
    expect(screen.getByText("Nothing here")).toBeInTheDocument()
    expect(screen.getByText("Start by creating something.")).toBeInTheDocument()
  })

  it("renders an icon", () => {
    const { container } = render(
      <EmptyState
        icon={BookOpen}
        title="Nothing here"
        description="Test"
      />
    )
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders a CTA button when action is provided", () => {
    render(
      <EmptyState
        icon={BookOpen}
        title="Nothing here"
        description="Test"
        action={{ label: "Go Create", href: "/create" }}
      />
    )
    const link = screen.getByRole("link", { name: "Go Create" })
    expect(link).toHaveAttribute("href", "/create")
  })

  it("does not render a CTA button when action is omitted", () => {
    render(
      <EmptyState
        icon={BookOpen}
        title="No items"
        description="Nothing to show"
      />
    )
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
