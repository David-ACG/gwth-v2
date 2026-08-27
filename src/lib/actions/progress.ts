"use server"

/**
 * Server Actions for lesson-progress mutations (W7, hardened under N2
 * security / gwth-launch-va6, re-hardened after the N2 QA chain /
 * gwth-launch-avo).
 *
 * Called from Client Components (the `useProgress` hook) and run on the server.
 * The data layer (`@/lib/data/progress`) reaches the DB and reads auth cookies,
 * so it cannot be imported into a client bundle directly — this action is the
 * client-callable boundary. Per-user scoping is enforced inside the data layer
 * via `getCurrentUser()`; unauthenticated calls are a safe no-op there.
 *
 * TRUST BOUNDARY: everything arriving here is attacker-controlled. The
 * hardening, in layers:
 *
 *  - `updateLessonProgressAction` forwards ONLY the whitelisted fields the UI
 *    legitimately sends (watch fraction and reading fraction). Every quiz
 *    outcome (`quizScore`, `bestQuizScore`, `quizPassed`, `quizAttempts`) is
 *    computed exclusively by `submitQuizAnswersAction`.
 *  - `submitQuizAnswersAction` refuses to grade for callers without a valid
 *    session AND access to the lesson's month/content (QA defect 4): before
 *    that check an anonymous POST to the server-action endpoint harvested the
 *    full answer key from the grading response.
 *  - MAX_QUIZ_ATTEMPTS is enforced server-side from the persisted row (QA
 *    defect 5), and the whole quiz write is a single atomic upsert in
 *    `recordQuizSubmission` (QA defect 6), so races cannot lose attempts or
 *    let a low score overwrite a concurrent passing one.
 *  - The intro-video watch fraction is CREDITED, not accepted (QA defect 3):
 *    a write may only raise it by what real wall-clock time since the last
 *    write could have earned at generous playback speed, so a single console
 *    call `updateLessonProgressAction(id, { introVideoProgress: 1 })` no
 *    longer forges the watch half of the completion record.
 */
import {
  QUIZ_PASS_SCORE,
  hasPassedQuiz,
} from "@/lib/progress/completion"
import { MAX_QUIZ_ATTEMPTS } from "@/lib/config"
import {
  getLessonProgress,
  recordQuizSubmission,
  updateLessonProgress as updateLessonProgressData,
} from "@/lib/data/progress"
import {
  getLessonMonthById,
  getQuizQuestionsByLessonId,
} from "@/lib/data/lessons"
import { canUserAccessMonth, getCurrentUser } from "@/lib/auth"
import {
  isContentAllowedEmail,
  isPrivateContentMode,
} from "@/lib/content-mode"
import type {
  LessonProgress,
  QuizAttemptLimitResult,
  QuizSubmitResult,
} from "@/lib/types"

/**
 * The only fields a client may write directly, each a fraction the UI
 * observes locally (video watched, page read). Quiz fields are deliberately
 * absent — see `submitQuizAnswersAction`. `isCompleted`/`completedAt` are
 * absent because the data layer recomputes them from the merged state via
 * `isLessonComplete()` regardless of what a caller sends.
 */
export type LessonProgressClientUpdate = {
  /** Overall lesson progress fraction, clamped to 0..1 (display only - the
   *  completion gates never read it) */
  progress?: number
  /** Intro-video watched fraction, clamped to 0..1 and then CREDIT-LIMITED
   *  by elapsed time (see `creditableIntroVideoFraction`) */
  introVideoProgress?: number
}

/** Clamps a client-supplied fraction to 0..1; non-finite values become null. */
function sanitizeFraction(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(1, value))
}

// ── Intro-video watch crediting (QA defect 3) ────────────────────────────────
//
// The watch fraction is the video half of the completion gate, and the server
// cannot see the player, so the fraction itself is client-asserted. What the
// server CAN verify is wall-clock time: watching more video takes real time.
// A write may therefore only raise the stored fraction by
//   elapsed-seconds-since-last-write × MAX_SPEED ÷ MIN_DURATION
// capped per call, with a small bootstrap allowance for the first write of a
// viewing session. The real viewer reports at every 10% of playback, so
// honest watching (any speed up to 2x, any intro longer than ~40s) accrues
// full credit; a forged `introVideoProgress: 1` gets only the bootstrap.
//
// Residual risk, accepted and documented: an attacker who WAITS the length
// of the video while scripting periodic calls earns credit exactly as a real
// 2x watcher would. Without server-side playback telemetry that is the floor;
// the defect's one-console-call forgery is closed.

/** The shortest intro video the credit model assumes (seconds). */
const INTRO_VIDEO_MIN_DURATION_SECONDS = 90
/** The fastest playback the credit model honours. */
const INTRO_VIDEO_MAX_PLAYBACK_SPEED = 2
/** Largest fraction a single write may add on top of elapsed-time credit. */
const INTRO_VIDEO_PER_CALL_CAP = 0.25
/** Credit allowed on the first write of a lesson's watch session. */
const INTRO_VIDEO_BOOTSTRAP_CREDIT = 0.15

/**
 * Returns the intro-video fraction the caller has actually EARNED: monotonic,
 * and raised at most by what elapsed wall-clock time allows.
 */
async function creditableIntroVideoFraction(
  lessonId: string,
  requested: number
): Promise<number> {
  const existing = await getLessonProgress(lessonId)
  const already = existing?.introVideoProgress ?? 0
  if (requested <= already) return already // monotonic: never un-watch

  let credit = INTRO_VIDEO_BOOTSTRAP_CREDIT
  if (existing?.lastAccessedAt) {
    const elapsedSeconds = Math.max(
      0,
      (Date.now() - new Date(existing.lastAccessedAt).getTime()) / 1000
    )
    const earned =
      (elapsedSeconds * INTRO_VIDEO_MAX_PLAYBACK_SPEED) /
      INTRO_VIDEO_MIN_DURATION_SECONDS
    credit = Math.min(earned, INTRO_VIDEO_PER_CALL_CAP)
  }
  return Math.min(requested, Math.min(1, already + credit))
}

/**
 * Persists a partial lesson-progress update for the current user.
 * Returns the merged, completion-evaluated progress row.
 *
 * Only the whitelisted `LessonProgressClientUpdate` fields survive; anything
 * else in the payload (forged quiz outcomes included) is dropped before the
 * data layer sees it, and the watch fraction is credit-limited (see above).
 */
export async function updateLessonProgressAction(
  lessonId: string,
  update: LessonProgressClientUpdate
): Promise<LessonProgress> {
  const safe: Partial<LessonProgress> = {}

  const progress = sanitizeFraction(update?.progress)
  if (progress !== null) safe.progress = progress

  const introVideoProgress = sanitizeFraction(update?.introVideoProgress)
  if (introVideoProgress !== null) {
    safe.introVideoProgress = await creditableIntroVideoFraction(
      lessonId,
      introVideoProgress
    )
  }

  return updateLessonProgressData(lessonId, safe)
}

// ── Quiz submission authorization (QA defect 4) ──────────────────────────────

/**
 * Refuses the submission unless the caller holds a valid session with access
 * to this lesson's content. Mirrors the lesson PAGE's gates
 * (`requireContentAccessOrRedirect` + `canUserAccessMonth` in
 * src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/page.tsx) - the
 * server-action endpoint is reachable without ever rendering the page, so it
 * needs the same checks itself. Throws on refusal (a server action cannot
 * redirect meaningfully for a scripted caller; the real UI never hits this).
 *
 * The two mock environments mirror `resolveDataMode()` in
 * src/lib/data/mode.ts and persist nothing real: no `DATABASE_URL` (pure
 * local fixtures) and `ENABLE_DEV_MOCK_USER=true` with no real session (the
 * staging mock learner). Everywhere else a missing/invalid/ungranted session
 * is refused BEFORE any question row is read.
 */
async function assertQuizSubmissionAllowed(lessonId: string): Promise<void> {
  const user = await getCurrentUser()

  if (!user) {
    const mockEnv =
      !process.env.DATABASE_URL ||
      process.env.ENABLE_DEV_MOCK_USER === "true"
    if (mockEnv) return
    throw new Error("Sign in to submit this quiz.")
  }

  // Private content mode: same allowlist the page gate applies.
  if (isPrivateContentMode() && !isContentAllowedEmail(user.email)) {
    throw new Error("This lesson is not available to your account yet.")
  }

  // Month gate: the caller's subscription must cover this lesson's month.
  const month = await getLessonMonthById(lessonId)
  if (month === null || !canUserAccessMonth(user, month)) {
    throw new Error("This lesson is not part of your current access.")
  }
}

/** Builds the structured refusal for a capped submission (QA defect 5). */
function attemptLimitResult(
  progress: LessonProgress | null
): QuizAttemptLimitResult {
  const bestQuizScore = progress?.bestQuizScore ?? 0
  return {
    attemptLimitReached: true,
    attemptsUsed: progress?.quizAttempts ?? MAX_QUIZ_ATTEMPTS,
    maxAttempts: MAX_QUIZ_ATTEMPTS,
    bestQuizScore,
    passMark: QUIZ_PASS_SCORE,
    message: hasPassedQuiz(bestQuizScore)
      ? `All ${MAX_QUIZ_ATTEMPTS} attempts are used. Your best score of ${bestQuizScore}% already passes.`
      : `All ${MAX_QUIZ_ATTEMPTS} attempts are used. Your best score stays at ${bestQuizScore}%.`,
  }
}

/**
 * Grades a quiz submission SERVER-SIDE and persists the outcome
 * (gwth-launch-va6, hardened under gwth-launch-avo).
 *
 * @param lessonId The lesson whose quiz is being submitted.
 * @param answers Map of question id to the chosen option index. Unanswered
 *   or unknown question ids simply grade as wrong; extra keys are ignored.
 * @returns The graded result - including the post-submission answer reveal
 *   (correct option + explanation per question) - or a
 *   `QuizAttemptLimitResult` refusal carrying NO reveal when the persisted
 *   attempt count has reached MAX_QUIZ_ATTEMPTS.
 *
 * Order of operations, and why it matters:
 *  1. Authorization (session + content access) BEFORE any question row is
 *     read - an unauthenticated or out-of-month caller never sees the key.
 *  2. Attempt-cap pre-check from the persisted row BEFORE grading - a capped
 *     caller never sees the key either.
 *  3. Grade against the DB answer key.
 *  4. One atomic `recordQuizSubmission` upsert persists score/best/attempts/
 *     completion, re-checking the cap in SQL so a double-submit race cannot
 *     slip a 4th attempt in between the pre-check and the write; if the race
 *     loses, the reveal is discarded and the refusal returned instead.
 */
export async function submitQuizAnswersAction(
  lessonId: string,
  answers: Record<string, number>
): Promise<QuizSubmitResult> {
  await assertQuizSubmissionAllowed(lessonId)

  // Attempt cap, from the PERSISTED row (QA defect 5) - before grading, so a
  // capped caller is refused without the key ever being read.
  const existing = await getLessonProgress(lessonId)
  if ((existing?.quizAttempts ?? 0) >= MAX_QUIZ_ATTEMPTS) {
    return attemptLimitResult(existing)
  }

  const questions = await getQuizQuestionsByLessonId(lessonId)
  if (questions.length === 0) {
    // Also the fail-loudly path for a DB lesson whose quiz rows are missing
    // (QA defect 7): grading against the bundled mock key is never an option.
    throw new Error(`Lesson ${lessonId} has no quiz to grade`)
  }

  const perQuestion = questions.map((q) => {
    const chosen = answers?.[q.id]
    const correct =
      typeof chosen === "number" &&
      Number.isInteger(chosen) &&
      chosen === q.correctOptionIndex
    return {
      questionId: q.id,
      correct,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
    }
  })

  const correctCount = perQuestion.filter((p) => p.correct).length
  const score = Math.round((correctCount / questions.length) * 100)

  // One atomic write: increment, GREATEST, cap and completion all in SQL
  // (QA defect 6).
  const recorded = await recordQuizSubmission(lessonId, score, {
    passMark: QUIZ_PASS_SCORE,
    maxAttempts: MAX_QUIZ_ATTEMPTS,
  })
  if (recorded.outcome === "attempt-limit") {
    // Lost the race against a concurrent capped submission: nothing was
    // written, and the reveal is deliberately discarded.
    return attemptLimitResult(recorded.progress)
  }

  return {
    score,
    passed: score >= QUIZ_PASS_SCORE,
    passMark: QUIZ_PASS_SCORE,
    perQuestion,
    progress: recorded.progress,
  }
}
