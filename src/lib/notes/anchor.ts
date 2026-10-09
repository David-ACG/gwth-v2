/**
 * Finding a learner's pinned note again (bead gwth-launch-fag3).
 *
 * A paragraph or words note stores the text it was pinned to plus where it
 * was (see `NoteAnchor`). Lessons are rewritten often, so the anchor is
 * resolved every time the part is shown, falling back in the order David
 * set on 2026-10-09: the exact words, then the part (section) they were in,
 * then the lesson as a whole. A note is never lost and never left as a
 * dangling highlight.
 *
 * Pure: no DOM, no server imports. The browser passes the text of each
 * block on screen; the server passes plain text derived from Markdown.
 */
import type { LessonNote, NoteAnchor } from "@/lib/types"

/** Characters of context kept either side of a quote. */
export const ANCHOR_CONTEXT = 40

/** Longest quote stored; a longer paragraph is pinned by its opening. */
export const MAX_QUOTE = 4000

/** Longest sentence kept for display beside a note. */
const MAX_SENTENCE = 320

/** Where a note resolved to on the current text of its lesson. */
export type NotePlacement =
  /** Its words (or paragraph) were found: pin it there. */
  | { status: "exact"; block: number; start: number; end: number }
  /** Its part exists but the words do not: show it with the part. */
  | { status: "section" }
  /** Its part is gone: show it with the lesson as a whole. */
  | { status: "lesson" }

/**
 * The sentence around `start..end` in `text`, for showing a note with its
 * context ("desktop highlight notes appear with their sentence quoted").
 */
export function sentenceAround(text: string, start: number, end: number): string {
  const before = text.slice(0, start)
  const boundary = Math.max(
    before.lastIndexOf(". "),
    before.lastIndexOf("? "),
    before.lastIndexOf("! "),
    before.lastIndexOf("\n")
  )
  const from = boundary === -1 ? 0 : boundary + 1
  const rest = text.slice(end)
  const m = /[.!?](\s|$)|\n/.exec(rest)
  const to = m ? end + m.index + 1 : text.length
  let sentence = text.slice(from, to).replace(/\s+/g, " ").trim()
  if (sentence.length > MAX_SENTENCE) {
    // Keep the quote visible: centre the window on it.
    const q = text.slice(start, end).replace(/\s+/g, " ").trim()
    const at = sentence.indexOf(q)
    const pad = Math.max(0, Math.floor((MAX_SENTENCE - q.length) / 2))
    const s = Math.max(0, at - pad)
    sentence = `${s > 0 ? "…" : ""}${sentence.slice(s, s + MAX_SENTENCE).trim()}…`
  }
  return sentence
}

/**
 * Builds the anchor for `start..end` of block `block`, whose text is
 * `blockText`. For a whole paragraph pass 0 and the text length.
 */
export function makeAnchor(blockText: string, block: number, start: number, end: number): NoteAnchor {
  const s = Math.max(0, Math.min(start, blockText.length))
  const e = Math.max(s, Math.min(end, blockText.length, s + MAX_QUOTE))
  return {
    block,
    start: s,
    end: e,
    quote: blockText.slice(s, e),
    sentence: sentenceAround(blockText, s, e),
    prefix: blockText.slice(Math.max(0, s - ANCHOR_CONTEXT), s),
    suffix: blockText.slice(e, e + ANCHOR_CONTEXT),
  }
}

function sharedTail(a: string, b: string): number {
  let n = 0
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++
  return n
}

function sharedHead(a: string, b: string): number {
  let n = 0
  while (n < a.length && n < b.length && a[n] === b[n]) n++
  return n
}

/**
 * Finds `anchor` in the current block texts of its part. Exact position
 * first; then any other occurrence of the quote in the part, preferring the
 * one whose surroundings match best; otherwise the part.
 */
export function resolveAnchor(blockTexts: readonly string[], anchor: NoteAnchor): NotePlacement {
  const { block, start, end, quote, prefix, suffix } = anchor
  if (!quote) return { status: "section" }
  if (blockTexts[block]?.slice(start, end) === quote) {
    return { status: "exact", block, start, end }
  }
  let best: { block: number; start: number; score: number } | null = null
  blockTexts.forEach((text, b) => {
    let i = text.indexOf(quote)
    while (i !== -1) {
      const score =
        sharedTail(text.slice(Math.max(0, i - prefix.length), i), prefix) +
        sharedHead(text.slice(i + quote.length, i + quote.length + suffix.length), suffix) +
        (b === block ? 2 : 0)
      if (!best || score > best.score) best = { block: b, start: i, score }
      i = text.indexOf(quote, i + 1)
    }
  })
  if (best) {
    const found = best as { block: number; start: number }
    return { status: "exact", block: found.block, start: found.start, end: found.start + quote.length }
  }
  return { status: "section" }
}

/** Whitespace removed: block text from the DOM and from Markdown agree. */
export function squash(text: string): string {
  return text.replace(/\s+/g, "")
}

/**
 * Server-side placement of a note against plain text per part, for the My
 * notes page and the download. `partTexts` maps every current part key of
 * the lesson to that part's plain text; a missing lesson passes an empty map.
 */
export function placeNoteInLesson(
  note: Pick<LessonNote, "partKey" | "kind" | "anchor">,
  partTexts: ReadonlyMap<string, string>
): NotePlacement["status"] {
  if (!note.partKey || !partTexts.has(note.partKey)) return "lesson"
  if (note.kind === "part" || !note.anchor) return "section"
  const text = squash(partTexts.get(note.partKey) ?? "")
  return text.includes(squash(note.anchor.quote)) ? "exact" : "section"
}

/**
 * Note keys for a page-flip lesson's pages: one per reading page, from its
 * title, made unique by position when two pages share a title. Video and
 * Q&A pages get null (no notes there).
 */
export function pageNoteKeys(pages: ReadonlyArray<{ title: string; kind: string }>): Array<string | null> {
  const seen = new Map<string, number>()
  return pages.map((p) => {
    if (p.kind !== "prose" && p.kind !== "code" && p.kind !== "project") return null
    const base =
      p.kind === "project"
        ? "project"
        : `sec-${p.title
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80) || "section"}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  })
}

/**
 * Order notes for display within a part: the part box first, then pinned
 * notes in reading order, then everything else oldest first.
 */
export function compareNotes(a: LessonNote, b: LessonNote): number {
  const rank = (n: LessonNote) => (n.kind === "part" ? 0 : 1)
  if (rank(a) !== rank(b)) return rank(a) - rank(b)
  if (a.anchor && b.anchor) {
    if (a.anchor.block !== b.anchor.block) return a.anchor.block - b.anchor.block
    if (a.anchor.start !== b.anchor.start) return a.anchor.start - b.anchor.start
  }
  return a.createdAt.localeCompare(b.createdAt)
}
