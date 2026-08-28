"use server"

/**
 * Server Actions for lesson-progress mutations (W7, hardened under N2
 * security / gwth-launch-va6, re-hardened twice under the N2 QA chain /
 * gwth-launch-avo).
 *
 * Called from Client Components (the `useProgress` hook) and run on the server.
 * The data layer (`@/lib/data/progress`) reaches the DB and reads auth cookies,
 * so it cannot be imported into a client bundle directly - this action is the
 * client-callable boundary.
 *
 * TRUST BOUNDARY: everything arriving here is attacker-controlled. The
 * hardening, in layers:
 *
 *  - NO stored fraction is client-writable any more. The overall `progress`
 *    fraction is DERIVED server-side from the verified gates (QA round-2
 *    defect 5), and the intro-video watch fraction is CREDITED atomically
 *    against banked wall-clock time in `recordIntroVideoProgress` (QA
 *    defect 3; round-2 defects 6-8) - a console call asserting a full watch
 *    earns only what real elapsed time justifies.
 *  - Every quiz outcome (`quizScore`, `bestQuizScore`, `quizPassed`,
 *    `quizAttempts`) is computed exclusively by `submitQuizAnswersAction`,
 *    which refuses callers without a validated session AND access to the
 *    lesson (QA defect 4) - the sessionless mock learner is admitted only
 *    via the ONE shared `isSessionlessMockRequest()` check, which never
 *    admits a presented (forged) cookie (round-2 defect 1).
 *  - MAX_QUIZ_ATTEMPTS is enforced server-side from the persisted row (QA
 *    defect 5) inside one atomic upsert (QA defect 6), and the answer key is
 *    revealed for a WRONG answer only when no further grading can change the
 *    record - passed, or final attempt spent (round-2 defect 2) - so
 *    read-key-then-resubmit no longer yields a forged pass.
 */
import { MAX_QUIZ_ATTEMPTS } from "@/lib/config"
import {
  getLessonProgress,
  recordIntroVideoProgress,
  recordQuizSubmission,
  updateLessonProgress as updateLessonProgressData,
} from "@/lib/data/progress"
import {
  getLessonGradingMetaById,
  getQuizQuestionsByLessonId,
} from "@/lib/data/lessons"
import { getEffectiveEdition, isLessonInEdition } from "@/lib/data/editions"
import { canUserAccessMonth, getCurrentUser, getMockUser } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { isSessionlessMockRequest } from "@/lib/content-access"
import {
  isContentAllowedEmail,
  isPrivateContentMode,
} from "@/lib/content-mode"
import type {
  LessonProgress,
  QuizAttemptLimitResult,
  QuizQuestionGrade,
  QuizSubmitResult,
} from "@/lib/types"

/**
 * The only field a client may report directly: the fraction of the intro
 * video its player has shown. It is a REPORT, not a write - the server
 * credits it against banked wall-clock time (see
 * `recordIntroVideoProgress`). The overall `progress` fraction is absent on
 * purpose (QA round-2 defect 5): it is derived server-side from the
 * verified gates, so an empty update `{}` is the legitimate way to ask for
 * a completion recompute (the FINISH button's path). Quiz fields are
 * absent - see `submitQuizAnswersAction`.
 */
export type LessonProgressClientUpdate = {
  /** Intro-video watched fraction, clamped to 0..1 and then credit-limited */
  introVideoProgress?: number
}

/** Clamps a client-supplied fraction to 0..1; non-finite values become null. */
function sanitizeFraction(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(1, value))
}

/**
 * Persists a lesson-progress update for the current user and returns the
 * merged, completion-evaluated row.
 *
 * A watch report goes through the atomic time-banked crediting; anything
 * else in the payload (forged quiz outcomes, forged fractions) is dropped,
 * and the empty remainder still triggers the server-side completion
 * recompute from the stored gates.
 */
export async function updateLessonProgressAction(
  lessonId: string,
  update: LessonProgressClientUpdate
): Promise<LessonProgress> {
  const introVideoProgress = sanitizeFraction(update?.introVideoProgress)
  if (introVideoProgress !== null) {
    return recordIntroVideoProgress(lessonId, introVideoProgress)
  }
  // No creditable report: recompute completion/fraction from stored state.
  // The data-layer recompute takes NO payload at all (QA round-3 defect 4).
  return updateLessonProgressData(lessonId)
}

// ── Quiz submission authorization (QA defect 4; round-2 defect 1) ────────────

/**
 * Refuses the submission unless the caller holds a valid session with access
 * to this lesson's content. Mirrors the lesson PAGE's gates
 * (`requireSessionOrRedirect` + `requireContentAccessOrRedirect` +
 * `canUserAccessMonth` in
 * src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/page.tsx) - the
 * server-action endpoint is reachable without ever rendering the page, so it
 * needs the same checks itself. Throws on refusal (a server action cannot
 * redirect meaningfully for a scripted caller; the real UI never hits this).
 *
 * The mock environments are admitted ONLY through the shared
 * `isSessionlessMockRequest()` (src/lib/content-access.ts): a request with
 * no session cookie at all in a mock env is the mock learner; a PRESENTED
 * cookie - forged or real - must validate as a real session, so this can
 * never fail open the way QA round-2 defect 1 describes.
 *
 * Returns the lesson's course slug so the caller can resolve the effective
 * edition's pass mark (N6) without a second lesson lookup.
 */
async function assertQuizSubmissionAllowed(
  lessonId: string
): Promise<{ courseSlug: string }> {
  let user = await getCurrentUser()

  if (!user) {
    if (!(await isSessionlessMockRequest())) {
      throw new Error("Sign in to submit this quiz.")
    }
    // The mock learner is a USER, not a bypass (QA round-3 defect 9): it
    // still runs the same lesson-existence, content-mode and month checks
    // below against the mock identity, exactly as the lesson page does.
    user = await getMockUser()
  }

  // Private content mode: same allowlist the page gate applies. Admins are
  // additionally admitted (QA round-3 appendix 3): ADMIN_EMAILS accounts can
  // reach quiz content through the admin surfaces regardless of
  // CONTENT_ALLOWED_EMAILS, so refusing them ONLY at grading was an
  // inconsistency a reviewer would hit mid-demo, not a protection.
  if (
    isPrivateContentMode() &&
    !isContentAllowedEmail(user.email) &&
    !isAdminEmail(user.email)
  ) {
    throw new Error("This lesson is not available to your account yet.")
  }

  // Month gate: the caller's subscription must cover this lesson's month,
  // and the lesson must actually exist where grading will read it.
  const meta = await getLessonGradingMetaById(lessonId)
  if (meta === null || !canUserAccessMonth(user, meta.month)) {
    throw new Error("This lesson is not part of your current access.")
  }
  return { courseSlug: meta.courseSlug }
}

/**
 * Builds the structured refusal for a capped submission (QA defect 5).
 * `passMark` is the caller's effective-edition pass mark (N6).
 *
 * The message honours the PERSISTED quiz_passed verdict, never a recompute
 * of best-score-vs-current-pass-mark (QA round-2 defect 1): the server does
 * not re-grade closed quizzes, so after an edition pass-mark change the
 * stored verdict is the only claim the refusal may make. A 70% best under a
 * since-lowered mark is still honestly "attempts used" (the row says not
 * passed), and a persisted pass stays "already passed" under a raised mark.
 */
function attemptLimitResult(
  progress: LessonProgress | null,
  passMark: number
): QuizAttemptLimitResult {
  const bestQuizScore = progress?.bestQuizScore ?? 0
  return {
    attemptLimitReached: true,
    attemptsUsed: progress?.quizAttempts ?? MAX_QUIZ_ATTEMPTS,
    maxAttempts: MAX_QUIZ_ATTEMPTS,
    bestQuizScore,
    passMark,
    message:
      progress?.quizPassed === true
        ? `This Q&A is already passed with ${bestQuizScore}%. No further attempts are graded.`
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
 * @returns The graded result, or a `QuizAttemptLimitResult` refusal carrying
 *   NO reveal when the persisted attempt count has reached
 *   MAX_QUIZ_ATTEMPTS.
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
 *  5. The response reveals a wrong answer's key/explanation ONLY when no
 *     further grading can change the record (passed, or final attempt
 *     spent) - otherwise attempt 1 hands over the key and attempt 2 is a
 *     guaranteed forged pass (QA round-2 defect 2).
 */
export async function submitQuizAnswersAction(
  lessonId: string,
  answers: Record<string, number>
): Promise<QuizSubmitResult> {
  const { courseSlug } = await assertQuizSubmissionAllowed(lessonId)

  // N6: the caller's effective syllabus edition, resolved AFTER the session/
  // month authorization so an unauthorized caller learns nothing. It gates
  // TWO things here (QA round-1 defect 1):
  //  - membership: a lesson the edition excludes (or holds as an unratified
  //    draft) cannot be graded, cannot write progress, and never reveals its
  //    key - the same rule that 404s the lesson page. Without this, an org
  //    learner could grade themselves through content their institution
  //    removed, via a replayed request the catalogue never offers.
  //  - the pass mark (decision 4: one per edition; 67 on the fallback).
  const edition = await getEffectiveEdition(courseSlug)
  if (!isLessonInEdition(edition, lessonId)) {
    throw new Error("This lesson is not part of your current access.")
  }
  const passMark = edition.passMark

  // Quiz closure, from the PERSISTED row (QA defect 5; round-3 defect 8) -
  // before grading, so a refused caller never triggers a key read. The quiz
  // closes when the attempt cap is spent OR when it is already passed: a
  // passed quiz cannot be re-graded, so the post-pass reveal can never be
  // resubmitted to inflate bestQuizScore.
  const existing = await getLessonProgress(lessonId)
  if (
    existing &&
    (existing.quizPassed === true ||
      (existing.quizAttempts ?? 0) >= MAX_QUIZ_ATTEMPTS)
  ) {
    return attemptLimitResult(existing, passMark)
  }

  const questions = await getQuizQuestionsByLessonId(lessonId)
  if (questions.length === 0) {
    // Also the fail-loudly path for a DB lesson whose quiz rows are missing
    // (QA defect 7): grading against the bundled mock key is never an option.
    throw new Error(`Lesson ${lessonId} has no quiz to grade`)
  }

  // QA round-1 defect 6: the answers payload is attacker-controlled and used
  // to be persisted verbatim. Keep ONLY integer choices for KNOWN question
  // ids - grading semantics are unchanged (unknown keys always graded as
  // absent) and the stored quiz_answers audit trail is now bounded by the
  // lesson's real question count instead of the caller's imagination.
  const sanitizedAnswers: Record<string, number> = {}
  for (const q of questions) {
    const chosen = answers?.[q.id]
    if (typeof chosen === "number" && Number.isInteger(chosen)) {
      sanitizedAnswers[q.id] = chosen
    }
  }

  const graded = questions.map((q) => {
    const chosen = sanitizedAnswers[q.id]
    const correct =
      typeof chosen === "number" && chosen === q.correctOptionIndex
    return {
      questionId: q.id,
      correct,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
    }
  })

  const correctCount = graded.filter((p) => p.correct).length
  const score = Math.round((correctCount / questions.length) * 100)
  const passed = score >= passMark

  // One atomic write: increment, GREATEST, cap and completion all in SQL
  // (QA defect 6). Stamps graded_by='server' and keeps the submitted
  // answers as the audit trail (N6, migration 016).
  const recorded = await recordQuizSubmission(lessonId, score, {
    passMark,
    maxAttempts: MAX_QUIZ_ATTEMPTS,
    answers: sanitizedAnswers,
  })
  if (recorded.outcome === "attempt-limit") {
    // Lost the race against a concurrent capped submission: nothing was
    // written, and the reveal is deliberately discarded.
    return attemptLimitResult(recorded.progress, passMark)
  }

  // Reveal policy (QA round-2 defect 2; round-3 defect 8): the key for a
  // wrong answer appears only when THIS grade closed the quiz - passed
  // (further grading is now refused atomically, see recordQuizSubmission's
  // setWhere) or the final attempt is spent - so no revealed key can ever
  // be fed back into a grading request.
  const revealAll =
    recorded.progress.quizPassed === true ||
    (recorded.progress.quizAttempts ?? 0) >= MAX_QUIZ_ATTEMPTS
  const perQuestion: QuizQuestionGrade[] = graded.map((g) =>
    g.correct || revealAll
      ? g
      : { questionId: g.questionId, correct: false }
  )

  return {
    score,
    passed,
    passMark,
    perQuestion,
    progress: recorded.progress,
  }
}
