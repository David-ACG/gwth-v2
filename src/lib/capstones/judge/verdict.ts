/**
 * What one judge returns, and how two judges' marks become one (bead
 * gwth-launch-9289.5, decisions 2a, 3a and 7a on bead gwth-launch-9289).
 *
 * Levels to points: Not yet 0, Pass half, Good three quarters, Excellent all
 * of the criterion's points. Bands: below 40 Not yet, 40 Pass, 60 Good, 80
 * Excellent; a missed basics line makes it Not yet whatever the points.
 *
 * Two judges, the latest Luna and the latest Haiku. The mark stands
 * (provisional) when they give the same band, no basics line is missed or in
 * doubt, and the total is not within 3 points of a band line. Anything else
 * goes to David. The total shown is the average of the two totals.
 *
 * Pure: safe for tests, the runner and David's check page.
 */
import { z } from "zod"
import type { GuideBasic, GuideCriterion, MarkingGuide } from "../guide-loader"
import type { Band } from "../rules"
import type { ScriptChecks } from "../checks"

/** A level a judge can give one criterion. */
export const LEVELS = ["not_yet", "pass", "good", "excellent"] as const
/** One of {@link LEVELS}. */
export type Level = (typeof LEVELS)[number]

const FRACTION: Record<Level, number> = { not_yet: 0, pass: 0.5, good: 0.75, excellent: 1 }

/** Band lines (decision 2a). */
export const BAND_LINES = [40, 60, 80] as const

/** How close to a band line sends a mark to David (decision 3a). */
export const NEAR_BAND_POINTS = 3

const verdictSchema = z.object({
  criteria: z.array(
    z.object({
      id: z.string(),
      level: z.enum(LEVELS),
      quote: z.string(),
      feedback: z.string(),
      next_level: z.string(),
    }),
  ),
  basics: z.array(
    z.object({
      id: z.string(),
      met: z.boolean(),
      doubt: z.boolean(),
      reason: z.string(),
    }),
  ),
  next_step: z.string(),
})

/** One judge's verdict, as validated. */
export type Verdict = z.infer<typeof verdictSchema>

/** The JSON Schema given to the judge (OpenAI strict structured output accepts it as is). */
export function verdictJsonSchema(guide: MarkingGuide): Record<string, unknown> {
  const str = { type: "string" }
  return {
    type: "object",
    additionalProperties: false,
    required: ["criteria", "basics", "next_step"],
    properties: {
      criteria: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "level", "quote", "feedback", "next_level"],
          properties: {
            id: { type: "string", enum: guide.criteria.map((c) => c.id) },
            level: { type: "string", enum: [...LEVELS] },
            quote: str,
            feedback: str,
            next_level: str,
          },
        },
      },
      basics: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "met", "doubt", "reason"],
          properties: {
            id: { type: "string", enum: guide.basics.map((b) => b.id) },
            met: { type: "boolean" },
            doubt: { type: "boolean" },
            reason: str,
          },
        },
      },
      next_step: str,
    },
  }
}

/** Pulls the first JSON object out of a reply (models sometimes wrap it in a fence). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced?.[1] ?? text
  const start = body.indexOf("{")
  const end = body.lastIndexOf("}")
  if (start < 0 || end <= start) throw new Error("no JSON object in the reply")
  return JSON.parse(body.slice(start, end + 1))
}

/**
 * Validates a judge's reply against the guide: every criterion and basics
 * line exactly once, no extras. Throws with a reason the runner logs.
 */
export function parseVerdict(raw: unknown, guide: MarkingGuide): Verdict {
  const verdict = verdictSchema.parse(raw)
  const check = (kind: string, want: { id: string }[], got: { id: string }[]) => {
    const ids = got.map((g) => g.id)
    const missing = want.filter((w) => !ids.includes(w.id)).map((w) => w.id)
    const extra = ids.filter((id) => !want.some((w) => w.id === id))
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
    if (missing.length || extra.length || dupes.length) {
      throw new Error(`${kind}: missing ${missing.join(",") || "none"}, unknown ${extra.join(",") || "none"}, repeated ${dupes.join(",") || "none"}`)
    }
  }
  check("criteria", guide.criteria, verdict.criteria)
  check("basics", guide.basics, verdict.basics)
  return verdict
}

/** Points for one criterion at one level. */
export function pointsFor(level: Level, criterion: Pick<GuideCriterion, "points">): number {
  return criterion.points * FRACTION[level]
}

/** A verdict's total out of 100 (unrounded). */
export function totalOf(verdict: Verdict, guide: MarkingGuide): number {
  return guide.criteria.reduce((sum, c) => {
    const level = verdict.criteria.find((v) => v.id === c.id)?.level ?? "not_yet"
    return sum + pointsFor(level, c)
  }, 0)
}

/** The band for a total; Not yet whenever a basics line is missed. */
export function bandOf(total: number, basicsMet: boolean): Band {
  if (!basicsMet || total < 40) return "not_yet"
  if (total < 60) return "pass"
  if (total < 80) return "good"
  return "excellent"
}

/** True when a total sits within {@link NEAR_BAND_POINTS} of a band line. */
export function nearBandLine(total: number): boolean {
  return BAND_LINES.some((line) => Math.abs(total - line) <= NEAR_BAND_POINTS)
}

/** One criterion on the learner's mark card. */
export interface CardCriterion {
  id: string
  name: string
  level: Level
  points: number
  max: number
  quote: string
  feedback: string
  nextLevel: string
}

/** One basics line on the mark card. */
export interface CardBasic {
  id: string
  name: string
  met: boolean
  reason: string
}

/** The combined mark, ready for applyMark(). */
export interface Combined {
  status: "provisional" | "with_david"
  total: number
  band: Band
  criteria: CardCriterion[]
  basics: CardBasic[]
  feedback: { nextStep: string }
  flags: string[]
}

function lowerLevel(a: Level, b: Level): Level {
  return LEVELS.indexOf(a) <= LEVELS.indexOf(b) ? a : b
}

function normalise(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase()
}

/**
 * Combines the two judges. Where they give a criterion different levels the
 * card shows the lower one (and it is flagged); the total is the average of
 * the two judges' own totals. `sources` is the text the quotes must come
 * from: a quote not found there is flagged, never trusted.
 */
export function combineVerdicts(
  luna: Verdict,
  haiku: Verdict,
  guide: MarkingGuide,
  checks: ScriptChecks,
  sources: string,
): Combined {
  const flags: string[] = []
  const totals = [totalOf(luna, guide), totalOf(haiku, guide)]
  const basicsByJudge = [luna, haiku].map((v) => v.basics)
  const failedBasicChecks = checks.results.filter((r) => r.basic && !r.passed).map((r) => r.basic!)
  // A doubt sends the mark to David but does not change the judge's own band; a miss does.
  const basicsOk = (i: number) => basicsByJudge[i]!.every((b) => b.met)
  const bands = [bandOf(totals[0]!, basicsOk(0)), bandOf(totals[1]!, basicsOk(1))]
  const total = Math.round((totals[0]! + totals[1]!) / 2)

  if (bands[0] !== bands[1]) flags.push("judges_disagree")
  if (nearBandLine(totals[0]!) || nearBandLine(totals[1]!) || nearBandLine(total)) flags.push("near_band_line")
  const basicDoubts = new Set<string>(failedBasicChecks)
  for (const list of basicsByJudge) for (const b of list) if (!b.met || b.doubt) basicDoubts.add(b.id)
  for (const id of basicDoubts) flags.push(`basics:${id}`)

  const haystack = normalise(sources)
  const criteria: CardCriterion[] = guide.criteria.map((c) => {
    const a = luna.criteria.find((v) => v.id === c.id)!
    const b = haiku.criteria.find((v) => v.id === c.id)!
    if (a.level !== b.level) flags.push(`criterion_disagree:${c.id}`)
    const level = lowerLevel(a.level, b.level)
    const chosen = a.level === level ? a : b
    if (chosen.quote && !haystack.includes(normalise(chosen.quote))) flags.push(`quote_not_found:${c.id}`)
    return {
      id: c.id,
      name: c.name,
      level,
      points: pointsFor(level, c),
      max: c.points,
      quote: chosen.quote,
      feedback: chosen.feedback,
      nextLevel: chosen.next_level,
    }
  })

  const basics: CardBasic[] = guide.basics.map((g: GuideBasic) => {
    const a = luna.basics.find((v) => v.id === g.id)!
    const b = haiku.basics.find((v) => v.id === g.id)!
    const met = a.met && b.met && !failedBasicChecks.includes(g.id)
    const reason = !a.met ? a.reason : !b.met ? b.reason : a.reason
    return { id: g.id, name: g.name, met, reason }
  })

  const toDavid = flags.some((f) => f === "judges_disagree" || f === "near_band_line" || f.startsWith("basics:"))
  // When the judges agree on a band, their average is in that band too.
  const band = bandOf(total, basics.every((b) => b.met))
  return {
    status: toDavid ? "with_david" : "provisional",
    total,
    band,
    criteria,
    basics,
    feedback: { nextStep: luna.next_step || haiku.next_step },
    flags,
  }
}
