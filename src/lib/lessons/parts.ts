/**
 * Lessons in parts (bead gwth-launch-hqyp, Style Bible lesson-viewer-two-formats).
 *
 * A lesson with parts content is shown one part at a time in one of two
 * formats the learner chooses:
 *   - "read":  Read or listen. The part's text, read out word for word, with
 *              read-along highlighting (on by default).
 *   - "watch": Watch short videos. A short narrated video per part, captions,
 *              and the same text collapsed underneath.
 * Every part ends with ONE check question that must be answered correctly to
 * continue; after MAX_WRONG_BEFORE_EXPLAIN wrong tries the explanation shows
 * and Continue unlocks.
 *
 * `LessonPartsContent` is what lesson_parts.content stores. It carries the
 * check answers, so it never leaves the server: `toPublicParts` strips them.
 * Word timings and captions are served from the site's own origin by
 * /api/lesson-parts/... because the media CDN sends no CORS header.
 *
 * Media fields hold R2 keys (`lessons/m1_l10/formats/video_p1.mp4`) or URLs;
 * both go through mediaUrl().
 */
import { z } from "zod"
import { mediaUrl } from "@/lib/media/url"

export const LESSON_FORMATS = ["read", "watch"] as const
export type LessonFormat = (typeof LESSON_FORMATS)[number]

export function isLessonFormat(value: unknown): value is LessonFormat {
  return value === "read" || value === "watch"
}

/** Wrong tries after which the explanation shows and Continue unlocks. */
export const MAX_WRONG_BEFORE_EXPLAIN = 2

/** A word timing: [start seconds, word as spoken]. */
const wordTiming = z.tuple([z.number(), z.string()])

const checkSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(5),
  answerIndex: z.number().int().min(0),
  feedbackRight: z.string().min(1),
  feedbackWrong: z.string().min(1),
  /** Shown after two wrong tries; falls back to feedbackRight. */
  explanation: z.string().min(1).optional(),
})

const imageSchema = z.object({
  light: z.string().min(1),
  dark: z.string().min(1).optional(),
  alt: z.string().min(1),
  caption: z.string().optional(),
})

const partSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/),
  title: z.string().min(1),
  minutes: z.number().positive(),
  bodyMd: z.string().min(1),
  image: imageSchema.optional(),
  check: checkSchema,
  read: z.object({
    audio: z.string().min(1),
    seconds: z.number().positive().optional(),
    words: z.array(wordTiming).default([]),
  }),
  watch: z.object({
    video: z.string().min(1),
    poster: z.string().optional(),
    seconds: z.number().positive().optional(),
    captions: z.string().optional(),
  }),
})

export const lessonPartsSchema = z
  .object({
    version: z.literal(1),
    lessonId: z.string().regex(/^m\d+_l\d{2}$/),
    title: z.string().min(1),
    intro: z
      .object({
        video: z.string().min(1),
        poster: z.string().optional(),
        seconds: z.number().positive().optional(),
        captions: z.string().optional(),
      })
      .optional(),
    parts: z.array(partSchema).min(1).max(12),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>()
    value.parts.forEach((part, i) => {
      if (seen.has(part.id)) {
        ctx.addIssue({ code: "custom", path: ["parts", i, "id"], message: `duplicate part id ${part.id}` })
      }
      seen.add(part.id)
      if (part.check.answerIndex >= part.check.options.length) {
        ctx.addIssue({ code: "custom", path: ["parts", i, "check", "answerIndex"], message: "answerIndex is outside options" })
      }
    })
  })

export type LessonPartsContent = z.infer<typeof lessonPartsSchema>
export type LessonPartContent = LessonPartsContent["parts"][number]
export type PartCheckContent = LessonPartContent["check"]

/** Parse stored content; null (and a log line) when it does not validate. */
export function parseLessonParts(raw: unknown): LessonPartsContent | null {
  const result = lessonPartsSchema.safeParse(raw)
  if (!result.success) {
    console.error("[lesson-parts] content does not validate", result.error.issues.slice(0, 5))
    return null
  }
  return result.data
}

// ── What the browser gets ────────────────────────────────────────────────────

export interface PublicPartImage {
  light: string
  dark: string | null
  alt: string
  caption: string | null
}

export interface PublicLessonPart {
  id: string
  index: number
  title: string
  minutes: number
  /** Server-rendered HTML, split after the first block (see parts-html.ts). */
  html: { lead: string; rest: string }
  image: PublicPartImage | null
  check: { question: string; options: string[] }
  read: { audio: string; seconds: number | null; wordsUrl: string | null }
  watch: { video: string; poster: string | null; seconds: number | null; captionsUrl: string | null }
}

export interface PublicLessonParts {
  lessonId: string
  title: string
  totalMinutes: number
  intro: { video: string; poster: string | null; seconds: number | null; captionsUrl: string | null } | null
  parts: PublicLessonPart[]
}

/** Same-origin route for a part's word timings or captions. */
export function partsAssetRoute(lessonId: string, kind: "words" | "captions", partId: string): string {
  return `/api/lesson-parts/${encodeURIComponent(lessonId)}/${kind}/${encodeURIComponent(partId)}`
}

/**
 * The content with every answer and every piece of feedback removed.
 * `renderHtml` turns a part's Markdown into HTML (server-only; see
 * parts-html.ts), kept as a parameter so this module stays pure.
 */
export function toPublicParts(
  content: LessonPartsContent,
  renderHtml: (markdown: string) => { lead: string; rest: string }
): PublicLessonParts {
  const id = content.lessonId
  return {
    lessonId: id,
    title: content.title,
    totalMinutes: Math.round(content.parts.reduce((sum, p) => sum + p.minutes, 0)),
    intro: content.intro
      ? {
          video: mediaUrl(content.intro.video),
          poster: mediaUrl(content.intro.poster) ?? null,
          seconds: content.intro.seconds ?? null,
          captionsUrl: content.intro.captions ? partsAssetRoute(id, "captions", "intro") : null,
        }
      : null,
    parts: content.parts.map((p, index) => ({
      id: p.id,
      index,
      title: p.title,
      minutes: p.minutes,
      html: renderHtml(p.bodyMd),
      image: p.image
        ? {
            light: mediaUrl(p.image.light),
            dark: mediaUrl(p.image.dark) ?? null,
            alt: p.image.alt,
            caption: p.image.caption ?? null,
          }
        : null,
      check: { question: p.check.question, options: [...p.check.options] },
      read: {
        audio: mediaUrl(p.read.audio),
        seconds: p.read.seconds ?? null,
        wordsUrl: p.read.words.length ? partsAssetRoute(id, "words", p.id) : null,
      },
      watch: {
        video: mediaUrl(p.watch.video),
        poster: mediaUrl(p.watch.poster) ?? null,
        seconds: p.watch.seconds ?? null,
        captionsUrl: p.watch.captions ? partsAssetRoute(id, "captions", p.id) : null,
      },
    })),
  }
}

// ── Check state (pure) ───────────────────────────────────────────────────────

/** One learner's standing on one part's check question. */
export interface PartCheckState {
  partId: string
  tries: number
  wrongTries: number
  correct: boolean
  firstRight: boolean | null
  /** Right, or explained after two wrong tries: Continue is open. */
  resolved: boolean
  /** Option indexes tried, in order. */
  answers: number[]
}

export function emptyCheckState(partId: string): PartCheckState {
  return { partId, tries: 0, wrongTries: 0, correct: false, firstRight: null, resolved: false, answers: [] }
}

/** What the learner sees after an answer. */
export interface CheckAnswerResult {
  state: PartCheckState
  correct: boolean
  /** Kind feedback for this answer. */
  feedback: string
  /** Present once the check is resolved: the right option and why. */
  reveal: { answerIndex: number; explanation: string } | null
}

/**
 * Apply one answer to a check. Once resolved, further answers change nothing
 * except that a correct pick is still acknowledged.
 */
export function applyCheckAnswer(
  previous: PartCheckState,
  check: PartCheckContent,
  optionIndex: number
): CheckAnswerResult {
  const reveal = { answerIndex: check.answerIndex, explanation: check.explanation ?? check.feedbackRight }
  const correct = optionIndex === check.answerIndex
  if (previous.resolved) {
    return {
      state: previous,
      correct,
      feedback: correct ? check.feedbackRight : check.feedbackWrong,
      reveal,
    }
  }
  const tries = previous.tries + 1
  const wrongTries = previous.wrongTries + (correct ? 0 : 1)
  const state: PartCheckState = {
    partId: previous.partId,
    tries,
    wrongTries,
    correct,
    firstRight: previous.firstRight ?? correct,
    resolved: correct || wrongTries >= MAX_WRONG_BEFORE_EXPLAIN,
    answers: [...previous.answers, optionIndex],
  }
  return {
    state,
    correct,
    feedback: correct ? check.feedbackRight : check.feedbackWrong,
    reveal: state.resolved ? reveal : null,
  }
}

/** Every part resolved: the lesson is complete. */
export function allPartsResolved(parts: { id: string }[], states: Record<string, PartCheckState>): boolean {
  return parts.length > 0 && parts.every((p) => states[p.id]?.resolved)
}

/** Share of parts whose check was right first time, 0..100. */
export function rightFirstTimeScore(parts: { id: string }[], states: Record<string, PartCheckState>): number {
  if (!parts.length) return 0
  const right = parts.filter((p) => states[p.id]?.firstRight === true).length
  return Math.round((100 * right) / parts.length)
}

/** The first part not yet resolved (parts.length when all are). */
export function firstOpenPart(parts: { id: string }[], states: Record<string, PartCheckState>): number {
  const i = parts.findIndex((p) => !states[p.id]?.resolved)
  return i === -1 ? parts.length : i
}
