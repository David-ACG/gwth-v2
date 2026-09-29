/**
 * The access check shared by every lesson-parts write (check answers, events,
 * words and captions). Same rules as quiz grading in
 * src/lib/actions/progress.ts: a real session with a live beta grant, the
 * private-content allowlist (admins admitted), the month gate, and the
 * learner's syllabus edition. Mock mode is not supported for parts lessons:
 * they need the database.
 */
import "server-only"

import { isAdminEmail } from "@/lib/admin"
import { canUserAccessMonth, getCurrentUser } from "@/lib/auth"
import { isContentAllowedEmail, isPrivateContentMode } from "@/lib/content-mode"
import { getEffectiveEdition, isLessonInEdition } from "@/lib/data/editions"
import { getLessonGradingMetaById } from "@/lib/data/lessons"

export type LessonAccess =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401 | 403; message: string }

export async function checkLessonAccess(lessonId: string): Promise<LessonAccess> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, status: 401, message: "Sign in to continue this lesson." }
  if (isPrivateContentMode() && !isContentAllowedEmail(user.email) && !isAdminEmail(user.email)) {
    return { ok: false, status: 403, message: "This lesson is not available to your account yet." }
  }
  const meta = await getLessonGradingMetaById(lessonId)
  if (meta === null || !canUserAccessMonth(user, meta.month)) {
    return { ok: false, status: 403, message: "This lesson is not part of your current access." }
  }
  const edition = await getEffectiveEdition(meta.courseSlug)
  if (!isLessonInEdition(edition, lessonId)) {
    return { ok: false, status: 403, message: "This lesson is not part of your current access." }
  }
  return { ok: true, userId: user.id, email: user.email }
}
