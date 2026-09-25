/**
 * Page-comments data layer (comment on the real student view, bead
 * gwth-launch-8ksq; contract: src/lib/comments/types.ts; DDL: 021, 022).
 *
 * Every read and write of `page_comments` and `beta_testers` goes through
 * here. There is no row-level security (D2); scoping is application code:
 *   - a beta tester reads only their own comments (callers pass userId)
 *   - the admin reads every comment on a page
 *   - the triage script reads and updates through the pipeline API
 */
import "server-only"

import { and, desc, eq, inArray, ne, type SQL } from "drizzle-orm"
import { getDb } from "@/db"
import { betaTesters, pageComments } from "@/db/schema"
import type {
  CommentAction,
  CommentRole,
  CommentShape,
  CommentStatus,
  CommentTargetType,
  CommentTextEdit,
  CommentTriage,
  LessonVariant,
  NewPageComment,
  PageComment,
  SiteKind,
} from "@/lib/comments/types"
import { isUuid } from "@/lib/comments/validation"

type PageCommentRow = typeof pageComments.$inferSelect

/** What the API route adds to the browser's body before inserting. */
export interface CreatePageCommentInput extends NewPageComment {
  userId: string
  authorEmail: string
  authorRole: CommentRole
  site: SiteKind
  userAgent?: string | null
}

/** Fields that may change after a comment is saved. */
export interface PageCommentPatch {
  status?: CommentStatus
  comment?: string
  triage?: CommentTriage | null
}

/** Filters for the pipeline listing. */
export interface ListPageCommentsFilter {
  lessonId?: string
  statuses?: CommentStatus[]
  site?: SiteKind
}

/** Postgres timestamps come back as strings in mode "string"; make them ISO. */
function toIso(value: string | Date): string {
  return new Date(value).toISOString()
}

/** null to undefined, so optional contract fields are simply absent. */
function opt<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined
}

/** Maps a stored row to the API shape (PageComment). */
export function toPageComment(row: PageCommentRow): PageComment {
  const comment: PageComment = {
    id: row.id,
    userId: row.userId,
    authorEmail: row.authorEmail,
    authorRole: row.authorRole as CommentRole,
    site: row.site as SiteKind,
    status: row.status as CommentStatus,
    triage: (row.triage as CommentTriage | null) ?? null,
    userAgent: row.userAgent ?? null,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    pagePath: row.pagePath,
    targetType: row.targetType as CommentTargetType,
    comment: row.comment,
    pageTitle: opt(row.pageTitle),
    lessonId: opt(row.lessonId),
    lessonPage: opt(row.lessonPage),
    lessonPageTitle: opt(row.lessonPageTitle),
    lessonVariant: opt(row.lessonVariant) as LessonVariant | undefined,
    quote: opt(row.quote),
    quotePrefix: opt(row.quotePrefix),
    quoteSuffix: opt(row.quoteSuffix),
    selector: opt(row.selector),
    selectorKind: opt(row.selectorKind) as PageComment["selectorKind"],
    heading: opt(row.heading),
    imageSrc: opt(row.imageSrc),
    imageAlt: opt(row.imageAlt),
    context: opt(row.context),
    action: opt(row.action as CommentAction | null),
    shape: opt(row.shape as CommentShape | null),
    textEdit: opt(row.textEdit as CommentTextEdit | null),
    viewport: opt(row.viewport),
  }
  // Drop undefined keys so the JSON matches "optional means absent".
  for (const key of Object.keys(comment) as (keyof PageComment)[]) {
    if (comment[key] === undefined) delete comment[key]
  }
  return comment
}

/** Inserts one comment and returns it as the API shape. */
export async function createPageComment(
  input: CreatePageCommentInput
): Promise<PageComment> {
  const [row] = await getDb()
    .insert(pageComments)
    .values({
      userId: input.userId,
      authorEmail: input.authorEmail,
      authorRole: input.authorRole,
      site: input.site,
      pagePath: input.pagePath,
      pageTitle: input.pageTitle ?? null,
      lessonId: input.lessonId ?? null,
      lessonPage: input.lessonPage ?? null,
      lessonPageTitle: input.lessonPageTitle ?? null,
      lessonVariant: input.lessonVariant ?? null,
      targetType: input.targetType,
      quote: input.quote ?? null,
      quotePrefix: input.quotePrefix ?? null,
      quoteSuffix: input.quoteSuffix ?? null,
      selector: input.selector ?? null,
      selectorKind: input.selectorKind ?? null,
      heading: input.heading ?? null,
      imageSrc: input.imageSrc ?? null,
      imageAlt: input.imageAlt ?? null,
      context: input.context ?? null,
      comment: input.comment,
      action: input.action ?? null,
      shape: input.shape ?? null,
      textEdit: input.textEdit ?? null,
      viewport: input.viewport ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning()
  if (!row) throw new Error("Insert into page_comments returned no row")
  return toPageComment(row)
}

/**
 * Comments on one page, newest first, in every status except withdrawn (the
 * page keeps fixed and declined marks, shown quietly). Pass `userId` to scope
 * to one author (a beta tester); omit it for the admin, who sees every author.
 */
export async function getPageCommentsForPath(
  path: string,
  options: { userId?: string } = {}
): Promise<PageComment[]> {
  const conditions: SQL[] = [
    eq(pageComments.pagePath, path),
    ne(pageComments.status, "withdrawn"),
  ]
  if (options.userId) conditions.push(eq(pageComments.userId, options.userId))
  const rows = await getDb()
    .select()
    .from(pageComments)
    .where(and(...conditions))
    .orderBy(desc(pageComments.createdAt))
  return rows.map(toPageComment)
}

/** One comment by id, or null (also null for an id that is not a UUID). */
export async function getPageComment(id: string): Promise<PageComment | null> {
  if (!isUuid(id)) return null
  const [row] = await getDb()
    .select()
    .from(pageComments)
    .where(eq(pageComments.id, id))
    .limit(1)
  return row ? toPageComment(row) : null
}

/** Applies a patch and stamps updated_at; null when the id does not exist. */
export async function updatePageComment(
  id: string,
  patch: PageCommentPatch
): Promise<PageComment | null> {
  if (!isUuid(id)) return null
  const values: Partial<typeof pageComments.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  }
  if (patch.status !== undefined) values.status = patch.status
  if (patch.comment !== undefined) values.comment = patch.comment
  if (patch.triage !== undefined) values.triage = patch.triage
  const [row] = await getDb()
    .update(pageComments)
    .set(values)
    .where(eq(pageComments.id, id))
    .returning()
  return row ? toPageComment(row) : null
}

/** Every comment matching the filters, newest first (the triage script's read). */
export async function listPageComments(
  filter: ListPageCommentsFilter = {}
): Promise<PageComment[]> {
  const conditions: SQL[] = []
  if (filter.lessonId) conditions.push(eq(pageComments.lessonId, filter.lessonId))
  if (filter.statuses && filter.statuses.length > 0) {
    conditions.push(inArray(pageComments.status, filter.statuses))
  }
  if (filter.site) conditions.push(eq(pageComments.site, filter.site))
  const rows = await getDb()
    .select()
    .from(pageComments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(pageComments.createdAt))
  return rows.map(toPageComment)
}

/** Whether a user has been ticked as a beta tester on /admin/roster. */
export async function isBetaTester(userId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ userId: betaTesters.userId })
    .from(betaTesters)
    .where(eq(betaTesters.userId, userId))
    .limit(1)
  return Boolean(row)
}

/** Ticks (on) or unticks (off) a user as a beta tester. Idempotent. */
export async function setBetaTester(
  userId: string,
  on: boolean,
  byUserId: string | null
): Promise<void> {
  const db = getDb()
  if (on) {
    await db
      .insert(betaTesters)
      .values({ userId, addedBy: byUserId })
      .onConflictDoNothing({ target: betaTesters.userId })
    return
  }
  await db.delete(betaTesters).where(eq(betaTesters.userId, userId))
}

/** Every beta tester's user id (the roster's tick boxes). */
export async function listBetaTesterIds(): Promise<string[]> {
  const rows = await getDb()
    .select({ userId: betaTesters.userId })
    .from(betaTesters)
  return rows.map((row) => row.userId)
}
