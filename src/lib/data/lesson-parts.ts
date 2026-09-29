/**
 * Lessons in parts: content, check answers, preferences and the event log
 * (bead gwth-launch-hqyp). Canonical DDL: supabase/migrations/024_lesson_parts.sql.
 *
 * Every read degrades to "no parts" when the 024 tables are missing, so a site
 * running without the migration shows the page-flip viewer instead of failing.
 * Client components reach this module only through `@/lib/actions/lesson-parts`
 * and `/api/lesson-events`.
 */
import "server-only"

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"
import { getDb } from "@/db"
import {
  learnerPreferences,
  lessonEvents,
  lessonPartChecks,
  lessonParts,
  lessonProgress,
} from "@/db/schema"
import { getCurrentUser } from "@/lib/auth"
import {
  allPartsResolved,
  applyCheckAnswer,
  emptyCheckState,
  firstOpenPart,
  isLessonFormat,
  parseLessonParts,
  rightFirstTimeScore,
  type CheckAnswerResult,
  type LessonFormat,
  type LessonPartsContent,
  type PartCheckState,
} from "@/lib/lessons/parts"
import { sanitizeLessonEvent, type LessonEventInput } from "@/lib/lessons/lesson-events"

function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/** Postgres "undefined_table": the 024 migration has not been applied. */
function isMissingTable(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } } | null)
  return code?.code === "42P01" || code?.cause?.code === "42P01"
}

// ── Content ──────────────────────────────────────────────────────────────────

/** The stored parts content for a lesson, or null (no row, bad row, no table). */
export async function getLessonPartsContent(lessonId: string): Promise<LessonPartsContent | null> {
  if (!isDbConfigured()) return null
  try {
    const [row] = await getDb()
      .select({ content: lessonParts.content })
      .from(lessonParts)
      .where(eq(lessonParts.lessonId, lessonId))
      .limit(1)
    return row ? parseLessonParts(row.content) : null
  } catch (error) {
    if (!isMissingTable(error)) console.error(`[lesson-parts] cannot read ${lessonId}`, error)
    return null
  }
}

/** Which lessons have parts content (for the admin report list). */
export async function listLessonsWithParts(): Promise<{ lessonId: string; title: string; parts: number }[]> {
  if (!isDbConfigured()) return []
  try {
    const rows = await getDb()
      .select({ lessonId: lessonParts.lessonId, content: lessonParts.content })
      .from(lessonParts)
      .orderBy(asc(lessonParts.lessonId))
    return rows.flatMap((r) => {
      const c = parseLessonParts(r.content)
      return c ? [{ lessonId: r.lessonId, title: c.title, parts: c.parts.length }] : []
    })
  } catch (error) {
    if (!isMissingTable(error)) console.error("[lesson-parts] cannot list", error)
    return []
  }
}

/** Store (insert or replace) a lesson's parts content. Validates first. */
export async function upsertLessonParts(raw: unknown, source: string | null): Promise<LessonPartsContent> {
  const content = parseLessonParts(raw)
  if (!content) throw new Error("lesson parts content does not validate")
  await getDb()
    .insert(lessonParts)
    .values({ lessonId: content.lessonId, version: String(content.version), content, source })
    .onConflictDoUpdate({
      target: lessonParts.lessonId,
      set: { version: String(content.version), content, source, importedAt: sql`now()` },
    })
  return content
}

// ── The learner's standing ───────────────────────────────────────────────────

type CheckRow = typeof lessonPartChecks.$inferSelect

function rowToState(row: CheckRow): PartCheckState {
  const answers = Array.isArray(row.answers) ? (row.answers as unknown[]).filter((a): a is number => typeof a === "number") : []
  return {
    partId: row.partId,
    tries: row.tries,
    wrongTries: row.wrongTries,
    correct: row.correct,
    firstRight: row.firstRight,
    resolved: row.resolvedAt !== null,
    answers,
  }
}

export interface LearnerPrefs {
  lessonFormat: LessonFormat | null
  readAlong: boolean
}

const DEFAULT_PREFS: LearnerPrefs = { lessonFormat: null, readAlong: true }

export interface PartsViewerState {
  userId: string | null
  checks: Record<string, PartCheckState>
  /** Where to open: the last part opened, never past the first open check. */
  startAt: number
  /** True when the learner has been in this lesson before. */
  returning: boolean
  prefs: LearnerPrefs
  /** True when this learner has never picked a format (show the choice). */
  firstChoice: boolean
}

export async function getPartsViewerState(content: LessonPartsContent): Promise<PartsViewerState> {
  const user = await getCurrentUser()
  const empty: PartsViewerState = {
    userId: user?.id ?? null,
    checks: {},
    startAt: 0,
    returning: false,
    prefs: DEFAULT_PREFS,
    firstChoice: true,
  }
  if (!user || !isDbConfigured()) return empty
  const db = getDb()
  try {
    const [rows, prefRows, lastOpen] = await Promise.all([
      db.select().from(lessonPartChecks).where(and(eq(lessonPartChecks.userId, user.id), eq(lessonPartChecks.lessonId, content.lessonId))),
      db.select().from(learnerPreferences).where(eq(learnerPreferences.userId, user.id)).limit(1),
      db
        .select({ partIndex: lessonEvents.partIndex })
        .from(lessonEvents)
        .where(and(eq(lessonEvents.userId, user.id), eq(lessonEvents.lessonId, content.lessonId), eq(lessonEvents.event, "part_opened")))
        .orderBy(desc(lessonEvents.id))
        .limit(1),
    ])
    const checks: Record<string, PartCheckState> = {}
    for (const r of rows) checks[r.partId] = rowToState(r)
    const open = firstOpenPart(content.parts, checks)
    const last = lastOpen[0]?.partIndex
    // Screen 0 is the introduction; screens 1..n are the parts; n+1 is the end.
    const lastScreen = typeof last === "number" ? last + 1 : 0
    const startAt = Math.max(0, Math.min(lastScreen, open + 1, content.parts.length + 1))
    const pref = prefRows[0]
    const prefs: LearnerPrefs = pref
      ? { lessonFormat: isLessonFormat(pref.lessonFormat) ? pref.lessonFormat : null, readAlong: pref.readAlong }
      : DEFAULT_PREFS
    return {
      userId: user.id,
      checks,
      startAt,
      returning: rows.length > 0 || lastOpen.length > 0,
      prefs,
      firstChoice: prefs.lessonFormat === null,
    }
  } catch (error) {
    if (!isMissingTable(error)) console.error("[lesson-parts] cannot read learner state", error)
    return { ...empty }
  }
}

// ── Answering a check ────────────────────────────────────────────────────────

export interface RecordedCheckAnswer extends CheckAnswerResult {
  lessonComplete: boolean
}

/**
 * Grade one answer on the server, store it, log it, and credit the lesson
 * when every part is resolved. The answer key never reaches the browser.
 */
export async function recordPartCheckAnswer(params: {
  userId: string
  content: LessonPartsContent
  partId: string
  optionIndex: number
  format: LessonFormat | null
  sessionId: string
}): Promise<RecordedCheckAnswer | null> {
  const { userId, content, partId, optionIndex } = params
  const partIndex = content.parts.findIndex((p) => p.id === partId)
  const part = content.parts[partIndex]
  if (!part) return null
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= part.check.options.length) return null

  const db = getDb()
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(lessonPartChecks)
      .where(and(eq(lessonPartChecks.userId, userId), eq(lessonPartChecks.lessonId, content.lessonId), eq(lessonPartChecks.partId, partId)))
      .for("update")
      .limit(1)
    const before = existing ? rowToState(existing) : emptyCheckState(partId)
    const result = applyCheckAnswer(before, part.check, optionIndex)
    const s = result.state
    const nowIso = new Date().toISOString()

    if (!before.resolved) {
      await tx
        .insert(lessonPartChecks)
        .values({
          userId,
          lessonId: content.lessonId,
          partId,
          tries: s.tries,
          wrongTries: s.wrongTries,
          correct: s.correct,
          firstRight: s.firstRight,
          answers: s.answers,
          resolvedAt: s.resolved ? nowIso : null,
          updatedAt: nowIso,
        })
        .onConflictDoUpdate({
          target: [lessonPartChecks.userId, lessonPartChecks.lessonId, lessonPartChecks.partId],
          set: {
            tries: s.tries,
            wrongTries: s.wrongTries,
            correct: s.correct,
            firstRight: s.firstRight,
            answers: s.answers,
            resolvedAt: s.resolved ? nowIso : null,
            updatedAt: nowIso,
          },
        })
    }

    await tx.insert(lessonEvents).values({
      userId,
      lessonId: content.lessonId,
      sessionId: params.sessionId,
      event: "check_answer",
      partIndex,
      format: params.format,
      detail: { option: optionIndex, correct: result.correct, try: before.resolved ? null : s.tries, afterResolved: before.resolved },
    })

    // Recompute the lesson's standing from every part's row.
    const rows = await tx
      .select()
      .from(lessonPartChecks)
      .where(and(eq(lessonPartChecks.userId, userId), eq(lessonPartChecks.lessonId, content.lessonId)))
    const states: Record<string, PartCheckState> = {}
    for (const r of rows) states[r.partId] = rowToState(r)
    const complete = allPartsResolved(content.parts, states)
    const resolvedCount = content.parts.filter((p) => states[p.id]?.resolved).length

    if (!before.resolved && s.resolved) {
      await creditLessonProgress(tx, {
        userId,
        lessonId: content.lessonId,
        fraction: complete ? 1 : (0.99 * resolvedCount) / content.parts.length,
        complete,
        score: rightFirstTimeScore(content.parts, states),
        nowIso,
      })
      if (complete) {
        await tx.insert(lessonEvents).values({
          userId,
          lessonId: content.lessonId,
          sessionId: params.sessionId,
          event: "lesson_completed",
          partIndex,
          format: params.format,
          detail: { score: rightFirstTimeScore(content.parts, states) },
        })
      }
    }
    return { ...result, lessonComplete: complete }
  })
}

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0]

/**
 * Move lesson_progress onto the part checks. A parts lesson has no separate
 * intro-video or quiz gate: resolving every part credits BOTH gates, so the
 * existing completion formula (intro >= 0.8 AND quiz_passed), the dashboard,
 * org reports and anything built on quiz_passed read it as complete. The
 * quiz score becomes the share of parts right first time.
 */
async function creditLessonProgress(
  tx: Tx,
  p: { userId: string; lessonId: string; fraction: number; complete: boolean; score: number; nowIso: string }
): Promise<void> {
  const fraction = Math.max(0, Math.min(1, p.fraction))
  const base = {
    userId: p.userId,
    lessonId: p.lessonId,
    isCompleted: p.complete,
    progress: fraction,
    quizScore: p.complete ? p.score : null,
    bestQuizScore: p.complete ? p.score : null,
    quizPassed: p.complete,
    quizAttempts: 0,
    timeSpent: 0,
    introVideoProgress: p.complete ? 1 : 0,
    gradedBy: "server",
    lastAccessedAt: p.nowIso,
    completedAt: p.complete ? p.nowIso : null,
  }
  await tx
    .insert(lessonProgress)
    .values(base)
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: p.complete
        ? {
            isCompleted: true,
            progress: 1,
            quizPassed: true,
            introVideoProgress: 1,
            quizScore: p.score,
            bestQuizScore: sql`greatest(coalesce(${lessonProgress.bestQuizScore}, 0), ${p.score})`,
            gradedBy: "server",
            completedAt: sql`coalesce(${lessonProgress.completedAt}, now())`,
            lastAccessedAt: p.nowIso,
          }
        : {
            progress: sql`greatest(coalesce(${lessonProgress.progress}, 0), ${fraction})`,
            lastAccessedAt: p.nowIso,
          },
    })
}

// ── Preferences ──────────────────────────────────────────────────────────────

export async function getLearnerPrefs(): Promise<LearnerPrefs> {
  const user = await getCurrentUser()
  if (!user || !isDbConfigured()) return DEFAULT_PREFS
  try {
    const [row] = await getDb().select().from(learnerPreferences).where(eq(learnerPreferences.userId, user.id)).limit(1)
    if (!row) return DEFAULT_PREFS
    return { lessonFormat: isLessonFormat(row.lessonFormat) ? row.lessonFormat : null, readAlong: row.readAlong }
  } catch (error) {
    if (!isMissingTable(error)) console.error("[lesson-parts] cannot read preferences", error)
    return DEFAULT_PREFS
  }
}

export async function setLearnerPrefs(userId: string, patch: Partial<LearnerPrefs>): Promise<LearnerPrefs> {
  const set: Partial<typeof learnerPreferences.$inferInsert> = { updatedAt: new Date().toISOString() }
  if (patch.lessonFormat !== undefined) set.lessonFormat = patch.lessonFormat
  if (patch.readAlong !== undefined) set.readAlong = patch.readAlong
  const [row] = await getDb()
    .insert(learnerPreferences)
    .values({ userId, lessonFormat: patch.lessonFormat ?? null, readAlong: patch.readAlong ?? true })
    .onConflictDoUpdate({ target: learnerPreferences.userId, set })
    .returning()
  return { lessonFormat: isLessonFormat(row?.lessonFormat) ? row.lessonFormat : null, readAlong: row?.readAlong ?? true }
}

// ── Events ───────────────────────────────────────────────────────────────────

/** Store a batch of client events for one lesson. Invalid ones are dropped. */
export async function recordLessonEvents(
  userId: string,
  lessonId: string,
  sessionId: string,
  events: LessonEventInput[]
): Promise<number> {
  const rows = events
    .map((e) => sanitizeLessonEvent(e))
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .map((e) => ({ userId, lessonId, sessionId, event: e.event, partIndex: e.partIndex, format: e.format, detail: e.detail }))
  if (!rows.length) return 0
  await getDb().insert(lessonEvents).values(rows)
  return rows.length
}

// ── Admin report inputs ──────────────────────────────────────────────────────

export interface ReportEventRow {
  userId: string
  sessionId: string
  event: string
  partIndex: number | null
  format: string | null
  detail: Record<string, unknown>
  at: number
}

/** Every event for a lesson (bounded), oldest first, for the admin report. */
export async function getLessonEventsForReport(lessonId: string, limit = 200_000): Promise<ReportEventRow[]> {
  if (!isDbConfigured()) return []
  try {
    const rows = await getDb()
      .select()
      .from(lessonEvents)
      .where(eq(lessonEvents.lessonId, lessonId))
      .orderBy(asc(lessonEvents.id))
      .limit(limit)
    return rows.map((r) => ({
      userId: r.userId,
      sessionId: r.sessionId,
      event: r.event,
      partIndex: r.partIndex,
      format: r.format,
      detail: (r.detail ?? {}) as Record<string, unknown>,
      at: Date.parse(r.createdAt),
    }))
  } catch (error) {
    if (!isMissingTable(error)) console.error("[lesson-parts] cannot read events", error)
    return []
  }
}

/** Learners' current format choice, for the split. */
export async function getFormatChoiceCounts(userIds: string[]): Promise<Record<LessonFormat | "none", number>> {
  const out: Record<LessonFormat | "none", number> = { read: 0, watch: 0, none: 0 }
  if (!userIds.length || !isDbConfigured()) return out
  try {
    const rows = await getDb()
      .select({ userId: learnerPreferences.userId, f: learnerPreferences.lessonFormat })
      .from(learnerPreferences)
      .where(inArray(learnerPreferences.userId, userIds))
    const seen = new Set<string>()
    for (const r of rows) {
      seen.add(r.userId)
      if (isLessonFormat(r.f)) out[r.f] += 1
      else out.none += 1
    }
    out.none += userIds.filter((u) => !seen.has(u)).length
  } catch (error) {
    if (!isMissingTable(error)) console.error("[lesson-parts] cannot read format counts", error)
  }
  return out
}
