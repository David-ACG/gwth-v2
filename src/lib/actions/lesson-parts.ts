"use server"

/**
 * Client-callable boundary for lessons in parts (bead gwth-launch-hqyp).
 *
 * Everything arriving here is attacker-controlled. Check answers are graded
 * on the server against lesson_parts.content; the browser never holds the
 * key, and a wrong answer reveals it only once the check is resolved (two
 * wrong tries), at which point further answers change nothing.
 */
import { getCurrentUser } from "@/lib/auth"
import { checkLessonAccess } from "@/lib/lessons/lesson-access"
import { isValidSessionId } from "@/lib/lessons/lesson-events"
import { isLessonFormat, type LessonFormat } from "@/lib/lessons/parts"
import {
  getLessonPartsContent,
  recordLessonEvents,
  recordPartCheckAnswer,
  setLearnerPrefs,
  type LearnerPrefs,
} from "@/lib/data/lesson-parts"

export interface PartCheckAnswerResponse {
  ok: boolean
  message?: string
  correct?: boolean
  feedback?: string
  tries?: number
  wrongTries?: number
  resolved?: boolean
  reveal?: { answerIndex: number; explanation: string } | null
  lessonComplete?: boolean
}

export async function answerPartCheckAction(input: {
  lessonId: string
  partId: string
  optionIndex: number
  format: LessonFormat | null
  sessionId: string
}): Promise<PartCheckAnswerResponse> {
  const access = await checkLessonAccess(String(input?.lessonId ?? ""))
  if (!access.ok) return { ok: false, message: access.message }
  if (!isValidSessionId(input.sessionId)) return { ok: false, message: "Refresh the page and try again." }
  const content = await getLessonPartsContent(input.lessonId)
  if (!content) return { ok: false, message: "This lesson could not be loaded. Refresh the page and try again." }
  const result = await recordPartCheckAnswer({
    userId: access.userId,
    content,
    partId: String(input.partId),
    optionIndex: Number(input.optionIndex),
    format: isLessonFormat(input.format) ? input.format : null,
    sessionId: input.sessionId,
  })
  if (!result) return { ok: false, message: "That answer could not be saved. Try again." }
  return {
    ok: true,
    correct: result.correct,
    feedback: result.feedback,
    tries: result.state.tries,
    wrongTries: result.state.wrongTries,
    resolved: result.state.resolved,
    reveal: result.reveal,
    lessonComplete: result.lessonComplete,
  }
}

/**
 * Save the learner's format and/or read-along setting. When `lessonId` is
 * given (the switch inside a lesson or the first choice screen), the change
 * is also logged against that lesson.
 */
export async function saveLessonPrefsAction(input: {
  lessonFormat?: LessonFormat
  readAlong?: boolean
  log?: { lessonId: string; sessionId: string; event: "format_chosen" | "format_switched" | "read_along"; partIndex: number | null; from?: LessonFormat | null; where?: string }
}): Promise<{ ok: boolean; prefs?: LearnerPrefs; message?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, message: "Sign in to save this setting." }
  const patch: Partial<LearnerPrefs> = {}
  if (input.lessonFormat !== undefined) {
    if (!isLessonFormat(input.lessonFormat)) return { ok: false, message: "Unknown format." }
    patch.lessonFormat = input.lessonFormat
  }
  if (input.readAlong !== undefined) patch.readAlong = Boolean(input.readAlong)
  try {
    const prefs = await setLearnerPrefs(user.id, patch)
    const log = input.log
    if (log && isValidSessionId(log.sessionId)) {
      const access = await checkLessonAccess(log.lessonId)
      if (access.ok) {
        const detail =
          log.event === "read_along"
            ? { on: prefs.readAlong }
            : { from: log.from ?? null, to: prefs.lessonFormat, where: log.where ?? "lesson" }
        await recordLessonEvents(user.id, log.lessonId, log.sessionId, [
          { event: log.event, partIndex: log.partIndex, format: prefs.lessonFormat, detail },
        ])
      }
    }
    return { ok: true, prefs }
  } catch (error) {
    console.error("[lesson-parts] cannot save preferences", error)
    return { ok: false, message: "That setting could not be saved. Try again." }
  }
}
