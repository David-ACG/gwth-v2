import { describe, expect, it } from "vitest"
import {
  buildLessonOutline,
  splitMarkdownSections,
} from "./lesson-outline"

const WELCOME = `Intro paragraph before any heading.

## What GWTH stands for

Some prose.

> **AI suggests. Humans decide.**

### 4.1 Research

Nested heading stays in this page.

## The six AI superpowers

More prose.
`

const EFFICIENCY = `## Hook: the same week, two very different bills

Prose.

## Core concepts in plain English

Prose with a fence:

\`\`\`python
## not a heading - inside a fence
print("hi")
\`\`\`

## Recap

Done.
`

// Shape of a real pipeline `content/project.md` → `lessons.build_instructions`.
const PROJECT = `# Student Project - My AI Superpowers Wishlist

## What you are making

You are making a short personal document.

## Completion checklist

- It has between 5 and 10 entries.
`

describe("splitMarkdownSections (gwth-launch-qar)", () => {
  it("splits on `##` headings and keeps `###` inside the parent section", () => {
    const sections = splitMarkdownSections(WELCOME)
    const titles = sections.map((s) => s.title)
    expect(titles).toEqual([
      "",
      "What GWTH stands for",
      "The six AI superpowers",
    ])
    // The lead-in prose is its own untitled section.
    expect(sections[0]!.body).toContain("Intro paragraph")
    // The `### 4.1 Research` subheading stays inside its parent `##` page.
    expect(sections[1]!.body).toContain("### 4.1 Research")
  })

  it("does not treat a `##` inside a fenced code block as a heading", () => {
    const sections = splitMarkdownSections(EFFICIENCY)
    expect(sections.map((s) => s.title)).toEqual([
      "Hook: the same week, two very different bills",
      "Core concepts in plain English",
      "Recap",
    ])
    expect(sections[1]!.body).toContain("not a heading - inside a fence")
  })
})

describe("buildLessonOutline (gwth-launch-qar)", () => {
  it("derives one prose page per `##` section, with real titles", () => {
    const pages = buildLessonOutline({
      learnContent: WELCOME,
      hasIntroVideo: false,
      questionCount: 0,
    })
    expect(pages.map((p) => p.title)).toEqual([
      "Overview",
      "What GWTH stands for",
      "The six AI superpowers",
    ])
    // Each prose page carries only its own section's markdown.
    expect(pages[1]!.content).toContain("AI suggests. Humans decide.")
    expect(pages[1]!.content).not.toContain("The six AI superpowers")
  })

  it("bookends with a video page and a Q&A page when present", () => {
    const pages = buildLessonOutline({
      learnContent: EFFICIENCY,
      hasIntroVideo: true,
      questionCount: 5,
    })
    expect(pages[0]!.kind).toBe("video")
    expect(pages[pages.length - 1]!.kind).toBe("qa")
    expect(pages[pages.length - 1]!.kindLabel).toContain("5 QUESTIONS")
  })

  it("labels a section containing a code fence as CODE", () => {
    const pages = buildLessonOutline({
      learnContent: EFFICIENCY,
      hasIntroVideo: false,
      questionCount: 0,
    })
    const core = pages.find((p) => p.title === "Core concepts in plain English")
    expect(core?.kind).toBe("code")
    expect(core?.kindLabel).toContain("CODE")
  })

  it("produces DIFFERENT outlines for different lessons (no placebo)", () => {
    const welcome = buildLessonOutline({
      learnContent: WELCOME,
      hasIntroVideo: false,
      questionCount: 0,
    })
    const efficiency = buildLessonOutline({
      learnContent: EFFICIENCY,
      hasIntroVideo: false,
      questionCount: 0,
    })
    expect(welcome.map((p) => p.title)).not.toEqual(
      efficiency.map((p) => p.title)
    )
  })

  it("falls back to a single prose page for a body with no headings", () => {
    const pages = buildLessonOutline({
      learnContent: "Just a paragraph, no headings at all.",
      hasIntroVideo: false,
      questionCount: 0,
    })
    expect(pages).toHaveLength(1)
    expect(pages[0]!.kind).toBe("prose")
    expect(pages[0]!.content).toContain("Just a paragraph")
  })
})

describe("buildLessonOutline - student project page", () => {
  it("adds a project page after the prose and before the Q&A", () => {
    const pages = buildLessonOutline({
      learnContent: WELCOME,
      hasIntroVideo: true,
      questionCount: 3,
      buildInstructions: PROJECT,
    })
    const kinds = pages.map((p) => p.kind)
    expect(kinds[0]).toBe("video")
    expect(kinds[kinds.length - 1]).toBe("qa")
    expect(kinds[kinds.length - 2]).toBe("project")
    expect(kinds.filter((k) => k === "project")).toHaveLength(1)
  })

  it("titles the page from the project heading, minus the boilerplate prefix", () => {
    const [page] = buildLessonOutline({
      learnContent: "",
      hasIntroVideo: false,
      questionCount: 0,
      buildInstructions: PROJECT,
    })
    expect(page!.title).toBe("Your project: My AI Superpowers Wishlist")
    expect(page!.projectHeading).toBe("My AI Superpowers Wishlist")
    expect(page!.kindLabel).toMatch(/^PROJECT · \d+ MIN$/)
  })

  it("lifts the `#` heading out of the body so it is not rendered twice", () => {
    const [page] = buildLessonOutline({
      learnContent: "",
      hasIntroVideo: false,
      questionCount: 0,
      buildInstructions: PROJECT,
    })
    expect(page!.content).not.toContain("# Student Project")
    expect(page!.content!.startsWith("## What you are making")).toBe(true)
  })

  it("falls back to a generic title when the project has no `#` heading", () => {
    const [page] = buildLessonOutline({
      learnContent: "",
      hasIntroVideo: false,
      questionCount: 0,
      buildInstructions: "## Step one\n\nDo the thing.",
    })
    expect(page!.title).toBe("Your project")
    expect(page!.projectHeading).toBeUndefined()
    expect(page!.content).toContain("Do the thing.")
  })

  it("adds no project page when the lesson has no build instructions", () => {
    for (const buildInstructions of [undefined, null, "", "   \n  "]) {
      const pages = buildLessonOutline({
        learnContent: WELCOME,
        hasIntroVideo: false,
        questionCount: 0,
        buildInstructions,
      })
      expect(pages.some((p) => p.kind === "project")).toBe(false)
    }
  })
})
