/**
 * Institution admin data layer (N7; design 05 section 4 "tutor/admin
 * visibility queries", cohortless v1).
 *
 * Everything an institution's staff sees on /org is read here, and every read
 * is filtered to ONE organisation — the one the signed-in staff member
 * belongs to. There is no cross-org query in this module by construction:
 * `resolveOrgStaffContext()` is the only entry point, it derives the
 * organisation from the caller's own `org_membership` row, and every
 * subsequent function takes that resolved context rather than an id from the
 * request. What CIPD sees is CIPD's org; GWTH platform staff keep the
 * separate `/admin` surface on the ADMIN_EMAILS allowlist (src/lib/admin.ts),
 * which this module never consults.
 *
 * Roles (013 CHECK / src/lib/org-roles.ts):
 *   owner  — GWTH, on institution orgs we provision. Full staff access.
 *   admin  — the institution admin. Reads everything, WRITES the edition
 *            (lesson picker, ratification, pass mark).
 *   tutor  — read-only roster visibility (Steve's flow). No writes.
 *   learner— not staff. /org redirects them to their dashboard, and the
 *            Better Auth roster endpoints refuse them (N7 roster privacy,
 *            src/lib/org-roster-privacy.ts).
 *
 * Mock/preview mode: like every user-scoped read in this codebase, a
 * SESSIONLESS request in a mock environment (`isSessionlessMockRequest()` —
 * no DATABASE_URL, or the ENABLE_DEV_MOCK_USER staging review env, and NO
 * session cookie presented) resolves to fixtures so the screens can be
 * reviewed and screenshotted without seeding an institution. A request that
 * presents a session cookie always validates for real, so a forged cookie
 * gets the production path and bounces. Fixture rows are clearly labelled as
 * a preview on screen and every WRITE refuses in this mode.
 */
import "server-only"
import { cache } from "react"
import { and, asc, eq, inArray, sql } from "drizzle-orm"
import { redirect } from "next/navigation"
import { getDb } from "@/db"
import {
  courses,
  editionLessons,
  lessonProgress,
  lessons,
  organisation,
  orgMembership,
  syllabusEdition,
  user as userTable,
} from "@/db/schema"
import { getCurrentUser } from "@/lib/auth"
import {
  canEditEdition,
  isOrgStaffRole,
  type OrgEdition,
  type EditionSyllabusEntry,
  type OrgLessonCompletionRow,
  type OrgRosterRow,
  type OrgStaffContext,
} from "@/lib/org-admin-policy"
import { isSessionlessMockRequest } from "@/lib/content-access"
import { GWTH_COURSE_SLUG } from "@/lib/data/editions"
import {
  MOCK_ORG_ADMIN_CONTEXT,
  mockEditionSyllabus,
  mockOrgLessonCompletion,
  mockOrgRoster,
} from "@/lib/data/org-admin-fixtures"

// The role policy and every shape /org renders live in the pure module
// src/lib/org-admin-policy.ts (this one is `server-only`, so the rules would
// otherwise be untestable without a database). Re-exported here so pages and
// actions have ONE import for the institution admin layer.
export { canEditEdition, summariseRoster } from "@/lib/org-admin-policy"
export type {
  EditionSyllabusEntry,
  OrgEdition,
  OrgStaffContext,
} from "@/lib/org-admin-policy"

/**
 * Resolves the caller's staff context, or null when they are not org staff.
 *
 * Precedence when a user staffs more than one org (possible for owner/admin/
 * tutor; learners are capped at one org platform-wide by decision 1's partial
 * unique index): the earliest membership, matching `getEffectiveEdition`'s
 * tie-break so the two layers never disagree about which org a person is in.
 *
 * `cache()`-wrapped: the layout gate, the nav and the page body share one
 * resolution per request.
 */
export const resolveOrgStaffContext = cache(
  async function resolveOrgStaffContext(): Promise<OrgStaffContext | null> {
    if (await isSessionlessMockRequest()) return MOCK_ORG_ADMIN_CONTEXT

    const currentUser = await getCurrentUser()
    if (!currentUser) return null

    const db = getDb()
    const memberships = await db
      .select({
        role: orgMembership.role,
        organisationId: orgMembership.organizationId,
        organisationName: organisation.name,
        organisationType: organisation.type,
      })
      .from(orgMembership)
      .innerJoin(organisation, eq(organisation.id, orgMembership.organizationId))
      .where(eq(orgMembership.userId, currentUser.id))
      .orderBy(asc(orgMembership.createdAt))

    const staff = memberships.find((m) => isOrgStaffRole(m.role))
    if (!staff) return null

    const courseRows = await db
      .select({ id: courses.id, title: courses.title })
      .from(courses)
      .where(eq(courses.slug, GWTH_COURSE_SLUG))
      .limit(1)
    const course = courseRows[0]
    if (!course) return null

    // The org's own default edition for the course. An org with no edition
    // yet has nothing to curate: /org SAYS SO (QA round-1 defect 11) rather
    // than bouncing a real admin to the learner dashboard — and it never
    // falls back to the GLOBAL default, which would change every B2C
    // learner's syllabus.
    const editionRows = await db
      .select({
        id: syllabusEdition.id,
        name: syllabusEdition.name,
        status: syllabusEdition.status,
        coBrandLabel: syllabusEdition.coBrandLabel,
        passMark: syllabusEdition.passMark,
      })
      .from(syllabusEdition)
      .where(
        and(
          eq(syllabusEdition.organisationId, staff.organisationId),
          eq(syllabusEdition.isOrgDefault, true),
          eq(syllabusEdition.courseId, course.id)
        )
      )
      .limit(1)
    const edition = editionRows[0]

    return {
      userId: currentUser.id,
      userName: currentUser.name,
      role: staff.role as OrgStaffContext["role"],
      organisationId: staff.organisationId,
      organisationName: staff.organisationName,
      organisationType: staff.organisationType,
      edition: edition
        ? {
            id: edition.id,
            name: edition.name,
            status: edition.status as NonNullable<
              OrgStaffContext["edition"]
            >["status"],
            coBrandLabel: edition.coBrandLabel,
            passMark: edition.passMark,
          }
        : null,
      courseId: course.id,
      courseTitle: course.title,
      isPreview: false,
    }
  }
)

/**
 * Page-level gate for every /org page, mirroring `requireAdminOrRedirect()`
 * (src/lib/admin.ts): App Router renders a page IN PARALLEL with its layout,
 * so a layout redirect alone does not stop the page's RSC payload — this org's
 * roster — from streaming to an anonymous request. Every /org page therefore
 * calls this FIRST, before any data read.
 *
 * Anonymous → /login; signed in but not org staff → /dashboard.
 * `src/app/protected-page-gates.test.ts` fails the build if a page under /org
 * is missing this call.
 */
export async function requireOrgStaffOrRedirect(): Promise<OrgStaffContext> {
  const context = await resolveOrgStaffContext()
  if (context) return context
  if (await getCurrentUser()) redirect("/dashboard")
  redirect("/login")
}

/**
 * The same gate for writes: additionally refuses tutors (read-only) and the
 * fixture preview (nothing to write to). Returns the reason instead of
 * throwing so server actions can hand the caller an honest message.
 */
export async function resolveEditionEditor(): Promise<
  | { ok: true; context: OrgStaffContext; edition: OrgEdition }
  | { ok: false; message: string }
> {
  const context = await resolveOrgStaffContext()
  if (!context) {
    return { ok: false, message: "Sign in as an organisation admin to change this." }
  }
  if (context.isPreview) {
    return {
      ok: false,
      message:
        "Preview mode: this screen is showing example data, so changes are not saved.",
    }
  }
  if (!canEditEdition(context.role)) {
    return {
      ok: false,
      message: "Tutors have read-only access. Ask an organisation admin to change this.",
    }
  }
  if (!context.edition) {
    return {
      ok: false,
      message:
        "Your organisation does not have an edition yet. GWTH creates it before you can curate a syllabus.",
    }
  }
  return { ok: true, context, edition: context.edition }
}

/**
 * The syllabus the institution curates: every lesson of the course, joined to
 * this edition's row where one exists. Lessons with no edition row are
 * switched OFF (they exist in the GWTH catalogue but not in this edition).
 *
 * Ordered by the edition's `sort_order` where present, then by the course's
 * own (month, order) for lessons that are switched off — so a lesson does not
 * jump position when it is toggled.
 */
export async function getEditionSyllabus(
  context: OrgStaffContext
): Promise<EditionSyllabusEntry[]> {
  if (context.isPreview) return mockEditionSyllabus()
  if (!context.edition) return []

  const db = getDb()
  const rows = await db
    .select({
      lessonId: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      month: lessons.month,
      isOptional: lessons.isOptional,
      lessonOrder: lessons.order,
      tier: editionLessons.tier,
      state: editionLessons.state,
      isMandatory: editionLessons.isMandatory,
      sortOrder: editionLessons.sortOrder,
      reviewNote: editionLessons.reviewNote,
      decidedAt: editionLessons.decidedAt,
    })
    .from(lessons)
    .leftJoin(
      editionLessons,
      and(
        eq(editionLessons.lessonId, lessons.id),
        eq(editionLessons.editionId, context.edition.id)
      )
    )
    .where(eq(lessons.courseId, context.courseId))

  return rows
    .map((row) => {
      const included = row.tier !== null
      // A lesson with no edition row is off; its would-be tier is what the
      // GWTH catalogue says (is_optional), which is also what switching it
      // back on will write.
      const tier = (row.tier ??
        (row.isOptional ? "optional" : "core")) as EditionSyllabusEntry["tier"]
      return {
        lessonId: row.lessonId,
        title: row.title,
        slug: row.slug,
        month: row.month,
        included,
        tier,
        state: (row.state ?? "ratified") as EditionSyllabusEntry["state"],
        isMandatory: row.isMandatory ?? !row.isOptional,
        sortOrder: row.sortOrder ?? row.month * 1000 + row.lessonOrder,
        reviewNote: row.reviewNote,
        decidedAt: row.decidedAt,
        locked: tier === "core",
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * The ratification queue (design 05 Q4): this edition's DRAFT lessons —
 * GWTH-authored exclusives awaiting the institution's sign-off, plus anything
 * the institution has sent back for changes (draft + a review note).
 */
export async function getRatificationQueue(
  context: OrgStaffContext
): Promise<EditionSyllabusEntry[]> {
  const syllabus = await getEditionSyllabus(context)
  return syllabus.filter((entry) => entry.included && entry.state === "draft")
}

/**
 * The roster (design 05 Q1): one row per LEARNER of this organisation, with
 * their progress against the mandatory, ratified lessons of the edition they
 * actually resolve to.
 *
 * Scoping note: mandatory totals come from THIS org's edition. A member with
 * a per-member edition override is rare (design 2.1 rung 1) and would be
 * measured against the org default here; v1 accepts that, and the number is
 * labelled "of the CIPD baseline" on screen rather than "of their syllabus".
 */
export async function getOrgRoster(
  context: OrgStaffContext
): Promise<OrgRosterRow[]> {
  if (context.isPreview) return mockOrgRoster()
  if (!context.edition) return []

  const db = getDb()
  const mandatory = await db
    .select({ lessonId: editionLessons.lessonId })
    .from(editionLessons)
    .where(
      and(
        eq(editionLessons.editionId, context.edition.id),
        eq(editionLessons.isMandatory, true),
        eq(editionLessons.state, "ratified")
      )
    )
  const mandatoryIds = mandatory.map((row) => row.lessonId)

  const members = await db
    .select({
      userId: orgMembership.userId,
      name: userTable.name,
      email: userTable.email,
    })
    .from(orgMembership)
    .innerJoin(userTable, eq(userTable.id, orgMembership.userId))
    .where(
      and(
        eq(orgMembership.organizationId, context.organisationId),
        eq(orgMembership.role, "learner")
      )
    )
  if (members.length === 0) return []

  const memberIds = members.map((m) => m.userId)

  // One aggregate over the learners' progress rows, restricted to the
  // edition's mandatory lessons. Empty mandatory set => no progress rows,
  // and every learner reads 0 of 0 with baselineMet false (a baseline nobody
  // can meet is honest: the institution has not chosen a syllabus yet).
  const progressRows = mandatoryIds.length
    ? await db
        .select({
          userId: lessonProgress.userId,
          isCompleted: lessonProgress.isCompleted,
          quizPassed: lessonProgress.quizPassed,
          bestQuizScore: lessonProgress.bestQuizScore,
        })
        .from(lessonProgress)
        .where(
          and(
            inArray(lessonProgress.userId, memberIds),
            inArray(lessonProgress.lessonId, mandatoryIds)
          )
        )
    : []

  // Activity is ALL activity (QA round-1 defect 13). Scoping "last active" to
  // the mandatory set reported a learner who spent today on an optional
  // lesson as weeks idle, which is exactly the wrong signal for a tutor.
  const activityRows = await db
    .select({
      userId: lessonProgress.userId,
      lastActive: sql<string | null>`max(${lessonProgress.lastAccessedAt})`,
    })
    .from(lessonProgress)
    .where(inArray(lessonProgress.userId, memberIds))
    .groupBy(lessonProgress.userId)
  const lastActiveByUser = new Map(
    activityRows.map((row) => [row.userId, row.lastActive])
  )

  const byUser = new Map<
    string,
    { done: number; baseline: number; scores: number[] }
  >()
  for (const row of progressRows) {
    const acc = byUser.get(row.userId) ?? { done: 0, baseline: 0, scores: [] }
    if (row.isCompleted) acc.done += 1
    // Baseline is design 05 Q1's definition verbatim: completed AND passed.
    if (row.isCompleted && row.quizPassed) acc.baseline += 1
    // The average is NOT gated on completion (QA round-1 defect 12): a
    // recorded quiz score is a real score whether or not the learner has
    // ticked the lesson off.
    if (row.bestQuizScore !== null) acc.scores.push(row.bestQuizScore)
    byUser.set(row.userId, acc)
  }

  return members
    .map((member) => {
      const acc = byUser.get(member.userId)
      const scores = acc?.scores ?? []
      return {
        userId: member.userId,
        name: member.name,
        email: member.email,
        mandatoryTotal: mandatoryIds.length,
        mandatoryDone: acc?.done ?? 0,
        avgBestQuiz: scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
        lastActive: lastActiveByUser.get(member.userId) ?? null,
        baselineMet:
          mandatoryIds.length > 0 &&
          (acc?.baseline ?? 0) === mandatoryIds.length,
      }
    })
    .sort(
      (a, b) =>
        Number(b.baselineMet) - Number(a.baselineMet) ||
        b.mandatoryDone - a.mandatoryDone ||
        a.name.localeCompare(b.name)
    )
}

/**
 * Per-lesson completion across this org's learners (design 05 Q2) — where the
 * cohort sticks. Ratified edition lessons only; counts are restricted to this
 * organisation's learner memberships.
 */
export async function getOrgLessonCompletion(
  context: OrgStaffContext
): Promise<OrgLessonCompletionRow[]> {
  if (context.isPreview) return mockOrgLessonCompletion()
  if (!context.edition) return []

  const db = getDb()
  const rows = await db
    .select({
      lessonId: lessons.id,
      title: lessons.title,
      tier: editionLessons.tier,
      isMandatory: editionLessons.isMandatory,
      sortOrder: editionLessons.sortOrder,
      started: sql<number>`count(${lessonProgress.id})`,
      completed: sql<number>`count(${lessonProgress.id}) filter (where ${lessonProgress.isCompleted})`,
      quizPassed: sql<number>`count(${lessonProgress.id}) filter (where ${lessonProgress.quizPassed})`,
      avgBestQuiz: sql<number | null>`round(avg(${lessonProgress.bestQuizScore}))`,
    })
    .from(editionLessons)
    .innerJoin(lessons, eq(lessons.id, editionLessons.lessonId))
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, editionLessons.lessonId),
        sql`${lessonProgress.userId} IN (SELECT ${orgMembership.userId} FROM ${orgMembership} WHERE ${orgMembership.organizationId} = ${context.organisationId} AND ${orgMembership.role} = 'learner')`
      )
    )
    .where(
      and(
        eq(editionLessons.editionId, context.edition.id),
        eq(editionLessons.state, "ratified")
      )
    )
    .groupBy(
      lessons.id,
      lessons.title,
      editionLessons.tier,
      editionLessons.isMandatory,
      editionLessons.sortOrder
    )
    .orderBy(asc(editionLessons.sortOrder))

  return rows.map((row) => ({
    lessonId: row.lessonId,
    title: row.title,
    tier: row.tier,
    isMandatory: row.isMandatory,
    started: Number(row.started),
    completed: Number(row.completed),
    quizPassed: Number(row.quizPassed),
    avgBestQuiz: row.avgBestQuiz === null ? null : Number(row.avgBestQuiz),
  }))
}
