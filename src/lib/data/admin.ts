/**
 * Admin dashboard data layer (W4 — David's beta cohort monitor).
 *
 * Read-model queries for the four /admin panels: cohort metrics, roster,
 * per-student M1 funnel, and the needs-attention list. Everything reads the
 * self-hosted Postgres (D2) through getDb(); the hand-picked beta cohort is
 * tiny, so panels fetch the small base tables and compose in TypeScript
 * rather than pushing complex aggregate SQL through Drizzle.
 *
 * Access control is NOT enforced here — callers are gated by the /admin
 * layout (pages) or requireAdminForApi (API routes), both on the ADMIN_EMAILS
 * allowlist in src/lib/admin.ts.
 */

import { asc, eq, isNull, sql as dsql } from "drizzle-orm"
import { getDb } from "@/db"
import {
  betaAccessGrants,
  feedback,
  lessonProgress,
  lessons,
  sections,
  session,
  user,
  userAccess,
  waitlist,
} from "@/db/schema"

/** Days without activity after which a granted tester counts as stalled. */
export const STALL_THRESHOLD_DAYS = 3

/** Roster access states derivable from user_access + beta_access_grants. */
export type RosterAccessState = "granted" | "registered" | "revoked" | "waitlist"

/** One roster row: a registered user, or a waitlist-only signup. */
export interface RosterEntry {
  /** Better Auth user id — null for waitlist-only entries (no account yet). */
  userId: string | null
  /** Display name (waitlist name, or "—" when unknown). */
  name: string
  email: string
  /** Derived access state (granted / registered / revoked / waitlist). */
  state: RosterAccessState
  /** Highest granted course month (0 when none). */
  subscriptionMonth: number
  /** Account creation (users) or waitlist signup date. ISO string. */
  signedUpAt: string
  /** Latest of session update / lesson activity, null = never active. */
  lastActiveAt: string | null
  /** Whether this email also sits on the waitlist. */
  onWaitlist: boolean
}

/** One per-student M1 funnel row (granted testers only). */
export interface FunnelEntry {
  userId: string
  name: string
  email: string
  /** Required (non-optional) M1 lessons completed. */
  completed: number
  /** Total required M1 lessons. */
  total: number
  /** Ordered per-lesson completion flags for the dash-progress strip. */
  lessonDashes: boolean[]
  /** Title of the last completed lesson, or null when none. */
  lastCompletedLesson: string | null
  /** Lesson id of the last completed lesson (mono label), or null. */
  lastCompletedLessonId: string | null
  /** Days since the last lesson activity, null = never opened a lesson. */
  daysIdle: number | null
  /** True when idle ≥ STALL_THRESHOLD_DAYS and the funnel is unfinished. */
  isStalled: boolean
}

/** The overview metric cards. */
export interface CohortMetrics {
  /** Granted testers with lesson/session activity in the stall window. */
  active: number
  /** Granted testers stalled (idle ≥ threshold or never started). */
  stalled: number
  /** Feedback rows with no read_at. */
  unreadFeedback: number
  /** Waitlist signups. */
  waitlist: number
  /** Total granted testers (denominator for the cards' captions). */
  granted: number
}

/** Full millisecond timestamp for "now" injected for testability. */
function daysBetween(nowMs: number, iso: string): number {
  return Math.floor((nowMs - new Date(iso).getTime()) / 86_400_000)
}

/** Picks the later of two nullable ISO timestamps. */
function laterOf(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b
}

/**
 * Derives a user's roster state from their user_access row and any
 * beta_access_grants row for their email.
 *
 * granted  = live manual_beta access (month > 0, valid_until unset/future)
 * revoked  = a manual grant exists but has expired (valid_until in the past)
 * registered = an account with no manual grant at all
 */
function deriveState(
  access:
    | { accessSource: string; subscriptionMonth: number; validUntil: string | null }
    | undefined,
  grant: { validUntil: string | null } | undefined,
  nowMs: number
): Exclude<RosterAccessState, "waitlist"> {
  const validUntilMs = (value: string | null) =>
    value ? new Date(value).getTime() : null

  if (access && access.accessSource === "manual_beta" && access.subscriptionMonth > 0) {
    const until = validUntilMs(access.validUntil)
    if (until === null || until > nowMs) return "granted"
    return "revoked"
  }
  if (grant) {
    const until = validUntilMs(grant.validUntil)
    if (until === null || until > nowMs) return "granted"
    return "revoked"
  }
  return "registered"
}

/**
 * Returns every registered user (plus waitlist-only signups) with their
 * derived access state, signup date, and last activity — Panel 1.
 *
 * Last activity is the later of the user's newest session update and their
 * newest lesson_progress touch, so a tester who signed in but never opened a
 * lesson still shows as active.
 */
export async function getRoster(now = new Date()): Promise<RosterEntry[]> {
  const db = getDb()
  const nowMs = now.getTime()

  const [users, accessRows, grantRows, waitlistRows, sessionAgg, progressAgg] =
    await Promise.all([
      db
        .select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
        .from(user),
      db
        .select({
          userId: userAccess.userId,
          accessSource: userAccess.accessSource,
          subscriptionMonth: userAccess.subscriptionMonth,
          validUntil: userAccess.validUntil,
        })
        .from(userAccess),
      db
        .select({
          email: betaAccessGrants.email,
          userId: betaAccessGrants.userId,
          validUntil: betaAccessGrants.validUntil,
        })
        .from(betaAccessGrants),
      db
        .select({ email: waitlist.email, name: waitlist.name, createdAt: waitlist.createdAt })
        .from(waitlist),
      db
        .select({
          userId: session.userId,
          lastSeen: dsql<string | null>`max(${session.updatedAt})`,
        })
        .from(session)
        .groupBy(session.userId),
      db
        .select({
          userId: lessonProgress.userId,
          lastSeen: dsql<string | null>`max(${lessonProgress.lastAccessedAt})`,
        })
        .from(lessonProgress)
        .groupBy(lessonProgress.userId),
    ])

  const accessByUser = new Map(accessRows.map((row) => [row.userId, row]))
  const grantByEmail = new Map(grantRows.map((row) => [row.email, row]))
  const sessionByUser = new Map(sessionAgg.map((row) => [row.userId, row.lastSeen]))
  const progressByUser = new Map(progressAgg.map((row) => [row.userId, row.lastSeen]))
  const waitlistEmails = new Set(waitlistRows.map((row) => row.email.toLowerCase()))
  const userEmails = new Set(users.map((row) => row.email.toLowerCase()))

  const entries: RosterEntry[] = users.map((row) => {
    const email = row.email.toLowerCase()
    const sessionSeen = sessionByUser.get(row.id) ?? null
    const progressSeen = progressByUser.get(row.id) ?? null
    return {
      userId: row.id,
      name: row.name,
      email,
      state: deriveState(accessByUser.get(row.id), grantByEmail.get(email), nowMs),
      subscriptionMonth: accessByUser.get(row.id)?.subscriptionMonth ?? 0,
      signedUpAt: new Date(row.createdAt).toISOString(),
      lastActiveAt: laterOf(
        sessionSeen ? new Date(sessionSeen).toISOString() : null,
        progressSeen ? new Date(progressSeen).toISOString() : null
      ),
      onWaitlist: waitlistEmails.has(email),
    }
  })

  // Waitlist signups with no account yet surface as waitlist-only rows so
  // David sees who is queueing without cross-referencing another page.
  for (const row of waitlistRows) {
    const email = row.email.toLowerCase()
    if (userEmails.has(email)) continue
    entries.push({
      userId: null,
      name: row.name?.trim() || "—",
      email,
      state: "waitlist",
      subscriptionMonth: 0,
      signedUpAt: new Date(row.createdAt).toISOString(),
      lastActiveAt: null,
      onWaitlist: true,
    })
  }

  return entries
}

/**
 * Returns the ordered list of REQUIRED Month-1 lessons (id + title), the
 * funnel's spine. Optional-track lessons are excluded so "completed x of y"
 * matches what every tester is asked to do.
 */
async function getM1Lessons(): Promise<{ id: string; title: string }[]> {
  const db = getDb()
  const rows = await db
    .select({ id: lessons.id, title: lessons.title })
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .where(dsql`${lessons.month} = 1 AND ${lessons.isOptional} = false`)
    .orderBy(asc(sections.order), asc(lessons.order))
  return rows
}

/**
 * Builds the per-student M1 funnel — Panel 2. One row per GRANTED tester
 * (from the roster), with completed counts, the per-lesson dash strip, the
 * stall point (last completed lesson + days idle) and the stalled flag.
 */
export async function getFunnel(now = new Date()): Promise<FunnelEntry[]> {
  const db = getDb()
  const nowMs = now.getTime()

  const [roster, m1Lessons, progressRows] = await Promise.all([
    getRoster(now),
    getM1Lessons(),
    db
      .select({
        userId: lessonProgress.userId,
        lessonId: lessonProgress.lessonId,
        isCompleted: lessonProgress.isCompleted,
        lastAccessedAt: lessonProgress.lastAccessedAt,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessonProgress),
  ])

  const byUser = new Map<string, typeof progressRows>()
  for (const row of progressRows) {
    const list = byUser.get(row.userId) ?? []
    list.push(row)
    byUser.set(row.userId, list)
  }
  const lessonTitle = new Map(m1Lessons.map((lesson) => [lesson.id, lesson.title]))

  return roster
    .filter((entry) => entry.state === "granted" && entry.userId)
    .map((entry) => {
      const rows = byUser.get(entry.userId!) ?? []
      const completedIds = new Set(
        rows.filter((row) => row.isCompleted).map((row) => row.lessonId)
      )
      const lessonDashes = m1Lessons.map((lesson) => completedIds.has(lesson.id))
      const completed = lessonDashes.filter(Boolean).length

      let lastCompletedLessonId: string | null = null
      let lastCompletedAt = 0
      for (const row of rows) {
        if (!row.isCompleted || !row.completedAt) continue
        const at = new Date(row.completedAt).getTime()
        if (at > lastCompletedAt && lessonTitle.has(row.lessonId)) {
          lastCompletedAt = at
          lastCompletedLessonId = row.lessonId
        }
      }

      let lastTouch: string | null = null
      for (const row of rows) {
        lastTouch = laterOf(
          lastTouch,
          row.lastAccessedAt ? new Date(row.lastAccessedAt).toISOString() : null
        )
      }
      const daysIdle = lastTouch ? daysBetween(nowMs, lastTouch) : null
      const finished = completed >= m1Lessons.length && m1Lessons.length > 0

      return {
        userId: entry.userId!,
        name: entry.name,
        email: entry.email,
        completed,
        total: m1Lessons.length,
        lessonDashes,
        lastCompletedLesson: lastCompletedLessonId
          ? (lessonTitle.get(lastCompletedLessonId) ?? null)
          : null,
        lastCompletedLessonId,
        daysIdle,
        // Never-started testers count as stalled too — they need the nudge most.
        isStalled:
          !finished && (daysIdle === null || daysIdle >= STALL_THRESHOLD_DAYS),
      }
    })
}

/**
 * Computes the four overview metric cards — active, stalled, unread
 * feedback, waitlist — from the roster, funnel, and feedback tables.
 */
export async function getCohortMetrics(now = new Date()): Promise<CohortMetrics> {
  const db = getDb()

  const [roster, funnel, unreadRows] = await Promise.all([
    getRoster(now),
    getFunnel(now),
    db
      .select({ count: dsql<number>`count(*)::int` })
      .from(feedback)
      .where(isNull(feedback.readAt)),
  ])

  const granted = roster.filter((entry) => entry.state === "granted").length
  const stalled = funnel.filter((entry) => entry.isStalled).length

  return {
    active: funnel.length - stalled,
    stalled,
    unreadFeedback: unreadRows[0]?.count ?? 0,
    waitlist: roster.filter((entry) => entry.state === "waitlist" || entry.onWaitlist)
      .length,
    granted,
  }
}
