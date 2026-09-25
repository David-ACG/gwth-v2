/**
 * Request validation for the page-comments API (contract: ./types.ts).
 *
 * Optional fields accept null as well as absence, because a browser that
 * builds the body from DOM reads often sends null for "not found". Nulls are
 * normalised to undefined so the parsed value matches the contract types.
 */
import { z } from "zod"
import {
  CANNED_ACTIONS,
  COMMENT_MAX_LENGTH,
  COMMENT_STATUSES,
  COMMENT_TARGET_TYPES,
  LESSON_VARIANTS,
  QUOTE_MAX_LENGTH,
  SITE_KINDS,
  type CannedCategory,
  type CommentAction,
} from "./types"

/** An optional string capped at `max` characters; null becomes undefined. */
function optionalText(max: number) {
  return z
    .string()
    .max(max, `Must be ${max} characters or fewer`)
    .nullish()
    .transform((value) => value ?? undefined)
}

const EMPTY_COMMENT_MESSAGE = "Please write a comment"
const COMMENT_TOO_LONG_MESSAGE = `Comments must be ${COMMENT_MAX_LENGTH} characters or fewer`

const commentText = z
  .string()
  .trim()
  .min(1, EMPTY_COMMENT_MESSAGE)
  .max(COMMENT_MAX_LENGTH, COMMENT_TOO_LONG_MESSAGE)

/**
 * The words on a new comment: trimmed, 0..4000, absent or null read as "".
 * Whether "" is allowed depends on the action and text edit, checked below.
 */
const newCommentText = z
  .string()
  .trim()
  .max(COMMENT_MAX_LENGTH, COMMENT_TOO_LONG_MESSAGE)
  .nullish()
  .transform((value) => value ?? "")

/** True when `key` is an own key of `record` (never a prototype member). */
function hasOwn(record: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

/** Looks up the canned action; null when the category or key is unknown. */
export function resolveCannedAction(
  category: string,
  key: string
): CommentAction | null {
  if (!hasOwn(CANNED_ACTIONS, category)) return null
  const actions: Record<string, string> =
    CANNED_ACTIONS[category as CannedCategory].actions
  if (!hasOwn(actions, key)) return null
  return { category: category as CannedCategory, key, label: actions[key]! }
}

/**
 * A canned action. The browser names the category and key; the label is
 * always filled from CANNED_ACTIONS, so a label the browser sends is ignored.
 */
const actionSchema = z
  .object({
    category: z.string().max(100),
    key: z.string().max(100),
    label: z.string().max(200).nullish(),
  })
  .transform((value, ctx) => {
    const action = resolveCannedAction(value.category, value.key)
    if (!action) {
      ctx.addIssue({ code: "custom", message: "Unknown action", path: ["key"] })
      return z.NEVER
    }
    return action
  })

/** A fraction of the anchored element's box; a little overhang is allowed. */
const relNumber = z
  .number()
  .min(-1, "Shape position is out of range")
  .max(2, "Shape position is out of range")

const shapeSchema = z.object({
  kind: z.enum(["point", "box"]),
  rel: z.object({ x: relNumber, y: relNumber, w: relNumber, h: relNumber }),
})

const textEditSchema = z
  .object({
    original: z
      .string()
      .trim()
      .min(1, "The original words are required")
      .max(2000, "The original words must be 2000 characters or fewer"),
    replacement: z
      .string()
      .trim()
      .max(2000, "The new words must be 2000 characters or fewer"),
  })
  .refine((edit) => edit.original !== edit.replacement, {
    message: "The new words are the same as the original",
    path: ["replacement"],
  })

/** The fields of POST /api/comments, before the cross-field rule. */
const newPageCommentFields = z.object({
  pagePath: z
    .string()
    .min(1, "pagePath is required")
    .max(2048)
    .refine((path) => path.startsWith("/"), "pagePath must start with /"),
  pageTitle: optionalText(500),
  lessonId: optionalText(200),
  lessonPage: z
    .number()
    .int()
    .positive()
    .nullish()
    .transform((value) => value ?? undefined),
  lessonPageTitle: optionalText(500),
  lessonVariant: z
    .enum(LESSON_VARIANTS)
    .nullish()
    .transform((value) => value ?? undefined),
  targetType: z.enum(COMMENT_TARGET_TYPES),
  quote: optionalText(QUOTE_MAX_LENGTH),
  quotePrefix: optionalText(400),
  quoteSuffix: optionalText(400),
  selector: optionalText(2000),
  selectorKind: z
    .enum(["id", "testid", "path", "root"])
    .nullish()
    .transform((value) => value ?? undefined),
  heading: optionalText(500),
  imageSrc: optionalText(4096),
  imageAlt: optionalText(1000),
  context: optionalText(2000),
  comment: newCommentText,
  action: actionSchema.nullish().transform((value) => value ?? undefined),
  shape: shapeSchema.nullish().transform((value) => value ?? undefined),
  textEdit: textEditSchema.nullish().transform((value) => value ?? undefined),
  viewport: optionalText(40),
})

/**
 * Body of POST /api/comments (NewPageComment). The words may be empty only
 * when a canned action or a text edit says what to do on its own.
 */
export const newPageCommentSchema = newPageCommentFields.refine(
  (body) =>
    body.comment.length > 0 ||
    body.action !== undefined ||
    body.textEdit !== undefined,
  { message: EMPTY_COMMENT_MESSAGE, path: ["comment"] }
)

export type NewPageCommentInput = z.infer<typeof newPageCommentSchema>

/**
 * Body of PATCH /api/comments/[id]. A non-admin may only withdraw or edit
 * their own open comment; the route enforces who may set which status.
 */
export const pageCommentPatchSchema = z
  .object({
    status: z.enum(COMMENT_STATUSES).optional(),
    comment: commentText.optional(),
  })
  .refine(
    (patch) => patch.status !== undefined || patch.comment !== undefined,
    "Nothing to change"
  )

/** The triage record the triage script writes (CommentTriage). */
export const commentTriageSchema = z.object({
  by: z.string().min(1).max(100),
  at: z.string().min(1).max(100),
  verdict: z.enum(["valid", "invalid", "unclear"]).optional(),
  reason: z.string().max(4000).optional(),
  bead: z.string().max(200).optional(),
  questionId: z.string().max(200).optional(),
  commit: z.string().max(200).optional(),
})

/** Body of PATCH /api/pipeline/comments/[id]. */
export const pipelineCommentPatchSchema = z.object({
  status: z.enum(COMMENT_STATUSES),
  triage: commentTriageSchema.nullish(),
  apiKey: z.string().optional(),
})

/** Body of PATCH /api/admin/beta-testers. */
export const betaTesterPatchSchema = z.object({
  userId: z.string().trim().min(1, "userId is required").max(200),
  betaTester: z.boolean(),
})

/** Parses a comma-separated status list; returns null if any entry is unknown. */
export function parseStatusList(
  raw: string | null
): (typeof COMMENT_STATUSES)[number][] | null | undefined {
  if (raw === null || raw.trim() === "") return undefined
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  const statuses: (typeof COMMENT_STATUSES)[number][] = []
  for (const part of parts) {
    if (!(COMMENT_STATUSES as readonly string[]).includes(part)) return null
    statuses.push(part as (typeof COMMENT_STATUSES)[number])
  }
  return statuses
}

/** Narrows a site query value; undefined when absent, null when unknown. */
export function parseSiteKind(
  raw: string | null
): (typeof SITE_KINDS)[number] | null | undefined {
  if (raw === null || raw.trim() === "") return undefined
  const value = raw.trim()
  return (SITE_KINDS as readonly string[]).includes(value)
    ? (value as (typeof SITE_KINDS)[number])
    : null
}

/** True when `id` is a canonical UUID (page_comments.id is a uuid column). */
export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}
