/**
 * W26: the course breadcrumb was offering a link to /course, which has no page
 * and 404s — a dead link one click away from the lesson David demos. Segments
 * that only namespace a route now render as plain crumbs.
 */
import { describe, it, expect, vi } from "vitest"
import { render, within } from "@testing-library/react"
import { BreadcrumbNav } from "./breadcrumb-nav"

const pathname = vi.hoisted(() => ({ value: "/" }))
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
}))

/** Renders at a path and scopes queries to that render, not the whole document. */
function renderAt(path: string) {
  pathname.value = path
  const { container } = render(<BreadcrumbNav />)
  return Object.assign(within(container), { container })
}

describe("BreadcrumbNav", () => {
  it("does not link the namespacing 'course' segment", () => {
    const view = renderAt("/course/applied-ai-skills")
    expect(view.getByText("Course").closest("a")).toBeNull()
    expect(view.queryByRole("link", { name: "Course" })).toBeNull()
  })

  it("does not link the namespacing 'lesson' segment either", () => {
    const view = renderAt("/course/applied-ai-skills/lesson/welcome-to-gwth")
    expect(view.getByText("Lesson").closest("a")).toBeNull()
    expect(view.getByText("Course").closest("a")).toBeNull()
  })

  it("still links the segments that do have a page", () => {
    const view = renderAt("/course/applied-ai-skills/lesson/welcome-to-gwth")
    const slug = view.getByText("Applied Ai Skills").closest("a")
    expect(slug).not.toBeNull()
    expect(slug!.getAttribute("href")).toBe("/course/applied-ai-skills")
  })

  it("renders the deepest segment as the current page, never a link", () => {
    const view = renderAt("/labs/job-advert-claude-vs-chatgpt")
    expect(view.getByText("Job Advert Claude Vs Chatgpt").closest("a")).toBeNull()
    expect(view.getByText("Labs").closest("a")?.getAttribute("href")).toBe("/labs")
  })

  it("marks only the deepest crumb as the current page", () => {
    const view = renderAt("/course/applied-ai-skills/lesson/welcome-to-gwth")
    const current = view.container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.textContent).toBe("Welcome To Gwth")
  })
})
