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
export type LessonPageKind = "video" | "prose" | "code" | "qa" | "project"

/** A single page in the multi-page lesson reading flow. */
export interface LessonOutlinePage {
  /** Page heading shown in the outline rail (derived from the `##` heading). */
  title: string
  /** Outline-rail tag, e.g. `"PROSE · 4 MIN"` / `"CODE · 2 MIN"`. */
  kindLabel: string
  /** Page kind, drives body rendering (video/qa switch surface). */
  kind: LessonPageKind
  /**
   * Markdown for this page's body (prose/code/project pages only). The viewer
   * renders this slice so pagination advances the actual content. Absent for
   * video/qa pages, whose bodies are driven by other lesson fields.
   */
  content?: string
  /**
   * Display heading for a project page: the artefact the student makes, taken
   * from the project markdown's `#` heading with its "Student Project - "
   * prefix removed (e.g. `"My AI Superpowers Wishlist"`). Project pages only.
   */
  projectHeading?: string
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
  /**
   * The lesson's student-project markdown (`build_instructions`, sourced from
   * the pipeline's `content/project.md`); may be empty/null. When present it
   * becomes its own page just before the Q&A — every GWTH lesson ships a
   * project, and before this the column was imported but never rendered, so
   * the body's "the Build section below" pointed at nothing.
   */
  buildInstructions?: string | null
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

/** Rail title for a project page whose markdown has no usable `#` heading. */
const PROJECT_FALLBACK_TITLE = "Your project"

/**
 * Filing boilerplate the lesson authors put in front of the artefact name in a
 * project markdown's `#` heading. Month 1 alone ships six conventions —
 * "Student Project - X", "Student Project — X", "Project: X", "M1 L14 —
 * Student Project: X", "M1L22 — Student Project: X", "Student Project — M1
 * L23: X" — so the pieces are stripped repeatedly and in any order rather than
 * matched as one fixed prefix.
 */
const PROJECT_HEADING_NOISE = [
  /^m\s*\d+\s*l\s*\d+/i, // lesson code: "M1 L14", "M1L22"
  /^(?:student\s+)?project/i, // "Student Project", "Project"
]

/** A dash or colon joining heading boilerplate to the artefact name. */
const HEADING_SEPARATOR = /^[-–—:]\s*/

/** Markdown emphasis/code wrappers around a heading, e.g. `*My AI Map*`. */
const HEADING_WRAPPERS: ReadonlyArray<readonly [string, string]> = [
  ["**", "**"],
  ["*", "*"],
  ["_", "_"],
  ["`", "`"],
]

/** Removes markdown emphasis/code marks wrapping a whole heading. */
function unwrapEmphasis(heading: string): string {
  let out = heading.trim()
  for (;;) {
    const before = out
    for (const [open, close] of HEADING_WRAPPERS) {
      if (
        out.length > open.length + close.length &&
        out.startsWith(open) &&
        out.endsWith(close)
      ) {
        out = out.slice(open.length, out.length - close.length).trim()
      }
    }
    if (out === before) return out
  }
}

/**
 * Reduces a project markdown's `#` heading to just the artefact name:
 * `"M1 L14 — Student Project: \`CV Or LinkedIn Upgrade Pack\`"` becomes
 * `"CV Or LinkedIn Upgrade Pack"`. Returns "" when nothing is left.
 */
export function projectArtefactName(heading: string): string {
  let out = heading.trim()
  for (;;) {
    const before = out
    for (const noise of PROJECT_HEADING_NOISE) {
      const match = noise.exec(out)
      if (match) out = out.slice(match[0].length).trimStart()
    }
    out = out.replace(HEADING_SEPARATOR, "").trimStart()
    if (out === before) break
  }
  return unwrapEmphasis(out)
}

/**
 * Splits a leading `# Heading` off a markdown document. Returns the heading
 * text (null when the document does not start with one) and the remaining
 * body. The heading is lifted out because the viewer renders it as the page's
 * own title, so leaving it in the body would print it twice.
 */
export function splitLeadingH1(md: string): {
  heading: string | null
  body: string
} {
  const lines = md.trimStart().split("\n")
  const h1 = /^#\s+(.+?)\s*$/.exec(lines[0] ?? "")
  if (!h1) return { heading: null, body: md.trim() }
  return { heading: h1[1]!.trim(), body: lines.slice(1).join("\n").trim() }
}

/** Rail title for a project page, e.g. `"Your project: My AI Wishlist"`. */
function projectPageTitle(heading: string | null): string {
  return heading ? `Your project: ${heading}` : PROJECT_FALLBACK_TITLE
}

/**
 * Builds the ordered page list for a lesson: an optional intro-video page, one
 * prose/code page per `##` section of the real body, an optional student-project
 * page, and an optional end-of-lesson Q&A page. Falls back to a single prose
 * page when the lesson has no headed body, so a body with no `##` headings
 * still renders and paginates sanely.
 */
export function buildLessonOutline({
  learnContent,
  hasIntroVideo,
  questionCount,
  videoKindLabel = "VIDEO · 4 MIN",
  buildInstructions,
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

  // The project sits after the reading and before the Q&A: it is the thing the
  // lesson has been building towards, and the Q&A closes the lesson out.
  const project = (buildInstructions ?? "").trim()
  if (project) {
    const { heading, body } = splitLeadingH1(project)
    const artefact = heading ? projectArtefactName(heading) : ""
    pages.push({
      title: projectPageTitle(artefact || null),
      kindLabel: `PROJECT · ${readingMinutes(body)} MIN`,
      kind: "project",
      content: body,
      ...(artefact ? { projectHeading: artefact } : {}),
    })
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
