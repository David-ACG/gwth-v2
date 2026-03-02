/**
 * Shared utilities for demo lesson variant pages.
 * Extracts headings from markdown for Table of Contents.
 */

import type { TocHeading } from "@/components/lesson"

/**
 * Generates TOC headings from the lesson content markdown.
 * Extracts H2 and H3 headings and creates ids matching the
 * MarkdownRenderer heading id generation.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = markdown.split("\n")

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    const h3Match = line.match(/^### (.+)$/)

    if (h2Match) {
      const text = h2Match[1]!
      headings.push({
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
        text,
        level: 2,
      })
    } else if (h3Match) {
      const text = h3Match[1]!
      headings.push({
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
        text,
        level: 3,
      })
    }
  }

  return [
    { id: "intro", text: "Intro Video", level: 2 },
    { id: "objectives", text: "Objectives", level: 2 },
    ...headings,
    { id: "quiz", text: "Check Your Understanding", level: 2 },
    { id: "project", text: "Project", level: 2 },
  ]
}
