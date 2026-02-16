/**
 * Data access functions for user bookmarks.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type { Bookmark } from "@/lib/types"
import { mockBookmarks } from "./mock-data"

/**
 * Fetches all bookmarks for the current user.
 * Returns them sorted by creation date (newest first).
 */
export async function getBookmarks(): Promise<Bookmark[]> {
  return [...mockBookmarks].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Checks whether a specific lesson or lab is bookmarked.
 */
export async function isBookmarked(params: {
  lessonId?: string
  labId?: string
}): Promise<boolean> {
  return mockBookmarks.some(
    (b) =>
      (params.lessonId && b.lessonId === params.lessonId) ||
      (params.labId && b.labId === params.labId)
  )
}

/**
 * Toggles a bookmark on a lesson or lab.
 * If already bookmarked, removes it. Otherwise, creates it.
 * Returns the new bookmarked state.
 */
export async function toggleBookmark(params: {
  lessonId?: string
  labId?: string
}): Promise<boolean> {
  const existingIndex = mockBookmarks.findIndex(
    (b) =>
      (params.lessonId && b.lessonId === params.lessonId) ||
      (params.labId && b.labId === params.labId)
  )

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
