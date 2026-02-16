import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { CourseCard } from "./course-card"
import type { Course } from "@/lib/types"

afterEach(cleanup)

const mockCourse: Course = {
  id: "c1",
  slug: "test-course",
  title: "Test Course Title",
  description: "A test course description for testing.",
  thumbnail: "/test.jpg",
  blurDataUrl: null,
  price: 0,
  category: "Testing",
  difficulty: "beginner",
  estimatedDuration: 120,
  sections: [
    {
      id: "s1",
      title: "Section 1",
      order: 1,
      lessons: [
        { id: "l1", slug: "l1", title: "Lesson 1", order: 1, duration: 30, status: "completed" },
        { id: "l2", slug: "l2", title: "Lesson 2", order: 2, duration: 30, status: "available" },
      ],
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("CourseCard", () => {
  it("renders course title and description", () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText("Test Course Title")).toBeInTheDocument()
    expect(screen.getByText("A test course description for testing.")).toBeInTheDocument()
  })

  it("renders difficulty and category badges", () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getAllByText("beginner")).toHaveLength(1)
    expect(screen.getByText("Testing")).toBeInTheDocument()
  })

  it("renders lesson count", () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText("2 lessons")).toBeInTheDocument()
  })

  it("renders duration", () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText("2h")).toBeInTheDocument()
  })

  it("shows progress bar when progress is provided", () => {
    render(<CourseCard course={mockCourse} progress={0.5} />)
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("does not show progress text when progress is omitted", () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.queryByText("Progress")).not.toBeInTheDocument()
  })

  it("links to the course detail page", () => {
    render(<CourseCard course={mockCourse} />)
    const links = screen.getAllByRole("link")
    expect(links[0]).toHaveAttribute("href", "/course/test-course")
  })
})
