/**
 * The lesson page's side of content protection (bead gwth-launch-735c): note
 * each lesson page served to a signed-in learner, after the response is sent
 * so the learner never waits for it. Admins are not monitored (David and
 * reviewers open lessons fast on purpose).
 */
import "server-only"

import { after } from "next/server"
import { headers } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { recordLessonAccess, requestMetaFrom } from "./store"

/** Adult silent reading of non-fiction, words a minute (research, phase 2). */
const READING_WPM = 238
const MIN_EXPECTED_SEC = 5 * 60

/** Expected time on a lesson, from its words; never under 5 minutes. */
export function expectedSecondsFor(text: string | null | undefined): number {
  const words = (text ?? "").replace(/[`#>*_\[\]()!|-]+/g, " ").split(/\s+/).filter(Boolean).length
  return Math.max(MIN_EXPECTED_SEC, Math.round((words / READING_WPM) * 60))
}

export async function noteLessonAccess(input: {
  lessonId: string
  month: number
  kind: "lesson_view" | "locked_lesson"
  text?: string | null
  mediaLinks?: number
}): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user || isAdminEmail(user.email)) return
    const meta = requestMetaFrom(await headers())
    if (meta.prefetch) return
    const expectedSec = input.kind === "lesson_view" ? expectedSecondsFor(input.text) : null
    after(() =>
      recordLessonAccess({
        userId: user.id,
        email: user.email,
        lessonId: input.lessonId,
        month: input.month,
        kind: input.kind,
        expectedSec,
        mediaLinks: input.mediaLinks ?? 0,
        currentMonth: user.subscriptionMonth ?? 1,
        meta,
      })
    )
  } catch (error) {
    console.error("[protection] could not note lesson access", error)
  }
}
