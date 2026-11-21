/**
 * The learner's public score page (bead gwth-launch-phjb): the share code,
 * the learner's opt-in, and the live score card the page shows.
 *
 * Replaces `credentials.ts`, which read `credential_verifications` from the
 * cancelled Supabase project; nothing ever wrote that table. The code lives
 * in `score_shares` (migration 034) in the website's own Postgres, and the
 * score is computed LIVE from the learner's lessons and capstone marks every
 * time the page is opened, so a link on a LinkedIn profile always shows
 * today's score.
 *
 * Takes the user id the caller already authenticated (or, for the public
 * page, the id the public code belongs to); nothing here reads a session.
 */
import "server-only"

import { randomInt } from "node:crypto"
import { and, eq, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { scoreShares, user } from "@/db/schema"
import { CAPSTONE_IDS } from "@/lib/capstones/guides"
import { BAND_LABELS } from "@/lib/capstones/rules"
import type { ProjectGrade } from "@/components/marketing/score-badge/score-badge"
import {
  SHARE_CODE_ALPHABET,
  SHARE_CODE_LENGTH,
  isShareCode,
} from "@/lib/score/share"
import { getLearnerScore } from "./progress"

/** A learner's share code and whether they have made it public. */
export type ScoreShare = {
  code: string
  isPublic: boolean
  /** When the code was minted: the issue date LinkedIn shows. */
  createdAt: Date
}

/** Everything the score badge needs for one learner, today. */
export type ScoreCard = {
  code: string
  name: string
  /** Points held today, 0 to 100. */
  shown: number
  /** Points earned before any fall-back. */
  earned: number
  status: "ok" | "fall"
  grades: [ProjectGrade, ProjectGrade, ProjectGrade]
  /** When the score last changed (null before anything has been earned). */
  lastChangedAt: Date | null
  /** When the learner last passed a lesson (Bible gwth-score-fall-back rule 4). */
  lastPassedAt: Date | null
}

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = "23505"

function errorCode(error: unknown): unknown {
  let e: unknown = error
  for (let depth = 0; e && typeof e === "object" && depth < 3; depth++) {
    const code = (e as { code?: unknown }).code
    if (code) return code
    e = (e as { cause?: unknown }).cause
  }
  return undefined
}

/** A fresh random code (about 49 bits). */
export function mintShareCode(): string {
  let code = ""
  for (let i = 0; i < SHARE_CODE_LENGTH; i++) {
    code += SHARE_CODE_ALPHABET[randomInt(SHARE_CODE_ALPHABET.length)]
  }
  return code
}

function toShare(row: { code: string; isPublic: boolean; createdAt: string }): ScoreShare {
  return { code: row.code, isPublic: row.isPublic, createdAt: new Date(row.createdAt) }
}

/** The learner's share code, or null before they have ever shared. */
export async function getScoreShare(userId: string): Promise<ScoreShare | null> {
  const rows = await getDb()
    .select({ code: scoreShares.code, isPublic: scoreShares.isPublic, createdAt: scoreShares.createdAt })
    .from(scoreShares)
    .where(eq(scoreShares.userId, userId))
    .limit(1)
  return rows[0] ? toShare(rows[0]) : null
}

/**
 * Turns the learner's public score page on or off. The first time it is
 * turned on, a code is minted; after that the same code is kept for good, so
 * a link already on a profile keeps working when the page is turned on again.
 */
export async function setScoreSharePublic(userId: string, isPublic: boolean): Promise<ScoreShare> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const rows = await getDb()
        .insert(scoreShares)
        .values({ userId, code: mintShareCode(), isPublic })
        .onConflictDoUpdate({
          target: scoreShares.userId,
          set: { isPublic, updatedAt: sql`NOW()` },
        })
        .returning({ code: scoreShares.code, isPublic: scoreShares.isPublic, createdAt: scoreShares.createdAt })
      const row = rows[0]
      if (!row) throw new Error("score_shares upsert returned no row")
      return toShare(row)
    } catch (error) {
      // A new code that happens to match another learner's: draw again.
      if (errorCode(error) === UNIQUE_VIOLATION) continue
      throw error
    }
  }
  throw new Error("Could not mint a unique score share code")
}

function grade(band: string | undefined): ProjectGrade {
  if (band && band in BAND_LABELS) return BAND_LABELS[band as keyof typeof BAND_LABELS] as ProjectGrade
  return "Not yet"
}

/** The score card for one learner, computed now. */
export async function getScoreCardForUser(
  userId: string,
  name: string,
  code: string,
  now: Date = new Date()
): Promise<ScoreCard> {
  const { score, marks } = await getLearnerScore(userId, now)
  const at = (month: number) => {
    const id = CAPSTONE_IDS[month]
    return grade(id ? marks.bands[id] : undefined)
  }
  return {
    code,
    name,
    shown: score.overallScore,
    earned: Math.max(score.earnedScore, score.overallScore),
    status: score.falling ? "fall" : "ok",
    grades: [at(0), at(1), at(2)],
    lastChangedAt: score.lastChangedAt,
    lastPassedAt: score.lastPassedAt,
  }
}

/**
 * The public score card for a share code, or null when the code is unknown
 * or the learner has not made it public (the page then shows a 404, so a
 * private code reveals nothing, not even that it exists).
 */
export async function getPublicScoreCard(code: string, now: Date = new Date()): Promise<ScoreCard | null> {
  if (!isShareCode(code)) return null
  const rows = await getDb()
    .select({ userId: scoreShares.userId, name: user.name })
    .from(scoreShares)
    .innerJoin(user, eq(user.id, scoreShares.userId))
    .where(and(eq(scoreShares.code, code), eq(scoreShares.isPublic, true)))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return getScoreCardForUser(row.userId, row.name, code, now)
}

/**
 * The signed-in learner's own score card and share state, for the dashboard
 * and the progress page. Null with no signed-in learner (the dev mock path).
 */
export async function getMyScoreCard(
  userId: string,
  name: string
): Promise<{ card: ScoreCard; share: ScoreShare | null }> {
  const share = await getScoreShare(userId)
  const card = await getScoreCardForUser(userId, name, share?.code ?? "")
  return { card, share }
}
