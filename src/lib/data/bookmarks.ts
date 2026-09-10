/**
 * User-scoped bookmark persistence.
 *
 * Real learners read and write Postgres rows through Better Auth's validated
 * user id. Local mock mode retains the original in-memory fixtures. Client
 * components must use the server action in `@/lib/actions/bookmarks`.
 */
import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { getDb } from "@/db"
import { bookmarks } from "@/db/schema"
import type { Bookmark, BookmarkTarget } from "@/lib/types"
import { resolveDataMode, type DataMode } from "./mode"
import { mockBookmarks } from "./mock-data"

function assertTarget(params: BookmarkTarget): void {
  const targetCount =
    Number(Boolean(params.lessonId)) + Number(Boolean(params.labId))
  if (targetCount !== 1) {
    throw new Error("A bookmark must target exactly one lesson or lab.")
  }
}

function matchesTarget(bookmark: Bookmark, params: BookmarkTarget): boolean {
  return params.lessonId
    ? bookmark.lessonId === params.lessonId
    : bookmark.labId === params.labId
}

function mapRow(row: typeof bookmarks.$inferSelect): Bookmark {
  return {
    id: row.id,
    userId: row.userId,
    lessonId: row.lessonId,
    labId: row.labId,
    createdAt: new Date(row.createdAt),
  }
}

/** Fetches the current learner's bookmarks, newest first. */
export async function getBookmarks(): Promise<Bookmark[]> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") {
    return [...mockBookmarks].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }
  if (mode.kind === "anonymous") return []

  const rows = await getDb()
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, mode.userId))
    .orderBy(desc(bookmarks.createdAt))

  return rows.map(mapRow)
}

/** Checks whether the current learner has saved a lesson or lab. */
export async function isBookmarked(params: BookmarkTarget): Promise<boolean> {
  assertTarget(params)
  const mode = await resolveDataMode()
  if (mode.kind === "mock") {
    return mockBookmarks.some((b) => matchesTarget(b, params))
  }
  if (mode.kind === "anonymous") return false

  const target = params.lessonId
    ? eq(bookmarks.lessonId, params.lessonId)
    : eq(bookmarks.labId, params.labId!)
  const rows = await getDb()
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, mode.userId), target))
    .limit(1)

  return rows.length > 0
}

/**
 * Toggles one bookmark for the authenticated learner and returns its new state.
 * Anonymous calls are rejected; no client-supplied user id crosses this seam.
 */
export async function toggleBookmark(params: BookmarkTarget): Promise<boolean> {
  assertTarget(params)
  const mode = await resolveDataMode()
  if (mode.kind === "anonymous") throw new Error("Authentication required")
  if (mode.kind === "mock") return toggleMockBookmark(params)
  return togglePersistedBookmark(mode, params)
}

function toggleMockBookmark(params: BookmarkTarget): boolean {
  const existingIndex = mockBookmarks.findIndex((b) => matchesTarget(b, params))
  if (existingIndex >= 0) {
    mockBookmarks.splice(existingIndex, 1)
    return false
  }

  mockBookmarks.push({
    id: `bm_${Date.now()}`,
    userId: "user_mock_001",
    lessonId: params.lessonId ?? null,
    labId: params.labId ?? null,
    createdAt: new Date(),
  })
  return true
}

async function togglePersistedBookmark(
  mode: Extract<DataMode, { kind: "user" }>,
  params: BookmarkTarget
): Promise<boolean> {
  const db = getDb()
  const target = params.lessonId
    ? eq(bookmarks.lessonId, params.lessonId)
    : eq(bookmarks.labId, params.labId!)

  const deleted = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, mode.userId), target))
    .returning({ id: bookmarks.id })
  if (deleted.length > 0) return false

  const inserted = await db
    .insert(bookmarks)
    .values({
      userId: mode.userId,
      lessonId: params.lessonId ?? null,
      labId: params.labId ?? null,
    })
    .onConflictDoNothing()
    .returning({ id: bookmarks.id })

  // A concurrent identical save may win the unique-index race. Either way the
  // requested item is now saved, which is the state the caller should render.
  return (
    inserted.length > 0 ||
    (await persistedBookmarkExists(mode.userId, params))
  )
}

async function persistedBookmarkExists(
  userId: string,
  params: BookmarkTarget
): Promise<boolean> {
  const target = params.lessonId
    ? eq(bookmarks.lessonId, params.lessonId)
    : eq(bookmarks.labId, params.labId!)
  const rows = await getDb()
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), target))
    .limit(1)
  return rows.length > 0
}
