/**
 * Effective-syllabus resolution (N6; design 05 sections 2 + 2.3).
 *
 * One deterministic lookup decides which syllabus EDITION a request's user
 * is on, first hit wins:
 *
 *   1. `org_membership.edition_id` — the per-member override — if it is
 *      `live` and belongs to this course (and, per migration 017's guard, to
 *      the member's own org or to GWTH globally);
 *   2. the member's org's `is_org_default` edition for this course, if live;
 *   3. the global `is_default` edition for the course (`gwth-default`);
 *   4. defensively, NO edition at all — the raw lessons table exactly as
 *      before editions existed, so a broken seed can never blank the product.
 *
 * V1 simplification (decision 1, 2026-08-28): one org per learner. The
 * membership query takes the earliest `created_at` row if several exist
 * (possible for admins/tutors, who may span orgs).
 *
 * Everything here is server-only (it reaches the DB and, via
 * `resolveDataMode`, the auth cookies) and `cache()`-wrapped so the lesson
 * catalogue, the score denominator and the grading pass mark share one
 * resolution per request. Mock mode (no DATABASE_URL) always resolves to the
 * fallback: the mock catalogue predates editions and must keep working
 * byte-identically.
 */
import { cache } from "react"
import { and, asc, eq } from "drizzle-orm"
import { getDb } from "@/db"
import {
  courses,
  editionLessons,
  lessons,
  orgMembership,
  syllabusEdition,
} from "@/db/schema"
import { QUIZ_PASS_SCORE } from "@/lib/progress/completion"
import { mockLessons } from "./mock-data"
import { resolveDataMode } from "./mode"

/** The single production course's slug (see mock-data.ts / import route). */
export const GWTH_COURSE_SLUG = "applied-ai-skills"

/** Per-lesson metadata carried by the resolved edition. */
export type EditionLessonEntry = {
  /** Who sees it: core/optional to all edition members, exclusive = org-only content */
  tier: "core" | "optional" | "exclusive"
  /** C4 ratification workflow: draft lessons are invisible to learners */
  state: "draft" | "ratified"
  /** Whether the lesson counts toward the baseline and the score denominator */
  isMandatory: boolean
  /** Edition-controlled ordering (backfill: month*1000 + order) */
  sortOrder: number
}

/** How the effective edition was chosen (rungs 1-4 above). */
export type EditionSource =
  | "member-override"
  | "org-default"
  | "global-default"
  | "fallback"

/** The resolved syllabus for the current request's user. */
export type EffectiveEdition = {
  /** The chosen edition id, or null on the raw-lessons fallback */
  editionId: string | null
  /** Owning organisation (null = GWTH global) */
  organisationId: string | null
  /** The pass mark quizzes are graded against (decision 4: one per edition) */
  passMark: number
  /** Co-brand label for the lesson viewer / credential, when the edition has one */
  coBrandLabel: string | null
  /** Which rung matched */
  source: EditionSource
  /**
   * Lesson id -> edition metadata. `null` means NO edition filtering: serve
   * the raw lesson set exactly as before editions existed (rung 4).
   */
  lessons: Map<string, EditionLessonEntry> | null
}

/** The rung-4 fallback: raw lessons, default pass mark, no filtering. */
const FALLBACK_EDITION: EffectiveEdition = {
  editionId: null,
  organisationId: null,
  passMark: QUIZ_PASS_SCORE,
  coBrandLabel: null,
  source: "fallback",
  lessons: null,
}

/** The syllabus_edition columns the resolver needs. */
const editionColumns = {
  id: syllabusEdition.id,
  organisationId: syllabusEdition.organisationId,
  passMark: syllabusEdition.passMark,
  coBrandLabel: syllabusEdition.coBrandLabel,
}

type EditionRow = {
  id: string
  organisationId: string | null
  passMark: number
  coBrandLabel: string | null
}

/**
 * Loads the chosen edition's lesson map and assembles the result.
 *
 * Empty-edition policy (QA round-1 defect 3): a live ORG-scoped edition
 * (member override or org default) with zero lesson rows resolves to an
 * EMPTY catalogue - failing closed, because falling back to the raw lessons
 * table would hand that org's learners the entire catalogue, other
 * institutions' exclusive and draft content included, the moment an admin
 * creates an edition before attaching lessons. Only the GLOBAL default
 * degrades to the raw fallback when empty: for B2C the raw table IS the
 * intended full syllabus (gwth-default mirrors it), so a broken seed there
 * must keep the product alive rather than blank it.
 */
async function assembleEdition(
  row: EditionRow,
  source: Exclude<EditionSource, "fallback">
): Promise<EffectiveEdition> {
  const db = getDb()
  const rows = await db
    .select({
      lessonId: editionLessons.lessonId,
      tier: editionLessons.tier,
      state: editionLessons.state,
      isMandatory: editionLessons.isMandatory,
      sortOrder: editionLessons.sortOrder,
    })
    .from(editionLessons)
    .where(eq(editionLessons.editionId, row.id))

  if (rows.length === 0 && source === "global-default") return FALLBACK_EDITION

  const map = new Map<string, EditionLessonEntry>()
  for (const r of rows) {
    map.set(r.lessonId, {
      tier: r.tier as EditionLessonEntry["tier"],
      state: r.state as EditionLessonEntry["state"],
      isMandatory: r.isMandatory,
      sortOrder: r.sortOrder,
    })
  }

  return {
    editionId: row.id,
    organisationId: row.organisationId,
    passMark: row.passMark,
    coBrandLabel: row.coBrandLabel,
    source,
    lessons: map,
  }
}

/**
 * Resolves the effective edition for the current request's user on the given
 * course. `cache()`-wrapped: one resolution per (request, course).
 *
 * Anonymous users resolve to the global default (rung 3) — the same syllabus
 * a fresh B2C account gets — and mock mode resolves to the raw fallback.
 */
export const getEffectiveEdition = cache(async function getEffectiveEdition(
  courseSlug: string = GWTH_COURSE_SLUG
): Promise<EffectiveEdition> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") return FALLBACK_EDITION

  const db = getDb()
  const courseRows = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, courseSlug))
    .limit(1)
  const courseId = courseRows[0]?.id
  if (!courseId) return FALLBACK_EDITION

  if (mode.kind === "user") {
    // Which membership governs the user's syllabus (QA round-2 defect 7):
    // their LEARNER membership when one exists - decision 1's partial
    // unique index guarantees at most one platform-wide, and learning is
    // what an edition curates. Only a user with NO learner seat anywhere
    // (staff: owner/admin/tutor, who may span orgs) falls back to the
    // earliest membership, so a tutor-in-A who later becomes a learner in
    // B is served B's edition, pass mark and denominator - never A's.
    const memberships = await db
      .select({
        organisationId: orgMembership.organizationId,
        editionId: orgMembership.editionId,
        role: orgMembership.role,
      })
      .from(orgMembership)
      .where(eq(orgMembership.userId, mode.userId))
      .orderBy(asc(orgMembership.createdAt))
    const membership =
      memberships.find((m) => m.role === "learner") ?? memberships[0]

    if (membership) {
      // Rung 1: per-member override, if live and on this course. Migration
      // 017's trigger guarantees it belongs to the member's org or is
      // global; the ownership predicate here is defence in depth.
      if (membership.editionId) {
        const override = await db
          .select(editionColumns)
          .from(syllabusEdition)
          .where(
            and(
              eq(syllabusEdition.id, membership.editionId),
              eq(syllabusEdition.status, "live"),
              eq(syllabusEdition.courseId, courseId)
            )
          )
          .limit(1)
        const row = override[0]
        if (
          row &&
          (row.organisationId === null ||
            row.organisationId === membership.organisationId)
        ) {
          return assembleEdition(row, "member-override")
        }
      }

      // Rung 2: the org's default edition for this course, if live.
      const orgDefault = await db
        .select(editionColumns)
        .from(syllabusEdition)
        .where(
          and(
            eq(syllabusEdition.organisationId, membership.organisationId),
            eq(syllabusEdition.isOrgDefault, true),
            eq(syllabusEdition.status, "live"),
            eq(syllabusEdition.courseId, courseId)
          )
        )
        .limit(1)
      if (orgDefault[0]) return assembleEdition(orgDefault[0], "org-default")
    }
  }

  // Rung 3: the global default (B2C users, org members whose org has no
  // live edition, and anonymous requests).
  const globalDefault = await db
    .select(editionColumns)
    .from(syllabusEdition)
    .where(
      and(
        eq(syllabusEdition.isDefault, true),
        eq(syllabusEdition.status, "live"),
        eq(syllabusEdition.courseId, courseId)
      )
    )
    .limit(1)
  if (globalDefault[0]) return assembleEdition(globalDefault[0], "global-default")

  // Rung 4: no live default edition — serve the raw lessons table.
  return FALLBACK_EDITION
})

/**
 * The lesson ids that count toward the current user's baseline and GWTH
 * Score denominator: the effective edition's `is_mandatory AND ratified`
 * rows, or — on the fallback — every non-optional lesson of the course,
 * which is exactly what the pre-edition score assumed.
 */
export const getMandatoryLessonIds = cache(
  async function getMandatoryLessonIds(
    courseSlug: string = GWTH_COURSE_SLUG
  ): Promise<Set<string>> {
    const edition = await getEffectiveEdition(courseSlug)
    if (edition.lessons) {
      const ids = new Set<string>()
      for (const [lessonId, entry] of edition.lessons) {
        if (entry.isMandatory && entry.state === "ratified") ids.add(lessonId)
      }
      return ids
    }

    const mode = await resolveDataMode()
    if (mode.kind !== "mock") {
      const db = getDb()
      const rows = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(
          and(eq(lessons.courseSlug, courseSlug), eq(lessons.isOptional, false))
        )
      return new Set(rows.map((r) => r.id))
    }

    return new Set(
      mockLessons
        .filter((l) => l.courseSlug === courseSlug && !l.isOptional)
        .map((l) => l.id)
    )
  }
)

/**
 * The per-learner mandatory-lesson count — the GWTH Score denominator
 * (replaces the old hardcoded 64 in `calculateGwthScore`).
 */
export async function getMandatoryLessonCount(
  courseSlug: string = GWTH_COURSE_SLUG
): Promise<number> {
  return (await getMandatoryLessonIds(courseSlug)).size
}

/**
 * The pass mark quiz submissions are graded against for the current user
 * (decision 4: one pass mark per edition; the fallback keeps the historic
 * QUIZ_PASS_SCORE = 67 so nothing changes for B2C until an edition says so).
 */
export async function getEffectivePassMark(
  courseSlug: string = GWTH_COURSE_SLUG
): Promise<number> {
  return (await getEffectiveEdition(courseSlug)).passMark
}

/**
 * True when the effective edition includes this lesson for LEARNER eyes:
 * present in the edition and ratified. On the fallback (no edition), every
 * lesson is visible — exactly the pre-edition behaviour.
 *
 * Draft-state rows are excluded for EVERYONE in v1, org admins and tutors
 * included: the ratification queue is an admin surface (N7), and showing an
 * unratified draft in the learner catalogue without badging would leak
 * content the institution has not signed off.
 */
export function isLessonInEdition(
  edition: EffectiveEdition,
  lessonId: string
): boolean {
  if (!edition.lessons) return true
  const entry = edition.lessons.get(lessonId)
  return Boolean(entry && entry.state === "ratified")
}

/**
 * Filters a list of lesson-shaped rows to the effective edition and orders
 * it by the edition's `sort_order` (the gwth-default backfill wrote
 * month*1000 + order, so the default edition's order is byte-identical to
 * the historic (month, order) query). On the fallback the rows pass through
 * untouched, order included.
 */
export function filterLessonsByEdition<T extends { id: string }>(
  rows: T[],
  edition: EffectiveEdition
): T[] {
  if (!edition.lessons) return rows
  const map = edition.lessons
  return rows
    .filter((row) => isLessonInEdition(edition, row.id))
    .sort(
      (a, b) => (map.get(a.id)?.sortOrder ?? 0) - (map.get(b.id)?.sortOrder ?? 0)
    )
}
