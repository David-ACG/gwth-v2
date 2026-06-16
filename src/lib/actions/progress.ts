"use server"

/**
 * Server Actions for lesson-progress mutations (W7).
 *
 * Called from Client Components (the `useProgress` hook) and run on the server.
 * The data layer (`@/lib/data/progress`) reaches the DB and reads auth cookies,
 * so it cannot be imported into a client bundle directly — this action is the
 * client-callable boundary. Per-user scoping is enforced inside the data layer
 * via `getCurrentUser()`; unauthenticated calls are a safe no-op there.
 */
import { updateLessonProgress as updateLessonProgressData } from "@/lib/data/progress"
import type { LessonProgress } from "@/lib/types"

/**
 * Persists a partial lesson-progress update for the current user.
 * Returns the merged, completion-evaluated progress row.
 */
export async function updateLessonProgressAction(
  lessonId: string,
  update: Partial<LessonProgress>
): Promise<LessonProgress> {
  return updateLessonProgressData(lessonId, update)
}
