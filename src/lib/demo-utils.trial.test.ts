import { describe, expect, it } from "vitest"
import { extractHeadings } from "./demo-utils"

describe("extractHeadings", () => {
  it("wraps parsed headings with the fixed intro/objectives/quiz/project scaffold", () => {
    const result = extractHeadings("## Overview\n\nSome body text.")
    expect(result).toEqual([
      { id: "intro", text: "Intro Video", level: 2 },
      { id: "objectives", text: "Objectives", level: 2 },
      { id: "overview", text: "Overview", level: 2 },
      { id: "quiz", text: "Check Your Understanding", level: 2 },
      { id: "project", text: "Project", level: 2 },
    ])
  })

  it("returns only the scaffold when there are no H2/H3 headings", () => {
    const result = extractHeadings("Just a paragraph.\n# Title is H1, ignored")
    expect(result.map((h) => h.id)).toEqual([
      "intro",
      "objectives",
      "quiz",
      "project",
    ])
  })

  it("captures both H2 (level 2) and H3 (level 3) headings in order", () => {
    const result = extractHeadings("## Parent\n### Child")
    const parsed = result.filter(
      (h) => !["intro", "objectives", "quiz", "project"].includes(h.id)
    )
    expect(parsed).toEqual([
      { id: "parent", text: "Parent", level: 2 },
      { id: "child", text: "Child", level: 3 },
    ])
  })

  it("slugifies ids: lowercases, strips punctuation, and collapses spaces to single hyphens", () => {
    const result = extractHeadings("## Getting  Started: The Basics!")
    const heading = result.find((h) => h.text === "Getting  Started: The Basics!")
    expect(heading?.id).toBe("getting-started-the-basics")
  })
})
