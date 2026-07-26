import { describe, expect, it } from "vitest"
import {
  buildLessonOutline,
  projectArtefactName,
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

  /**
   * Real M1 L05 headings. The rail renders plain text, so `*` and backticks in
   * a `##` heading were printed literally: "Your project: *My AI Toolkit Map*".
   */
  it("strips markdown emphasis out of section titles", () => {
    const pages = buildLessonOutline({
      learnContent:
        "## Your project: *My AI Toolkit Map*\n\nBody.\n\n" +
        "## A short, honest aside about what we have *not* taught\n\nBody.\n\n" +
        "## Run `npm run build` first\n\nBody.\n",
      hasIntroVideo: false,
      questionCount: 0,
    })
    expect(pages.map((p) => p.title)).toEqual([
      "Your project: My AI Toolkit Map",
      "A short, honest aside about what we have not taught",
      "Run npm run build first",
    ])
  })

  it("leaves snake_case alone (underscores are not emphasis here)", () => {
    const [page] = buildLessonOutline({
      learnContent: "## Save it as m1l01_my_ai_superpowers_wishlist\n\nBody.\n",
      hasIntroVideo: false,
      questionCount: 0,
    })
    expect(page!.title).toBe("Save it as m1l01_my_ai_superpowers_wishlist")
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

  /**
   * The real `#` headings of all 26 published Month-1 projects, read out of the
   * production `lessons.build_instructions` column on 2026-07-26. Six different
   * filing conventions, several with em dashes and one wrapped in emphasis —
   * the rail must show the artefact name and nothing else in every case.
   */
  it.each([
    ["# Student Project - My AI Superpowers Wishlist", "My AI Superpowers Wishlist"],
    ["# Student Project — My AI Colleague Agreement", "My AI Colleague Agreement"],
    [
      "# Student Project — My AI User Manual and Prompt Cheat Sheet",
      "My AI User Manual and Prompt Cheat Sheet",
    ],
    ["# Student Project — My AI Tooling Landscape Map", "My AI Tooling Landscape Map"],
    ["# Student Project — *My AI Toolkit Map*", "My AI Toolkit Map"],
    ["# Project — Your One-Page Sourced Comparison", "Your One-Page Sourced Comparison"],
    ["# Project: Safe First Automation", "Safe First Automation"],
    ["# Project — Agent Audit", "Agent Audit"],
    [
      "# M1 L14 — Student Project: `CV Or LinkedIn Upgrade Pack`",
      "CV Or LinkedIn Upgrade Pack",
    ],
    ["# M1 L16 - Student Project: Make It Visible", "Make It Visible"],
    ["# M1L22 — Student Project: Your First FamilyBot Transcript", "Your First FamilyBot Transcript"],
    ["# Student Project — M1 L23: Your Weekly Household Brief", "Your Weekly Household Brief"],
    ["# Student Project — The Month 1 Review Sheet", "The Month 1 Review Sheet"],
  ])("names the artefact cleanly for %s", (h1, artefact) => {
    const [page] = buildLessonOutline({
      learnContent: "",
      hasIntroVideo: false,
      questionCount: 0,
      buildInstructions: `${h1}\n\n## Step\n\nDo it.`,
    })
    expect(page!.projectHeading).toBe(artefact)
    expect(page!.title).toBe(`Your project: ${artefact}`)
    // David's standing rule: no em or en dashes in anything a student reads.
    expect(page!.title).not.toMatch(/[—–]/)
  })

  it("falls back to the generic title when a heading is only boilerplate", () => {
    expect(projectArtefactName("M1 L14 — Student Project")).toBe("")
    const [page] = buildLessonOutline({
      learnContent: "",
      hasIntroVideo: false,
      questionCount: 0,
      buildInstructions: "# Student Project\n\nDo it.",
    })
    expect(page!.title).toBe("Your project")
    expect(page!.projectHeading).toBeUndefined()
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
