/**
 * Content protection records (bead gwth-launch-735c). Canonical DDL:
 * supabase/migrations/033_content_protection.sql.
 *
 *  - recordLessonAccess(): one row per lesson page the server served (or a
 *    locked lesson it refused), then the too-fast monitor scores the account
 *    and opens a flag when it crosses a line (alert only: the learner sees
 *    nothing; their next month waits for David).
 *  - holdInputs(): the flags and Month 1/2 completions access.ts needs for the
 *    review hold and the 75% completion gate.
 *  - listFlags() / resolveFlag(): the /admin/flagged page.
 *
 * Every read degrades to "nothing recorded" when the 033 tables are missing,
 * and every write is best-effort: protection must never break a lesson page.
 * Must not import @/lib/auth (access.ts imports this module).
 */
import "server-only"

import { and, asc, desc, eq, gte, inArray, lt, or, sql } from "drizzle-orm"
import { getDb } from "@/db"
import {
  contentAccessEvents,
  contentAccessFlags,
  editionLessons,
  lessonEvents,
  lessonProgress,
  lessons,
  syllabusEdition,
  user as userTable,
} from "@/db/schema"
import { scoreAccount, describeSignals, type AccessEvent, type Signals } from "./monitor"
import type { FlagForHold, MonthCompletion } from "./month-hold"
import { sendFlagAlert } from "./alerts"

function dbReady(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

const RAW_EVENT_DAYS = 90
const RESOLVED_FLAG_DAYS = 365

export type RequestMeta = {
  ip: string | null
  country: string | null
  userAgent: string | null
  prefetch: boolean
}

/** Who asked, from the request headers (Cloudflare first, then the proxy). */
export function requestMetaFrom(h: Headers): RequestMeta {
  const ip =
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  const purpose = `${h.get("purpose") ?? ""} ${h.get("sec-purpose") ?? ""}`.toLowerCase()
  return {
    ip: ip ? ip.slice(0, 64) : null,
    country: h.get("cf-ipcountry")?.slice(0, 8) ?? null,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    prefetch: Boolean(h.get("next-router-prefetch")) || purpose.includes("prefetch"),
  }
}

export async function recordLessonAccess(input: {
  userId: string
  email: string
  lessonId: string
  month: number | null
  kind: "lesson_view" | "locked_lesson"
  expectedSec?: number | null
  mediaLinks?: number
  /** The highest month the learner can open now: a flag holds the next one. */
  currentMonth: number
  meta: RequestMeta
  now?: Date
}): Promise<void> {
  if (!dbReady() || input.meta.prefetch) return
  const now = input.now ?? new Date()
  try {
    const db = getDb()
    let firstView = false
    if (input.kind === "lesson_view") {
      const [seen, progress] = await Promise.all([
        db
          .select({ id: contentAccessEvents.id })
          .from(contentAccessEvents)
          .where(
            and(
              eq(contentAccessEvents.userId, input.userId),
              eq(contentAccessEvents.lessonId, input.lessonId),
              eq(contentAccessEvents.kind, "lesson_view")
            )
          )
          .limit(1),
        db
          .select({ id: lessonProgress.id })
          .from(lessonProgress)
          .where(and(eq(lessonProgress.userId, input.userId), eq(lessonProgress.lessonId, input.lessonId)))
          .limit(1),
      ])
      firstView = seen.length === 0 && progress.length === 0
    }
    await db.insert(contentAccessEvents).values({
      userId: input.userId,
      lessonId: input.lessonId,
      month: input.month,
      kind: input.kind,
      firstView,
      expectedSec: input.expectedSec ?? null,
      mediaLinks: input.mediaLinks ?? 0,
      ip: input.meta.ip,
      country: input.meta.country,
      userAgent: input.meta.userAgent,
      createdAt: now.toISOString(),
    })
    await evaluateAccount(input.userId, input.email, input.currentMonth, now)
  } catch (error) {
    console.error("[protection] could not record lesson access", error)
  }
}

async function recentEvents(userId: string, since: Date): Promise<AccessEvent[]> {
  const rows = await getDb()
    .select()
    .from(contentAccessEvents)
    .where(and(eq(contentAccessEvents.userId, userId), gte(contentAccessEvents.createdAt, since.toISOString())))
    .orderBy(asc(contentAccessEvents.createdAt))
  return rows.map((r) => ({
    lessonId: r.lessonId,
    kind: r.kind as AccessEvent["kind"],
    firstView: r.firstView,
    expectedSec: r.expectedSec,
    mediaLinks: r.mediaLinks,
    createdAt: new Date(r.createdAt),
    ip: r.ip,
    userAgent: r.userAgent,
  }))
}

/** Lessons this account actually played something in since `since`. */
async function playedLessons(userId: string, since: Date): Promise<Set<string>> {
  const db = getDb()
  const [plays, videos] = await Promise.all([
    db
      .selectDistinct({ lessonId: lessonEvents.lessonId })
      .from(lessonEvents)
      .where(
        and(
          eq(lessonEvents.userId, userId),
          eq(lessonEvents.event, "media_play"),
          gte(lessonEvents.createdAt, since.toISOString())
        )
      ),
    db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          sql`${lessonProgress.introVideoProgress} > 0`,
          gte(lessonProgress.lastAccessedAt, since.toISOString())
        )
      ),
  ])
  return new Set([...plays, ...videos].map((r) => r.lessonId))
}

/** Score the account; open or refresh a flag when it crosses a line. */
export async function evaluateAccount(
  userId: string,
  email: string,
  currentMonth: number,
  now = new Date()
): Promise<{ level: string; flagged: boolean }> {
  const since = new Date(now.getTime() - 24 * 3600_000)
  const [events, played] = await Promise.all([recentEvents(userId, since), playedLessons(userId, since)])
  const verdict = scoreAccount(events, now, played)
  if (verdict.level !== "alert") return { level: verdict.level, flagged: false }

  const db = getDb()
  const active = await db
    .select()
    .from(contentAccessFlags)
    .where(and(eq(contentAccessFlags.userId, userId), inArray(contentAccessFlags.status, ["open", "suspended"])))
    .limit(1)
  if (active[0]) {
    await db
      .update(contentAccessFlags)
      .set({ reasons: verdict.reasons, signals: verdict.signals, lastSeenAt: now.toISOString() })
      .where(eq(contentAccessFlags.id, active[0].id))
    return { level: verdict.level, flagged: true }
  }

  const heldMonth = currentMonth >= 1 && currentMonth < 3 ? currentMonth + 1 : null
  const inserted = await db
    .insert(contentAccessFlags)
    .values({
      userId,
      status: "open",
      heldMonth,
      reasons: verdict.reasons,
      signals: verdict.signals,
      openedAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
    })
    .onConflictDoNothing()
    .returning({ id: contentAccessFlags.id })
  const id = inserted[0]?.id
  if (id !== undefined) {
    const sent = await sendFlagAlert({
      flagId: id,
      email,
      heldMonth,
      reasons: verdict.reasons,
      summary: describeSignals(verdict.signals),
    })
    if (sent) {
      await db
        .update(contentAccessFlags)
        .set({ alertSentAt: new Date().toISOString() })
        .where(eq(contentAccessFlags.id, id))
    }
  }
  return { level: verdict.level, flagged: true }
}

// ------------------------------------------------------------------ holds

/**
 * The core lessons of each month for a direct learner: the global default
 * edition's mandatory, ratified lessons, or every non-optional lesson when no
 * edition curates the course. (Institution learners are admitted through
 * org_membership, not user_access, so the gate never reads their edition.)
 */
async function coreLessonsByMonth(): Promise<Map<number, string[]>> {
  const db = getDb()
  const rows = await db
    .select({ id: lessons.id, month: lessons.month, isOptional: lessons.isOptional, courseId: lessons.courseId })
    .from(lessons)
  const edition = await db
    .select({ id: syllabusEdition.id, courseId: syllabusEdition.courseId })
    .from(syllabusEdition)
    .where(and(eq(syllabusEdition.isDefault, true), eq(syllabusEdition.status, "live")))
  let allowed: Set<string> | null = null
  if (edition.length > 0) {
    const entries = await db
      .select({ lessonId: editionLessons.lessonId })
      .from(editionLessons)
      .where(
        and(
          inArray(editionLessons.editionId, edition.map((e) => e.id)),
          eq(editionLessons.isMandatory, true),
          eq(editionLessons.state, "ratified")
        )
      )
    if (entries.length > 0) allowed = new Set(entries.map((e) => e.lessonId))
  }
  const out = new Map<number, string[]>()
  for (const r of rows) {
    if (allowed ? !allowed.has(r.id) : r.isOptional) continue
    const list = out.get(r.month) ?? []
    list.push(r.id)
    out.set(r.month, list)
  }
  return out
}

export type HoldInputs = {
  flags: FlagForHold[]
  gate: { 1: MonthCompletion; 2: MonthCompletion }
}

/** Flags and Month 1/2 completions for one learner; null when unreadable. */
export async function holdInputs(userId: string): Promise<HoldInputs | null> {
  if (!dbReady()) return null
  try {
    const db = getDb()
    const [flagRows, core, done] = await Promise.all([
      db
        .select({
          status: contentAccessFlags.status,
          heldMonth: contentAccessFlags.heldMonth,
          clearedAt: contentAccessFlags.clearedAt,
        })
        .from(contentAccessFlags)
        .where(eq(contentAccessFlags.userId, userId)),
      coreLessonsByMonth(),
      db
        .select({ lessonId: lessonProgress.lessonId, completedAt: lessonProgress.completedAt })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.isCompleted, true))),
    ])
    const finished = new Map(done.map((d) => [d.lessonId, d.completedAt ? new Date(d.completedAt) : new Date(0)]))
    const month = (m: number): MonthCompletion => {
      const ids = core.get(m) ?? []
      return {
        total: ids.length,
        completedAt: ids.filter((id) => finished.has(id)).map((id) => finished.get(id) as Date),
      }
    }
    return {
      flags: flagRows.map((f) => ({
        status: f.status as FlagForHold["status"],
        heldMonth: f.heldMonth,
        clearedAt: f.clearedAt ? new Date(f.clearedAt) : null,
      })),
      gate: { 1: month(1), 2: month(2) },
    }
  } catch (error) {
    console.error("[protection] could not read holds", error)
    return null
  }
}

// ------------------------------------------------------------------ admin

export type FlagRecord = {
  id: number
  userId: string
  email: string
  name: string
  status: "open" | "cleared" | "suspended"
  heldMonth: number | null
  reasons: string[]
  signals: Signals | null
  openedAt: string
  lastSeenAt: string
  alertSentAt: string | null
  reviewedBy: string | null
  clearedAt: string | null
  note: string | null
  timeline: Array<{ at: string; lessonId: string; kind: string; firstView: boolean; mediaLinks: number; ip: string | null; country: string | null; userAgent: string | null }>
}

export async function listFlags(opts: { includeResolved?: boolean; limit?: number } = {}): Promise<FlagRecord[]> {
  const db = getDb()
  const where = opts.includeResolved ? undefined : inArray(contentAccessFlags.status, ["open", "suspended"])
  const rows = await db
    .select({ f: contentAccessFlags, email: userTable.email, name: userTable.name })
    .from(contentAccessFlags)
    .innerJoin(userTable, eq(userTable.id, contentAccessFlags.userId))
    .where(where)
    .orderBy(desc(contentAccessFlags.openedAt))
    .limit(opts.limit ?? 50)
  return Promise.all(
    rows.map(async ({ f, email, name }) => {
      const since = new Date(new Date(f.openedAt).getTime() - 24 * 3600_000).toISOString()
      const events = await db
        .select()
        .from(contentAccessEvents)
        .where(and(eq(contentAccessEvents.userId, f.userId), gte(contentAccessEvents.createdAt, since)))
        .orderBy(desc(contentAccessEvents.createdAt))
        .limit(80)
      return {
        id: f.id,
        userId: f.userId,
        email,
        name,
        status: f.status as FlagRecord["status"],
        heldMonth: f.heldMonth,
        reasons: Array.isArray(f.reasons) ? (f.reasons as string[]) : [],
        signals: (f.signals as Signals) ?? null,
        openedAt: f.openedAt,
        lastSeenAt: f.lastSeenAt,
        alertSentAt: f.alertSentAt,
        reviewedBy: f.reviewedBy,
        clearedAt: f.clearedAt,
        note: f.note,
        timeline: events.map((e) => ({
          at: e.createdAt,
          lessonId: e.lessonId,
          kind: e.kind,
          firstView: e.firstView,
          mediaLinks: e.mediaLinks,
          ip: e.ip,
          country: e.country,
          userAgent: e.userAgent,
        })),
      }
    })
  )
}

/**
 * David's verdict. "clear": looks fine, the held month opens (from now) and
 * the clock restarts. "suspend": no course access until reinstated.
 * "reinstate": a suspended account comes back, as if cleared.
 */
export async function resolveFlag(
  id: number,
  action: "clear" | "suspend" | "reinstate",
  reviewer: string,
  note?: string
): Promise<boolean> {
  const db = getDb()
  const now = new Date().toISOString()
  const from = action === "reinstate" ? ["suspended"] : ["open", "suspended"]
  const set =
    action === "suspend"
      ? { status: "suspended", reviewedBy: reviewer, note: note ?? null }
      : { status: "cleared", reviewedBy: reviewer, clearedAt: now, note: note ?? null }
  const out = await db
    .update(contentAccessFlags)
    .set(set)
    .where(and(eq(contentAccessFlags.id, id), inArray(contentAccessFlags.status, from)))
    .returning({ id: contentAccessFlags.id })
  return out.length > 0
}

export async function isSuspended(userId: string): Promise<boolean> {
  if (!dbReady()) return false
  try {
    const rows = await getDb()
      .select({ id: contentAccessFlags.id })
      .from(contentAccessFlags)
      .where(and(eq(contentAccessFlags.userId, userId), eq(contentAccessFlags.status, "suspended")))
      .limit(1)
    return rows.length > 0
  } catch {
    return false
  }
}

/** Retention: raw events 90 days, resolved flags 12 months. */
export async function purgeOldProtectionRecords(now = new Date()): Promise<{ events: number; flags: number }> {
  const db = getDb()
  const eventCut = new Date(now.getTime() - RAW_EVENT_DAYS * 86400_000).toISOString()
  const flagCut = new Date(now.getTime() - RESOLVED_FLAG_DAYS * 86400_000).toISOString()
  const events = await db
    .delete(contentAccessEvents)
    .where(lt(contentAccessEvents.createdAt, eventCut))
    .returning({ id: contentAccessEvents.id })
  const flags = await db
    .delete(contentAccessFlags)
    .where(
      and(
        eq(contentAccessFlags.status, "cleared"),
        or(lt(contentAccessFlags.clearedAt, flagCut), lt(contentAccessFlags.lastSeenAt, flagCut))
      )
    )
    .returning({ id: contentAccessFlags.id })
  return { events: events.length, flags: flags.length }
}
