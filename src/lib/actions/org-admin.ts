"use server"

/**
 * Server Actions for the institution admin screens (N7).
 *
 * The three things design 05 and the CIPD calls asked for, in one place:
 *   1. switch an OPTIONAL lesson in or out of the edition (Ben's "employer
 *      picks optional lessons"),
 *   2. ratify a draft exclusive lesson, or send it back for changes,
 *   3. set the edition's pass mark (Ben: "could we set like a pass mark for
 *      students?"), which N6's grading already reads.
 *
 * TRUST BOUNDARY. Everything arriving here is attacker-controlled — an org
 * admin id, an edition id and a lesson id are all just strings from a form.
 * Every action therefore re-derives the caller's authority from the session
 * (`resolveEditionEditor()`), never from its arguments, and then checks that
 * the edition it is about to write is the one that caller's organisation owns.
 * A tutor is read-only, a learner is not staff at all, and the fixture preview
 * mode refuses every write. The action ids are validated as strings and used
 * only in parameterised Drizzle predicates.
 *
 * The pass mark needs no change in N6: `getEffectiveEdition()` reads
 * `syllabus_edition.pass_mark` per request, so the next quiz submission is
 * graded against the new number.
 */
import { revalidatePath } from "next/cache"
import { and, eq, isNotNull, isNull, ne, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { editionLessons, lessons, syllabusEdition } from "@/db/schema"
import { alias } from "drizzle-orm/pg-core"
import {
  resolveEditionEditor,
  type OrgEdition,
  type OrgStaffContext,
} from "@/lib/data/org-admin"
import {
  editionLessonDecisionSchema,
  editionLessonToggleSchema,
  editionPassMarkSchema,
} from "@/lib/validations"

/** What every action returns; the client renders `message` in a toast. */
export type OrgAdminActionResult = {
  ok: boolean
  message: string
}

/** Refusals are uniform: never leak whether an id exists to a non-editor. */
const NOT_YOURS =
  "That lesson is not part of your organisation's edition."

/**
 * Resolves the caller as an editor AND pins the edition they may write: the
 * one their organisation owns. An `editionId` from the form is accepted only
 * when it EQUALS that edition, so a forged id cannot reach another
 * institution's syllabus even though the row-level FKs would happily allow it.
 */
async function authoriseEdition(
  editionId: string
): Promise<
  | { ok: true; context: OrgStaffContext; edition: OrgEdition }
  | { ok: false; message: string }
> {
  const editor = await resolveEditionEditor()
  if (!editor.ok) return editor
  if (editor.edition.id !== editionId) {
    return { ok: false, message: NOT_YOURS }
  }
  return editor
}

/**
 * Switches a lesson in or out of the institution's edition.
 *
 * ONLY OPTIONAL lessons are switchable here (QA round-1 defects 7 + 8).
 *
 * - CORE is the GWTH course itself (D-N7-3): an edition without the spine is
 *   not the course the credential attests to, so the picker renders it locked
 *   and this action refuses it even if the form is forged.
 * - EXCLUSIVE is governed by the ratification queue, not by a checkbox.
 *   Removing an exclusive row would delete its tier, its decision audit and
 *   the institution's review note with no way back, and re-adding it would
 *   reclassify it as an ordinary optional lesson and publish it to learners
 *   without the sign-off it exists to require. Refused outright; the queue is
 *   where an institution accepts or rejects that content.
 *
 * @param editionId The edition being edited (must be the caller's own).
 * @param lessonId The lesson to switch.
 * @param included True to include it in the edition, false to remove it.
 */
export async function setEditionLessonIncludedAction(
  editionId: string,
  lessonId: string,
  included: boolean
): Promise<OrgAdminActionResult> {
  const parsed = editionLessonToggleSchema.safeParse({
    editionId,
    lessonId,
    included,
  })
  if (!parsed.success) return { ok: false, message: "Invalid request." }

  const auth = await authoriseEdition(parsed.data.editionId)
  if (!auth.ok) return { ok: false, message: auth.message }
  const { context } = auth

  const db = getDb()
  const lessonRows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      isOptional: lessons.isOptional,
      month: lessons.month,
      order: lessons.order,
      courseId: lessons.courseId,
    })
    .from(lessons)
    .where(eq(lessons.id, parsed.data.lessonId))
    .limit(1)
  const lesson = lessonRows[0]
  // The lesson must belong to the course this edition wraps (N5 QA style
  // note 2: edition_lessons does not enforce that in SQL).
  if (!lesson || lesson.courseId !== context.courseId) {
    return { ok: false, message: NOT_YOURS }
  }

  const existing = await db
    .select({ tier: editionLessons.tier })
    .from(editionLessons)
    .where(
      and(
        eq(editionLessons.editionId, auth.edition.id),
        eq(editionLessons.lessonId, lesson.id)
      )
    )
    .limit(1)

  // A lesson with no row in this edition is only addable if it is actually
  // OFFERED to this organisation (QA round-4 defect 6). Without this the
  // tier fell back to lessons.is_optional, so a forged post carrying another
  // institution's exclusive lesson id resolved to "optional" and was inserted
  // ratified — publishing their content to the wrong learners. The picker
  // applies the same rule, so this closes the API door the UI already closes.
  if (!existing[0]) {
    const otherOrgEdition = alias(syllabusEdition, "other_org_edition")
    const claimed = await db
      .select({ one: editionLessons.id })
      .from(editionLessons)
      .innerJoin(
        otherOrgEdition,
        eq(otherOrgEdition.id, editionLessons.editionId)
      )
      .where(
        and(
          eq(editionLessons.lessonId, lesson.id),
          eq(editionLessons.tier, "exclusive"),
          sql`${otherOrgEdition.organisationId} IS DISTINCT FROM ${context.organisationId}`
        )
      )
      .limit(1)
    if (claimed[0]) return { ok: false, message: NOT_YOURS }
  }

  const currentTier = existing[0]?.tier ?? (lesson.isOptional ? "optional" : "core")

  // Core belongs in every edition, so REMOVING it is refused (D-N7-3) but
  // ADDING a missing one is the repair path (QA round-2 defect 5): a core
  // lesson GWTH publishes after an edition was provisioned lands only in
  // gwth-default, and without this the institution could never take it.
  if (currentTier === "core" && !parsed.data.included) {
    return {
      ok: false,
      message:
        "Core lessons are part of every edition of this course and cannot be switched off.",
    }
  }
  if (currentTier === "exclusive") {
    return {
      ok: false,
      message:
        "Lessons written for your edition are managed on the ratification screen, so their sign-off history is never lost.",
    }
  }

  if (!parsed.data.included) {
    await db
      .delete(editionLessons)
      .where(
        and(
          eq(editionLessons.editionId, auth.edition.id),
          eq(editionLessons.lessonId, lesson.id)
        )
      )
    revalidateOrg()
    return { ok: true, message: `Removed "${lesson.title}" from your edition.` }
  }

  await db
    .insert(editionLessons)
    .values({
      editionId: auth.edition.id,
      lessonId: lesson.id,
      tier: currentTier,
      state: "ratified",
      // Core lessons count toward the baseline by default, exactly as the
      // gwth-default backfill has them; an optional one starts as extra and
      // the institution opts it in.
      isMandatory: currentTier === "core",
      sortOrder: lesson.month * 1000 + lesson.order,
    })
    .onConflictDoNothing({
      target: [editionLessons.editionId, editionLessons.lessonId],
    })
  revalidateOrg()
  return { ok: true, message: `Added "${lesson.title}" to your edition.` }
}

/**
 * Sets whether an included lesson counts toward the baseline and the GWTH
 * Score denominator (decision 2, 2026-08-28: the institution admin decides
 * `is_mandatory` per lesson, and may raise their students' mandatory count
 * above the GWTH default's).
 *
 * CORE lessons are excluded from that discretion (QA round-3 defect 8). This
 * is the same rule D-N7-3 enforces on the include action, arriving by the
 * other door: an admin who could set every core lesson to "does not count"
 * would leave a baseline — and therefore a GWTH credential — that attests
 * only to their own optional picks.
 */
export async function setEditionLessonMandatoryAction(
  editionId: string,
  lessonId: string,
  isMandatory: boolean
): Promise<OrgAdminActionResult> {
  const parsed = editionLessonToggleSchema.safeParse({
    editionId,
    lessonId,
    included: isMandatory,
  })
  if (!parsed.success) return { ok: false, message: "Invalid request." }

  const auth = await authoriseEdition(parsed.data.editionId)
  if (!auth.ok) return { ok: false, message: auth.message }

  const updated = await getDb()
    .update(editionLessons)
    .set({ isMandatory: parsed.data.included })
    .where(
      and(
        eq(editionLessons.editionId, auth.edition.id),
        eq(editionLessons.lessonId, parsed.data.lessonId),
        ne(editionLessons.tier, "core")
      )
    )
    .returning({ lessonId: editionLessons.lessonId })
  if (updated.length === 0) {
    return {
      ok: false,
      message:
        "Core lessons always count toward the baseline, so that a GWTH credential means the same thing on every edition.",
    }
  }

  revalidateOrg()
  return {
    ok: true,
    message: parsed.data.included
      ? "Counts toward the baseline."
      : "No longer counts toward the baseline.",
  }
}

/**
 * Ratifies a draft lesson, or sends it back to GWTH for changes.
 *
 * D-N7-2: "send back" is `state='draft'` PLUS a review note, not a third
 * state — so N6's learner-visibility rule (ratified only) needs no change and
 * `edition_lessons_state_check` stays as shipped. Ratifying clears the note.
 *
 * @param editionId The edition being edited (must be the caller's own).
 * @param lessonId The draft lesson being decided.
 * @param decision "ratify" or "send-back".
 * @param note Why it is being sent back (required for "send-back").
 * @param sawReviewNote What the screen showed when the button was pressed:
 *   true if the card carried a review note ("back with GWTH"), false if it
 *   did not ("waiting on you"). This is an optimistic-concurrency check (QA
 *   round-3 defect 9): two admins on the same draft could otherwise have one
 *   request changes and the other's stale ratify silently clear that note and
 *   publish the unchanged lesson. A decision taken against a view of the row
 *   that no longer holds matches nothing and is reported, not applied.
 */
export async function decideEditionLessonAction(
  editionId: string,
  lessonId: string,
  decision: "ratify" | "send-back",
  note?: string,
  sawReviewNote = false
): Promise<OrgAdminActionResult> {
  const parsed = editionLessonDecisionSchema.safeParse({
    editionId,
    lessonId,
    decision,
    note,
  })
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Invalid request.",
    }
  }

  const auth = await authoriseEdition(parsed.data.editionId)
  if (!auth.ok) return { ok: false, message: auth.message }
  const { context } = auth

  const ratifying = parsed.data.decision === "ratify"
  // Two predicates carry the safety here, and neither is optional.
  //
  // tier='exclusive' (QA round-1 defect 6): without it a forged send-back
  // against a CORE lesson would set state='draft', and since learners see
  // ratified rows only, a core lesson of the credentialed course would
  // vanish from every learner's syllabus.
  //
  // state='draft' (QA round-2 defect 2): a decision only ever moves a lesson
  // OUT of the queue. Without it, a stale tab could send back a lesson a
  // colleague ratified minutes ago and silently unpublish live content.
  //
  // review-note match (QA round-3 defect 9): the row must still be in the
  // half of the queue the caller was looking at, so a stale ratify cannot
  // wipe out a colleague's just-recorded request for changes.
  //
  // A decision that no longer matches is reported, never applied.
  const updated = await getDb()
    .update(editionLessons)
    .set({
      state: ratifying ? "ratified" : "draft",
      reviewNote: ratifying ? null : (parsed.data.note ?? null),
      decidedAt: new Date().toISOString(),
      decidedBy: context.userId,
    })
    .where(
      and(
        eq(editionLessons.editionId, auth.edition.id),
        eq(editionLessons.lessonId, parsed.data.lessonId),
        eq(editionLessons.tier, "exclusive"),
        eq(editionLessons.state, "draft"),
        // The row must still look the way the screen showed it.
        sawReviewNote
          ? isNotNull(editionLessons.reviewNote)
          : isNull(editionLessons.reviewNote)
      )
    )
    .returning({ lessonId: editionLessons.lessonId })
  if (updated.length === 0) {
    return {
      ok: false,
      message:
        "That lesson is no longer waiting for a decision. Reload the page to see where it got to.",
    }
  }

  revalidateOrg()
  return {
    ok: true,
    message: ratifying
      ? "Ratified. Your learners can see this lesson now."
      : "Sent back to GWTH with your note. It stays hidden from learners.",
  }
}

/**
 * Sets the edition's pass mark (decision 4: one per edition).
 *
 * Threads straight through to N6 with no further change: grading resolves
 * `syllabus_edition.pass_mark` per request via `getEffectiveEdition()`, so the
 * next submission is graded against the new number. A learner who has ALREADY
 * passed keeps their pass — `lesson_progress.quiz_passed` is the persisted
 * verdict and N6 honours it, so raising the bar does not retroactively fail
 * anyone (which is why this action does not touch progress rows).
 */
export async function setEditionPassMarkAction(
  editionId: string,
  passMark: number
): Promise<OrgAdminActionResult> {
  const parsed = editionPassMarkSchema.safeParse({ editionId, passMark })
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "The pass mark must be a whole number between 0 and 100.",
    }
  }

  const auth = await authoriseEdition(parsed.data.editionId)
  if (!auth.ok) return { ok: false, message: auth.message }

  await getDb()
    .update(syllabusEdition)
    .set({ passMark: parsed.data.passMark })
    .where(eq(syllabusEdition.id, auth.edition.id))

  revalidateOrg()
  return {
    ok: true,
    message: `Pass mark set to ${parsed.data.passMark}%. It applies to the next quiz your learners submit; anyone who has already passed keeps their pass.`,
  }
}

/**
 * Re-renders every /org screen after a write. They are `force-dynamic`, but
 * revalidating the segment also drops any cached RSC payload the client
 * router is holding, so the picker and the queue agree immediately.
 */
function revalidateOrg(): void {
  revalidatePath("/org", "layout")
}
