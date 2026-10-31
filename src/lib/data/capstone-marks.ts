/**
 * Marks after the judges: the learner's mark card and query (bead
 * gwth-launch-9289.6) and David's check (bead gwth-launch-9289.7).
 *
 * A mark changes in two ways, and both keep the old mark and say why:
 *   - a query: the learner picks one criterion and says why; both judges
 *     re-mark it. If they agree, the level they give stands (and the learner
 *     may still disagree, which sends it to David); if not, David decides.
 *   - David's check: his levels become the final mark and the answer key.
 *
 * Every learner-facing function takes the authenticated user id and scopes
 * every query to it (D2).
 */
import "server-only"

import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { capstoneAttempts, capstoneJudgeRuns, capstoneQueries, capstoneSubmissions } from "@/db/schema"
import type { CapstoneId } from "@/lib/capstones/guides"
import { HandInInputError } from "@/lib/capstones/bundle"
import type { CardBasic, CardCriterion, Level, Verdict } from "@/lib/capstones/judge/verdict"
import { bandOf, LEVELS, pointsFor } from "@/lib/capstones/judge/verdict"
import type { AttemptStatus, Band } from "@/lib/capstones/rules"
import type { CheckedMark } from "@/lib/capstones/agreement"
import { applyMark } from "./capstone-hand-ins"

/** Longest query reason (decision 6c). */
export const QUERY_MAX_CHARS = 500

/** A learner's query as their page shows it. */
export interface QueryView {
  id: string
  handInId: string
  criterionId: string
  reason: string
  status: "remarking" | "answered" | "with_david" | "resolved"
  levelBefore: Level
  levelAfter: Level | null
  stillDisagrees: boolean
  davidNote: string | null
}

/** One marked hand-in as the mark card shows it. */
export interface MarkCard {
  handInId: string
  attemptNo: number
  status: AttemptStatus
  total: number | null
  band: Band | null
  criteria: CardCriterion[]
  basics: CardBasic[]
  nextStep: string | null
  changeNote: string | null
  previousTotal: number | null
  previousBand: Band | null
  checked: boolean
}

type AttemptRow = typeof capstoneAttempts.$inferSelect

function toCard(row: AttemptRow): MarkCard {
  const feedback = row.feedback as { nextStep?: string } | null
  return {
    handInId: row.handInId,
    attemptNo: row.attemptNo ?? 0,
    status: row.status as AttemptStatus,
    total: row.total,
    band: row.band as Band | null,
    criteria: (row.criteria as CardCriterion[]) ?? [],
    basics: (row.basics as CardBasic[]) ?? [],
    nextStep: feedback?.nextStep ?? null,
    changeNote: row.changeNote,
    previousTotal: row.previousTotal,
    previousBand: row.previousBand as Band | null,
    checked: row.checkedAt !== null,
  }
}

function toQuery(row: typeof capstoneQueries.$inferSelect, handInId: string): QueryView {
  return {
    id: row.id,
    handInId,
    criterionId: row.criterionId,
    reason: row.reason,
    status: row.status as QueryView["status"],
    levelBefore: row.levelBefore as Level,
    levelAfter: row.levelAfter as Level | null,
    stillDisagrees: row.stillDisagrees,
    davidNote: row.davidNote,
  }
}

/** The learner's marked hand-ins (newest first) and their one query, if any. */
export async function getMarkCards(userId: string, capstoneId: CapstoneId): Promise<{ cards: MarkCard[]; query: QueryView | null }> {
  const db = getDb()
  const rows = await db
    .select({ attempt: capstoneAttempts })
    .from(capstoneAttempts)
    .innerJoin(capstoneSubmissions, eq(capstoneAttempts.submissionId, capstoneSubmissions.id))
    .where(
      and(
        eq(capstoneSubmissions.userId, userId),
        eq(capstoneSubmissions.capstoneId, capstoneId),
        inArray(capstoneAttempts.status, ["provisional", "final"]),
      ),
    )
    .orderBy(desc(capstoneAttempts.attemptNo))
  const cards = rows.map((r) => toCard(r.attempt)).filter((c) => c.total !== null)
  const [q] = await db
    .select({ query: capstoneQueries, handInId: capstoneAttempts.handInId })
    .from(capstoneQueries)
    .innerJoin(capstoneAttempts, eq(capstoneQueries.attemptId, capstoneAttempts.id))
    .innerJoin(capstoneSubmissions, eq(capstoneQueries.submissionId, capstoneSubmissions.id))
    .where(and(eq(capstoneSubmissions.userId, userId), eq(capstoneSubmissions.capstoneId, capstoneId)))
    .limit(1)
  return { cards, query: q ? toQuery(q.query, q.handInId) : null }
}

/** Total and band from card criteria and basics (levels to points, decision 2a). */
export function scoreCard(criteria: CardCriterion[], basics: CardBasic[]): { total: number; band: Band } {
  const exact = criteria.reduce((n, c) => n + pointsFor(c.level, { points: c.max }), 0)
  return { total: Math.round(exact), band: bandOf(exact, basics.every((b) => b.met)) }
}

/**
 * Opens the learner's one query on a marked hand-in. Returns its id; the
 * caller starts the re-mark (./judge/query.ts).
 */
export async function openQuery(userId: string, capstoneId: CapstoneId, handInId: string, criterionId: string, reason: string): Promise<string> {
  const text = reason.trim()
  if (!text) throw new HandInInputError("Explain why you think this part should get a different level.")
  if (text.length > QUERY_MAX_CHARS) throw new HandInInputError(`Keep your reason to ${QUERY_MAX_CHARS} characters or fewer.`)
  return getDb().transaction(async (tx) => {
    const [found] = await tx
      .select({ attempt: capstoneAttempts, submission: capstoneSubmissions })
      .from(capstoneAttempts)
      .innerJoin(capstoneSubmissions, eq(capstoneAttempts.submissionId, capstoneSubmissions.id))
      .where(and(eq(capstoneAttempts.handInId, handInId), eq(capstoneSubmissions.userId, userId), eq(capstoneSubmissions.capstoneId, capstoneId)))
      .for("update")
    if (!found || (found.attempt.status !== "provisional" && found.attempt.status !== "final")) {
      throw new HandInInputError("You can query your mark when it's ready.")
    }
    const criterion = ((found.attempt.criteria as CardCriterion[]) ?? []).find((c) => c.id === criterionId)
    if (!criterion) throw new HandInInputError("Choose one part of your project to query.")
    const [existing] = await tx.select({ id: capstoneQueries.id }).from(capstoneQueries).where(eq(capstoneQueries.submissionId, found.submission.id))
    if (existing) throw new HandInInputError("You've already queried this project's mark. You can query one part of a project's mark once.")
    const [row] = await tx
      .insert(capstoneQueries)
      .values({ submissionId: found.submission.id, attemptId: found.attempt.id, criterionId, reason: text, levelBefore: criterion.level })
      .returning({ id: capstoneQueries.id })
    return row!.id
  })
}

/** The learner still disagrees after the judges' re-mark: it goes to David. */
export async function stillDisagree(userId: string, capstoneId: CapstoneId): Promise<void> {
  const updated = await getDb()
    .update(capstoneQueries)
    .set({ status: "with_david", stillDisagrees: true })
    .where(
      and(
        eq(capstoneQueries.status, "answered"),
        sql`${capstoneQueries.submissionId} IN (SELECT id FROM capstone_submissions WHERE user_id = ${userId} AND capstone_id = ${capstoneId})`,
      ),
    )
    .returning({ id: capstoneQueries.id })
  if (updated.length === 0) throw new HandInInputError("Both markers need to answer your query before you can ask David to decide.")
}

/** Changes one criterion's level on a hand-in, keeping the old mark and why. */
async function changeLevels(
  handInId: string,
  levels: Record<string, Level>,
  basicsMet: Record<string, boolean> | null,
  note: string,
  final: boolean,
): Promise<void> {
  const [row] = await getDb().select().from(capstoneAttempts).where(eq(capstoneAttempts.handInId, handInId))
  if (!row) throw new Error(`no hand-in ${handInId}`)
  const criteria = ((row.criteria as CardCriterion[]) ?? []).map((c) => {
    const level = levels[c.id] ?? c.level
    return { ...c, level, points: pointsFor(level, { points: c.max }) }
  })
  const basics = ((row.basics as CardBasic[]) ?? []).map((b) => (basicsMet && b.id in basicsMet ? { ...b, met: basicsMet[b.id]! } : b))
  const { total, band } = scoreCard(criteria, basics)
  const changed = total !== row.total || band !== row.band
  await getDb()
    .update(capstoneAttempts)
    .set({
      previousTotal: changed ? row.total : row.previousTotal,
      previousBand: changed ? row.band : row.previousBand,
      changeNote: changed ? note : row.changeNote,
    })
    .where(eq(capstoneAttempts.id, row.id))
  await applyMark(handInId, {
    status: final ? "final" : (row.status as "provisional" | "final"),
    total,
    band,
    criteria,
    basics,
    feedback: row.feedback,
    flags: (row.flags as string[]) ?? [],
  })
}

/**
 * Records the judges' re-mark of a query. Agreed: the level stands (changed
 * or not) and the learner sees it. Not agreed: David decides.
 */
export async function recordRemark(queryId: string, levels: { luna: Verdict["criteria"][number] | null; haiku: Verdict["criteria"][number] | null }): Promise<"answered" | "with_david"> {
  const [found] = await getDb()
    .select({ query: capstoneQueries, handInId: capstoneAttempts.handInId })
    .from(capstoneQueries)
    .innerJoin(capstoneAttempts, eq(capstoneQueries.attemptId, capstoneAttempts.id))
    .where(eq(capstoneQueries.id, queryId))
  if (!found) throw new Error(`no query ${queryId}`)
  const agreed = levels.luna && levels.haiku && levels.luna.level === levels.haiku.level ? levels.luna.level : null
  const status: "answered" | "with_david" = agreed ? "answered" : "with_david"
  if (agreed && agreed !== found.query.levelBefore) {
    await changeLevels(found.handInId, { [found.query.criterionId]: agreed }, null, "Changed after your query: both markers looked again at your reason and agreed.", false)
  }
  await getDb()
    .update(capstoneQueries)
    .set({ status, levelAfter: agreed, remark: levels })
    .where(eq(capstoneQueries.id, queryId))
  return status
}

/** One hand-in waiting for David, with what he needs to decide. */
export interface CheckItem {
  handInId: string
  capstoneId: CapstoneId
  attemptNo: number
  status: AttemptStatus
  total: number | null
  band: Band | null
  flags: string[]
  reasons: string[]
  confirmedAt: string | null
  criteria: CardCriterion[]
  basics: CardBasic[]
  judges: { judge: string; modelId: string | null; verdict: Verdict | null; status: string }[]
  query: QueryView | null
}

/** Why a hand-in is in David's queue, in his words. */
export function queueReasons(status: string, flags: string[], query: QueryView | null, basicNames: Record<string, string> = {}): string[] {
  const out: string[] = []
  if (query && query.status === "with_david") out.push(query.stillDisagrees ? "The learner still disagrees after a re-mark" : "The judges disagreed on a query")
  if (flags.includes("judges_disagree")) out.push("The judges gave different bands")
  if (flags.includes("near_band_line")) out.push("Within 3 points of a band line")
  for (const f of flags.filter((x) => x.startsWith("basics:"))) out.push(`Basics line in doubt: ${basicNames[f.slice(7)] ?? f.slice(7)}`)
  for (const f of flags.filter((x) => x.startsWith("judge_failed:"))) out.push(`A judge could not mark it (${f.slice(13)})`)
  if (flags.includes("spend_cap")) out.push("The month's marking spend cap was reached")
  if (flags.includes("david_check:first_20")) out.push("One of the first 20 for this capstone")
  if (flags.includes("david_check:spot")) out.push("Random 1 in 20 spot check")
  if (out.length === 0 && status === "with_david") out.push("Sent to you")
  return out
}

/**
 * David's queue (decision 5): everything with_david, every agreed mark
 * flagged for his check and not yet checked, and every query with him.
 * Oldest first.
 */
export async function davidQueue(): Promise<CheckItem[]> {
  const db = getDb()
  const queried = await db.select().from(capstoneQueries).where(eq(capstoneQueries.status, "with_david"))
  const rows = await db
    .select({ attempt: capstoneAttempts, capstoneId: capstoneSubmissions.capstoneId })
    .from(capstoneAttempts)
    .innerJoin(capstoneSubmissions, eq(capstoneAttempts.submissionId, capstoneSubmissions.id))
    .where(
      or(
        eq(capstoneAttempts.status, "with_david"),
        and(eq(capstoneAttempts.status, "provisional"), sql`${capstoneAttempts.checkedAt} IS NULL`, sql`${capstoneAttempts.flags} ?| array['david_check:first_20','david_check:spot']`),
        queried.length ? inArray(capstoneAttempts.id, queried.map((q) => q.attemptId)) : sql`false`,
      ),
    )
    .orderBy(asc(capstoneAttempts.confirmedAt))
  const ids = rows.map((r) => r.attempt.id)
  const runs = ids.length
    ? await db.select().from(capstoneJudgeRuns).where(and(inArray(capstoneJudgeRuns.attemptId, ids), eq(capstoneJudgeRuns.status, "ok"))).orderBy(desc(capstoneJudgeRuns.createdAt))
    : []
  return rows.map(({ attempt, capstoneId }) => {
    const q = queried.find((x) => x.attemptId === attempt.id)
    const query = q ? toQuery(q, attempt.handInId) : null
    const latest = (judge: string) => runs.find((r) => r.attemptId === attempt.id && r.judge === judge && r.purpose !== "query")
    const flags = (attempt.flags as string[]) ?? []
    return {
      handInId: attempt.handInId,
      capstoneId: capstoneId as CapstoneId,
      attemptNo: attempt.attemptNo ?? 0,
      status: attempt.status as AttemptStatus,
      total: attempt.total,
      band: attempt.band as Band | null,
      flags,
      reasons: queueReasons(attempt.status, flags, query, Object.fromEntries(((attempt.basics as CardBasic[]) ?? []).map((b) => [b.id, b.name]))),
      confirmedAt: attempt.confirmedAt,
      criteria: (attempt.criteria as CardCriterion[]) ?? [],
      basics: (attempt.basics as CardBasic[]) ?? [],
      judges: ["luna", "haiku"].map((judge) => {
        const run = latest(judge)
        return { judge, modelId: run?.modelId ?? null, verdict: (run?.verdict as Verdict | null) ?? null, status: run?.status ?? "none" }
      }),
      query,
    }
  })
}

/** David's decision on one hand-in. */
export interface DavidDecision {
  /** Level per criterion id; criteria left out keep the shown level. */
  levels: Record<string, Level>
  /** Met per basics id; left out keeps the shown answer. */
  basics: Record<string, boolean>
  /** A line for the learner when the mark changes. */
  note?: string
}

/**
 * Records David's check: his levels become the final mark and the answer key,
 * and any query with him on this hand-in is resolved.
 */
export async function recordDavidCheck(handInId: string, decision: DavidDecision): Promise<void> {
  for (const level of Object.values(decision.levels)) {
    if (!(LEVELS as readonly string[]).includes(level)) throw new Error(`unknown level ${level}`)
  }
  const [row] = await getDb().select().from(capstoneAttempts).where(eq(capstoneAttempts.handInId, handInId))
  if (!row || row.status === "draft" || row.status === "marking") throw new Error(`hand-in ${handInId} has no mark to check`)
  const note = decision.note?.trim() || "Changed when David checked your work."
  await changeLevels(handInId, decision.levels, decision.basics, note, true)
  const criteria = ((row.criteria as CardCriterion[]) ?? []).map((c) => ({ id: c.id, level: decision.levels[c.id] ?? c.level }))
  const basics = ((row.basics as CardBasic[]) ?? []).map((b) => ({ id: b.id, met: decision.basics[b.id] ?? b.met }))
  await getDb()
    .update(capstoneAttempts)
    .set({ checkedAt: sql`NOW()`, davidLevels: { criteria, basics } })
    .where(eq(capstoneAttempts.id, row.id))
  const open = await getDb()
    .select()
    .from(capstoneQueries)
    .where(and(eq(capstoneQueries.attemptId, row.id), inArray(capstoneQueries.status, ["with_david", "answered"])))
  for (const q of open) {
    const level = decision.levels[q.criterionId] ?? criteria.find((c) => c.id === q.criterionId)?.level ?? q.levelBefore
    await getDb()
      .update(capstoneQueries)
      .set({ status: "resolved", resolvedAt: sql`NOW()`, davidNote: decision.note?.trim() || null, levelAfter: level })
      .where(eq(capstoneQueries.id, q.id))
  }
}

/**
 * Every hand-in David has checked, with his mark and each judge's (bead
 * 9289.8). Judge marks come from their first agreed-format verdict on the
 * hand-in, before any query; the pair is the average the runner used.
 */
export async function checkedMarks(): Promise<CheckedMark[]> {
  const db = getDb()
  const rows = await db
    .select({ attempt: capstoneAttempts, capstoneId: capstoneSubmissions.capstoneId })
    .from(capstoneAttempts)
    .innerJoin(capstoneSubmissions, eq(capstoneAttempts.submissionId, capstoneSubmissions.id))
    .where(sql`${capstoneAttempts.checkedAt} IS NOT NULL AND ${capstoneAttempts.davidLevels} IS NOT NULL`)
  if (rows.length === 0) return []
  const runs = await db
    .select()
    .from(capstoneJudgeRuns)
    .where(and(inArray(capstoneJudgeRuns.attemptId, rows.map((r) => r.attempt.id)), eq(capstoneJudgeRuns.status, "ok"), inArray(capstoneJudgeRuns.purpose, ["mark", "test"])))
    .orderBy(asc(capstoneJudgeRuns.createdAt))
  return rows.map(({ attempt, capstoneId }) => {
    const max = new Map(((attempt.criteria as CardCriterion[]) ?? []).map((c) => [c.id, c.max]))
    const david = attempt.davidLevels as { criteria: { id: string; level: Level }[]; basics: { id: string; met: boolean }[] }
    const score = (criteria: { id: string; level: Level }[], basicsMet: boolean) => {
      const exact = criteria.reduce((n, c) => n + pointsFor(c.level, { points: max.get(c.id) ?? 0 }), 0)
      return { exact, basicsMet, band: bandOf(exact, basicsMet) }
    }
    const judgeMark = (judge: string) => {
      const verdict = runs.find((r) => r.attemptId === attempt.id && r.judge === judge)?.verdict as Verdict | undefined
      return verdict ? score(verdict.criteria, verdict.basics.every((b) => b.met)) : null
    }
    const d = score(david.criteria, david.basics.every((b) => b.met))
    const luna = judgeMark("luna")
    const haiku = judgeMark("haiku")
    const pairTotal = luna && haiku ? (luna.exact + haiku.exact) / 2 : null
    return {
      capstoneId: capstoneId as CapstoneId,
      david: { band: d.band, total: Math.round(d.exact) },
      luna: luna ? { band: luna.band, total: Math.round(luna.exact) } : null,
      haiku: haiku ? { band: haiku.band, total: Math.round(haiku.exact) } : null,
      pair: luna && haiku && pairTotal !== null
        ? { band: bandOf(pairTotal, luna.basicsMet && haiku.basicsMet), total: Math.round(pairTotal) }
        : null,
    }
  })
}
