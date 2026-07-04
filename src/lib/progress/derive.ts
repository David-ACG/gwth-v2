/**
 * Pure derivations from persisted lesson progress (W14).
 *
 * The `lesson_progress` table (W7 write path, W13 viewer) is the single real
 * store for learner activity. Course progress and the study streak are
 * DERIVED from those rows here, never served from fixtures, so a brand-new
 * account honestly reads zero everywhere and real completions show up on the
 * dashboard and /progress without any parallel store.
 *
 * All functions are pure (rows + optional `now` in, values out) so they are
 * unit-testable without a database. Known limitation, documented on purpose:
 * `lastAccessedAt` is overwritten per lesson, so historical activity days are
 * UNDERcounted for lessons revisited later. The derivation never inflates —
 * that is the honest direction for beta. A dedicated activity-log table is a
 * post-beta follow-up.
 */
import type {
  Course,
  CourseProgress,
  DayActivity,
  DynamicScore,
  LessonProgress,
  StudyStreak,
} from "@/lib/types"

/**
 * Calendar timezone for streak/day bucketing. The beta is UK-only, so a
 * "study day" is a Europe/London calendar day regardless of server timezone.
 */
export const STREAK_TIMEZONE = "Europe/London"

/** Days covered by `StudyStreak.yearlyActivity`. */
const YEARLY_ACTIVITY_DAYS = 365

/**
 * Formats a date as a YYYY-MM-DD day key in the streak timezone.
 * `en-CA` is used purely because its short date format is ISO-shaped.
 */
export function toDayKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: STREAK_TIMEZONE })
}

/**
 * Returns the day key `daysAgo` days before `now` (0 = today). Computed on
 * the UTC-midnight grid of today's key, not by subtracting wall-clock hours,
 * so DST transitions in the streak timezone cannot duplicate or skip a day.
 */
function dayKeyAgo(now: Date, daysAgo: number): string {
  const todayMs = Date.parse(`${toDayKey(now)}T00:00:00Z`)
  return new Date(todayMs - daysAgo * 86_400_000).toISOString().slice(0, 10)
}

/** The `Date` a day key represents (UTC midnight of that calendar day). */
function dayKeyToDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`)
}

/**
 * Buckets a user's lesson-progress rows into activity counts per day key.
 * A lesson counts towards a day when it was completed that day or last
 * accessed that day; the count is the number of distinct lessons touched.
 */
function activityByDay(rows: LessonProgress[]): Map<string, number> {
  const byDay = new Map<string, Set<string>>()
  const touch = (date: Date | null | undefined, lessonId: string) => {
    if (!date) return
    const key = toDayKey(new Date(date))
    if (!byDay.has(key)) byDay.set(key, new Set())
    byDay.get(key)!.add(lessonId)
  }
  for (const row of rows) {
    touch(row.lastAccessedAt, row.lessonId)
    touch(row.completedAt, row.lessonId)
  }
  const counts = new Map<string, number>()
  for (const [key, lessonIds] of byDay) counts.set(key, lessonIds.size)
  return counts
}

/**
 * A study streak with no recorded activity: the honest state for a brand-new
 * account (and for unauthenticated reads). Never the fixture 5/14.
 */
export function emptyStreak(now: Date = new Date()): StudyStreak {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    weeklyActivity: Array.from({ length: 7 }, () => false),
    yearlyActivity: Array.from(
      { length: YEARLY_ACTIVITY_DAYS },
      (_, index): DayActivity => ({
        date: dayKeyToDate(dayKeyAgo(now, YEARLY_ACTIVITY_DAYS - 1 - index)),
        count: 0,
      })
    ),
  }
}

/**
 * Derives the study streak from the user's real lesson-progress rows.
 *
 * A day is "active" when at least one lesson was touched (accessed or
 * completed) on that Europe/London calendar day. The current streak counts
 * consecutive active days ending today, or ending yesterday when today has no
 * activity yet (a streak is only broken once a full day is missed).
 */
export function deriveStreak(
  rows: LessonProgress[],
  now: Date = new Date()
): StudyStreak {
  const counts = activityByDay(rows)
  if (counts.size === 0) return emptyStreak(now)

  // Current streak: walk back from today (or yesterday if today is inactive).
  let currentStreak = 0
  let cursor = counts.has(dayKeyAgo(now, 0)) ? 0 : 1
  while (counts.has(dayKeyAgo(now, cursor))) {
    currentStreak += 1
    cursor += 1
  }

  // Longest streak: longest run of consecutive day keys ever recorded.
  // Day keys sort chronologically as strings; consecutive days are exactly
  // one day apart when re-parsed as UTC dates.
  const sortedKeys = [...counts.keys()].sort()
  let longestStreak = 0
  let run = 0
  let previousMs: number | null = null
  for (const key of sortedKeys) {
    const ms = dayKeyToDate(key).getTime()
    run = previousMs !== null && ms - previousMs === 86_400_000 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previousMs = ms
  }
  longestStreak = Math.max(longestStreak, currentStreak)

  const weeklyActivity = Array.from({ length: 7 }, (_, index) =>
    counts.has(dayKeyAgo(now, 6 - index))
  )

  const yearlyActivity = Array.from(
    { length: YEARLY_ACTIVITY_DAYS },
    (_, index): DayActivity => {
      const key = dayKeyAgo(now, YEARLY_ACTIVITY_DAYS - 1 - index)
      return { date: dayKeyToDate(key), count: counts.get(key) ?? 0 }
    }
  )

  // counts.size > 0 was checked above, so a last key always exists.
  const lastActiveKey = sortedKeys[sortedKeys.length - 1]!
  return {
    currentStreak,
    longestStreak,
    lastActiveDate: dayKeyToDate(lastActiveKey),
    weeklyActivity,
    yearlyActivity,
  }
}

/**
 * Derives a course's progress from the user's real lesson-progress rows.
 * Returns null when the user has never touched a lesson in this course, so
 * list callers can distinguish "not started" (designed empty state) from
 * "in progress".
 */
export function deriveCourseProgress(
  course: Course,
  rows: LessonProgress[]
): CourseProgress | null {
  const lessonIds = new Set(
    course.sections.flatMap((section) => section.lessons.map((l) => l.id))
  )
  const courseRows = rows.filter((row) => lessonIds.has(row.lessonId))
  if (courseRows.length === 0) return null

  const totalLessons = lessonIds.size
  const completedRows = courseRows.filter((row) => row.isCompleted)
  const completedLessons = completedRows.length
  const isCourseComplete = totalLessons > 0 && completedLessons === totalLessons

  return {
    courseId: course.id,
    progress: totalLessons === 0 ? 0 : completedLessons / totalLessons,
    completedLessons,
    totalLessons,
    completedAt: isCourseComplete
      ? new Date(
          Math.max(
            ...completedRows.map((row) =>
              new Date(row.completedAt ?? 0).getTime()
            )
          )
        )
      : null,
  }
}

/**
 * A GWTH Score with nothing earned yet: the honest state for real accounts
 * until score computation lands (post-beta; the score panel is behind
 * `ENABLE_GWTH_SCORE` and off for the UK beta anyway).
 */
export function emptyDynamicScore(): DynamicScore {
  return {
    overallScore: 0,
    maxPossibleScore: 0,
    percentile: 0,
    curiosityIndex: 0,
    consistencyScore: 0,
    improvementRate: 0,
    scoreHistory: [],
  }
}
