"use server"

import { revalidatePath } from "next/cache"
import { toggleBookmark } from "@/lib/data/bookmarks"
import type { BookmarkTarget } from "@/lib/types"

/** Authenticated server boundary for bookmark mutations. */
export async function toggleBookmarkAction(
  target: BookmarkTarget
): Promise<boolean> {
  const bookmarked = await toggleBookmark(target)
  revalidatePath("/bookmarks")
  return bookmarked
}
