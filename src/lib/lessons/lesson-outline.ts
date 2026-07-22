/**
 * Derives a lesson's reading outline (the multi-page flow shown in the lesson
 * viewer's outline rail + pagination) from the lesson's REAL markdown body,
 * rather than a hardcoded placeholder.
 *
 * Before this module the viewer used a fixed seven-item outline for every
 * lesson ("Picking the right problem / The brief / Calling Claude from a
 * script / ..."), identical on the no-code welcome lesson and the ai-efficiency
 * lesson alike, and CONTINUE only advanced a page counter while the whole body
 * sat on one page (bug gwth-launch-qar). Here the body is split into one page
 * per top-level (`##`) heading, so the outline reflects the actual lesson and
 * CONTINUE moves the reader through real sections.
 */

/** Kind tag attached to each lesson page in the outline rail. */
export type LessonPageKind = "video" | "prose" | "code" | "qa"

/** A single page in the multi-page lesson reading flow. */
export interface LessonOutlinePage {
  /** Page heading shown in the outline rail (derived from the `##` heading). */
  title: string
  /** Outline-rail tag, e.g. `"PROSE · 4 MIN"` / `"CODE · 2 MIN"`. */
  kindLabel: string
  /** Page kind, drives body rendering (video/qa switch surface). */
  kind: LessonPageKind
  /**
   * Markdown for this page's body (prose/code pages only). The viewer renders
   * this slice so pagination advances the actual content. Absent for
   * video/qa pages, whose bodies are driven by other lesson fields.
   */
  content?: string
}

/** Inputs needed to build the outline for one lesson. */
export interface BuildLessonOutlineInput {
  /** The lesson's real markdown body (`learn_content`); may be empty/null. */
  learnContent?: string | null
  /** Whether the lesson opens with an intro video page. */
  hasIntroVideo: boolean
  /** Number of end-of-lesson Q&A questions (0 = no Q&A page). */
  questionCount: number
  /** Optional rail label for the intro-video page. */
  videoKindLabel?: string
}

/** A markdown body section: its heading text and the markdown beneath it. */
interface MarkdownSection {
  /** Heading text (without the leading `## `); empty for lead-in prose. */
  title: string
  /** The markdown body under this heading (heading line excluded). */
  body: string
}

/** Words-per-minute used to estimate a section's reading time. */
const READING_WPM = 190

/**
 * Splits a markdown document into sections at each top-level (`##`) heading.
 * `###` and deeper headings stay inside their parent section. Fenced code
 * blocks are skipped so a `##` comment inside a ``` fence never starts a page.
 * Any lead-in prose before the first `##` becomes its own untitled section.
 */
export function splitMarkdownSections(md: string): MarkdownSection[] {
  const lines = md.split("\n")
  const sections: { title: string; body: string[] }[] = []
  let current: { title: string; body: string[] } | null = null
  let inFence = false

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    // Exactly a level-2 heading: `##` followed by whitespace (so `###` - which
    // has `#` in the third position - does not match).
    const h2 = inFence ? null : /^##\s+(.+?)\s*$/.exec(line)
    if (h2) {
      if (current) sections.push(current)
      current = { title: h2[1]!.trim(), body: [] }
    } else {
      if (!current) current = { title: "", body: [] }
      current.body.push(line)
    }
  }
  if (current) sections.push(current)

  return sections
    .map((s) => ({ title: s.title, body: s.body.join("\n").trim() }))
    // Drop a fully empty lead-in section (a body that begins directly with a
    // heading), but keep titled sections even when their body is short.
    .filter((s) => s.title !== "" || s.body !== "")
}

/** Estimates reading time in whole minutes (>= 1) from a section's word count. */
function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / READING_WPM))
}

/** True when a section body contains a fenced code block. */
function hasCodeFence(body: string): boolean {
  return /(^|\n)\s*(```|~~~)/.test(body)
}

/** Title used for lead-in prose that precedes the first `##` heading. */
const LEAD_IN_TITLE = "Overview"

/**
 * Builds the ordered page list for a lesson: an optional intro-video page, one
 * prose/code page per `##` section of the real body, and an optional
 * end-of-lesson Q&A page. Falls back to a single prose page when the lesson has
 * no headed body, so a body with no `##` headings still renders and paginates
 * sanely.
 */
export function buildLessonOutline({
  learnContent,
  hasIntroVideo,
  questionCount,
  videoKindLabel = "VIDEO · 4 MIN",
}: BuildLessonOutlineInput): LessonOutlinePage[] {
  const pages: LessonOutlinePage[] = []

  if (hasIntroVideo) {
    pages.push({
      title: "Why this lesson exists",
      kindLabel: videoKindLabel,
      kind: "video",
    })
  }

  const body = (learnContent ?? "").trim()
  if (body) {
    const sections = splitMarkdownSections(body)
    if (sections.length === 0) {
      // Non-empty body with no detectable sections - one prose page.
      pages.push({
        title: "Lesson",
        kindLabel: `PROSE · ${readingMinutes(body)} MIN`,
        kind: "prose",
        content: body,
      })
    } else {
      for (const section of sections) {
        const isCode = hasCodeFence(section.body)
        pages.push({
          title: section.title || LEAD_IN_TITLE,
          kindLabel: `${isCode ? "CODE" : "PROSE"} · ${readingMinutes(section.body)} MIN`,
          kind: isCode ? "code" : "prose",
          content: section.body,
        })
      }
    }
  }

  if (questionCount > 0) {
    pages.push({
      title: "End-of-lesson Q&A",
      kindLabel: `Q&A · ${questionCount} QUESTION${questionCount === 1 ? "" : "S"}`,
      kind: "qa",
    })
  }

  return pages
}
