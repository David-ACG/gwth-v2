/**
 * The access check shared by every lesson-parts write (check answers, events,
 * words and captions). Same rules as quiz grading in
 * src/lib/actions/progress.ts: a real session with a live beta grant, the
 * private-content allowlist (admins admitted), the month gate, and the
 * learner's syllabus edition.
 *
 * The sessionless mock learner (review previews, ENABLE_DEV_MOCK_USER with no
 * session cookie) is admitted through the ONE shared check,
 * isSessionlessMockRequest(), exactly as quiz grading admits it. It has no
 * row in "user", so callers must not persist anything for it (`mock: true`).
 */
import "server-only"

import { isAdminEmail } from "@/lib/admin"
import { canUserAccessMonth, getCurrentUser, getMockUser } from "@/lib/auth"
import { isSessionlessMockRequest } from "@/lib/content-access"
import { isContentAllowedEmail, isPrivateContentMode } from "@/lib/content-mode"
import { getEffectiveEdition, isLessonInEdition } from "@/lib/data/editions"
import { getLessonGradingMetaById } from "@/lib/data/lessons"

export type LessonAccess =
  | { ok: true; mock: false; userId: string; email: string }
  | { ok: true; mock: true; userId: null; email: string }
  | { ok: false; status: 401 | 403; message: string }

export async function checkLessonAccess(lessonId: string): Promise<LessonAccess> {
  let user = await getCurrentUser()
  let mock = false
  if (!user) {
    if (!(await isSessionlessMockRequest())) {
      return { ok: false, status: 401, message: "Sign in to continue this lesson." }
    }
    user = await getMockUser()
    mock = true
  }
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
  return mock ? { ok: true, mock: true, userId: null, email: user.email } : { ok: true, mock: false, userId: user.id, email: user.email }
}
