/**
 * Browser memory for where a learner is in a lesson (bead gwth-launch-8ta).
 *
 * David, 2026-07-27, recording the live site: leaving a lesson and coming back
 * sent him to page 1, and "I have to do the answers again". Two things are
 * remembered here, per lesson, in this browser:
 *
 *  - the page the learner was on, so the lesson reopens there;
 *  - the Q&A answers picked but NOT yet submitted.
 *
 * Submitted answers are not kept here: the server already holds them
 * (`lesson_progress.quiz_answers`) and the lesson page rebuilds them, graded.
 * The page position has no column in `lesson_progress`, and adding one would
 * make the next website release depend on a production migration; a page
 * number is a convenience, so the browser is the right home for it.
 *
 * Every read and write is wrapped: storage can be missing (SSR), blocked
 * (private mode, a strict browser setting) or full, and none of those may
 * break the lesson. A failure just means nothing is remembered.
 */

/** Storage key prefix for the last page a learner was on. */
const POSITION_PREFIX = "gwth-lesson-page:"
/** Storage key prefix for unsubmitted Q&A answers. */
const DRAFT_PREFIX = "gwth-lesson-quiz-draft:"

/** localStorage when it exists and can be touched, otherwise null. */
function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * The page the learner was last on in this lesson (1-indexed), or null when
 * nothing usable is stored. Anything outside 1..pageCount reads as nothing,
 * so a lesson that lost pages since cannot strand the learner.
 */
export function readLessonPage(
  lessonId: string,
  pageCount: number
): number | null {
  try {
    const raw = storage()?.getItem(POSITION_PREFIX + lessonId)
    if (!raw) return null
    const page = Number(raw)
    if (!Number.isInteger(page) || page < 1 || page > pageCount) return null
    return page
  } catch {
    return null
  }
}

/** Remembers the page the learner is on in this lesson. */
export function writeLessonPage(lessonId: string, page: number): void {
  try {
    storage()?.setItem(POSITION_PREFIX + lessonId, String(page))
  } catch {
    // Storage full or blocked: the lesson still works, it just won't resume.
  }
}

/**
 * The learner's unsubmitted answers for this lesson, keyed by question id,
 * or an empty object. Non-integer values are dropped.
 */
export function readQuizDraft(lessonId: string): Record<string, number> {
  try {
    const raw = storage()?.getItem(DRAFT_PREFIX + lessonId)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }
    const draft: Record<string, number> = {}
    for (const [questionId, choice] of Object.entries(parsed)) {
      if (typeof choice === "number" && Number.isInteger(choice) && choice >= 0) {
        draft[questionId] = choice
      }
    }
    return draft
  } catch {
    return {}
  }
}

/**
 * Remembers the learner's unsubmitted answers. An empty set clears the entry,
 * so a submitted or retried quiz leaves nothing stale behind.
 */
export function writeQuizDraft(
  lessonId: string,
  draft: Record<string, number>
): void {
  try {
    const store = storage()
    if (!store) return
    if (Object.keys(draft).length === 0) {
      store.removeItem(DRAFT_PREFIX + lessonId)
    } else {
      store.setItem(DRAFT_PREFIX + lessonId, JSON.stringify(draft))
    }
  } catch {
    // Storage full or blocked: the answers stay on screen for this visit.
  }
}
