/**
 * Marks one confirmed hand-in (bead gwth-launch-9289.5): script checks, then
 * the latest Luna and the latest Haiku in parallel, then the combine rules
 * (./verdict.ts), then applyMark().
 *
 * Where a mark goes:
 *   - judges disagree, near a band line, or a basics line in doubt: with_david
 *   - a judge fails twice, or the month's spend cap would be passed: with_david
 *   - agreed, capstone not yet trusted (its 17-of-20 agreement test, bead
 *     9289.8, has not passed): provisional, flagged for David's check (he
 *     checks all of the first 20 per capstone)
 *   - agreed, capstone trusted (CAPSTONE_JUDGES_TRUSTED_FOR lists it): final,
 *     except a random 1 in 20 that stays provisional for David's spot check
 *
 * Waiting rather than marking: no published marking guide, or no API keys.
 * The hand-in stays 'marking' and the cron route tries again later.
 */
import "server-only"

import { getDb } from "@/db"
import { capstoneJudgeRuns } from "@/db/schema"
import { gte, sql } from "drizzle-orm"
import { runScriptChecks, type CheckFile } from "../checks"
import { loadPublishedGuide, type MarkingGuide } from "../guide-loader"
import { HAND_IN_QUESTIONS } from "../guides"
import { monthlyCapPence, wouldExceedCap } from "../spend"
import type { HandInStore } from "../storage"
import { applyMark, getHandInForMarking, type HandInForMarking } from "@/lib/data/capstone-hand-ins"
import { buildJudgeRequest, type JudgeFile } from "./prompt"
import { anthropicHaiku, openAiLuna, type Judge, type JudgeName, type JudgeReply } from "./providers"
import { combineVerdicts, extractJson, parseVerdict, verdictJsonSchema, type Combined, type Verdict } from "./verdict"

/** A spot check on 1 in 20 agreed marks once a capstone is trusted (decision 4). */
export const SPOT_CHECK_RATE = 1 / 20

const IMAGE_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" }

/** What {@link markHandIn} can be given instead of the real thing (tests). */
export interface RunnerDeps {
  judges?: Record<JudgeName, Judge>
  guide?: MarkingGuide
  store?: HandInStore | null
  random?: () => number
  /** 'test' for planted and made-up hand-ins. */
  purpose?: "mark" | "test"
  /** Skip writing judge runs and the mark (agreement test dry runs). */
  dryRun?: boolean
}

/** What happened to the hand-in. */
export type RunOutcome =
  | { outcome: "marked"; combined: Combined; status: "provisional" | "with_david" | "final"; replies: JudgeReply[] }
  | { outcome: "to_david"; reason: string; replies: JudgeReply[] }
  | { outcome: "waiting"; reason: string }

/** True when both API keys are set (the runner waits otherwise). */
export function judgesConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.ANTHROPIC_API_KEY)
}

/** Capstones whose judges passed the agreement test (comma list in CAPSTONE_JUDGES_TRUSTED_FOR). */
export function trustedCapstones(): string[] {
  return (process.env.CAPSTONE_JUDGES_TRUSTED_FOR ?? "").split(",").map((s) => s.trim()).filter(Boolean)
}

/** The judge's view of the stored files: text, pictures as images, the rest named. */
export function judgeFiles(handIn: Pick<HandInForMarking, "files">): JudgeFile[] {
  const decoder = new TextDecoder()
  return handIn.files.map((f) => {
    const name = f.convertedFrom ?? f.path
    if (f.kind === "text") return { name, text: decoder.decode(f.bytes) }
    const type = IMAGE_TYPES[f.path.split(".").pop()?.toLowerCase() ?? ""]
    if (f.kind === "image" && type) return { name, text: null, image: { mediaType: type, base64: Buffer.from(f.bytes).toString("base64") } }
    return { name, text: null }
  })
}

function checkFiles(handIn: Pick<HandInForMarking, "files">): CheckFile[] {
  const decoder = new TextDecoder()
  return handIn.files.map((f) => ({
    path: f.path,
    originalPath: f.convertedFrom ?? f.path,
    text: f.kind === "text" ? decoder.decode(f.bytes) : null,
    bytes: f.bytes,
  }))
}

async function spentThisMonthPence(): Promise<number> {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const [row] = await getDb()
    .select({ usd: sql<string | null>`sum(${capstoneJudgeRuns.costUsd})` })
    .from(capstoneJudgeRuns)
    .where(gte(capstoneJudgeRuns.createdAt, start))
  const rate = Number(process.env.CAPSTONE_USD_TO_GBP ?? "0.8")
  return Math.ceil(Number(row?.usd ?? 0) * rate * 100)
}

/** The expected cost of marking one hand-in, in pence (CAPSTONE_JUDGE_ESTIMATE_PENCE, default 5). */
function estimatePence(): number {
  const value = Number(process.env.CAPSTONE_JUDGE_ESTIMATE_PENCE ?? "5")
  return Number.isFinite(value) && value >= 0 ? value : 5
}

async function recordRun(
  handIn: HandInForMarking,
  purpose: "mark" | "test",
  reply: JudgeReply | null,
  judge: JudgeName,
  status: "ok" | "invalid" | "error",
  verdict: Verdict | null,
  error: string | null,
): Promise<void> {
  await getDb()
    .insert(capstoneJudgeRuns)
    .values({
      attemptId: handIn.attemptId,
      handInId: handIn.handInId,
      judge,
      modelId: reply?.modelId ?? null,
      purpose,
      status,
      inputTokens: reply?.inputTokens ?? null,
      outputTokens: reply?.outputTokens ?? null,
      costUsd: reply?.costUsd === null || reply?.costUsd === undefined ? null : String(reply.costUsd),
      verdict,
      error,
    })
}

/** Asks one judge, once more if the first reply is not a valid verdict. */
async function ask(
  name: JudgeName,
  judge: Judge,
  handIn: HandInForMarking,
  guide: MarkingGuide,
  request: ReturnType<typeof buildJudgeRequest>,
  deps: RunnerDeps,
): Promise<{ verdict: Verdict | null; replies: JudgeReply[] }> {
  const replies: JudgeReply[] = []
  for (let attempt = 1; attempt <= 2; attempt++) {
    let reply: JudgeReply | null = null
    try {
      reply = await judge(request, verdictJsonSchema(guide))
      replies.push(reply)
      const verdict = parseVerdict(extractJson(reply.text), guide)
      if (!deps.dryRun) await recordRun(handIn, deps.purpose ?? "mark", reply, name, "ok", verdict, null)
      return { verdict, replies }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!deps.dryRun) await recordRun(handIn, deps.purpose ?? "mark", reply, name, reply ? "invalid" : "error", null, message.slice(0, 2000))
    }
  }
  return { verdict: null, replies }
}

/** Marks one hand-in by its random id. See the module comment for where it goes. */
export async function markHandIn(handInId: string, deps: RunnerDeps = {}): Promise<RunOutcome> {
  const handIn = await getHandInForMarking(handInId, deps.store)
  if (handIn.status !== "marking" && deps.purpose !== "test") return { outcome: "waiting", reason: `status is ${handIn.status}` }
  const guide = deps.guide ?? (await loadPublishedGuide(handIn.capstoneId))
  if (!guide) return { outcome: "waiting", reason: "no published marking guide for this capstone" }
  const judges = deps.judges ?? (judgesConfigured() ? { luna: openAiLuna(), haiku: anthropicHaiku() } : null)
  if (!judges) return { outcome: "waiting", reason: "the judges' API keys are not set" }

  if (!deps.judges && !deps.dryRun && wouldExceedCap(await spentThisMonthPence(), estimatePence(), monthlyCapPence())) {
    await applyMark(handInId, { status: "with_david", total: null, band: null, flags: ["spend_cap"] })
    return { outcome: "to_david", reason: "the month's marking spend cap would be passed", replies: [] }
  }

  const checks = runScriptChecks({ capstone: handIn.capstoneId, files: checkFiles(handIn), labels: handIn.labels, expectedFiles: guide.expectedFiles })
  const files = judgeFiles(handIn)
  const request = buildJudgeRequest(handInId, guide, checks, handIn.answers, files, HAND_IN_QUESTIONS.map((q) => ({ id: q.id, question: q.question })))
  const [luna, haiku] = await Promise.all([
    ask("luna", judges.luna, handIn, guide, request, deps),
    ask("haiku", judges.haiku, handIn, guide, request, deps),
  ])
  const replies = [...luna.replies, ...haiku.replies]
  if (!luna.verdict || !haiku.verdict) {
    const flags = [!luna.verdict && "judge_failed:luna", !haiku.verdict && "judge_failed:haiku"].filter(Boolean) as string[]
    if (!deps.dryRun) await applyMark(handInId, { status: "with_david", total: null, band: null, flags, feedback: { scriptChecks: checks } })
    return { outcome: "to_david", reason: flags.join(", "), replies }
  }

  const sources = [...Object.values(handIn.answers), ...files.map((f) => f.text ?? "")].join("\n")
  const combined = combineVerdicts(luna.verdict, haiku.verdict, guide, checks, sources)
  let status: "provisional" | "with_david" | "final" = combined.status
  const flags = [...combined.flags]
  if (status === "provisional") {
    if (!trustedCapstones().includes(handIn.capstoneId)) flags.push("david_check:first_20")
    else if ((deps.random ?? Math.random)() < SPOT_CHECK_RATE) flags.push("david_check:spot")
    else status = "final"
  }
  if (!deps.dryRun) {
    await applyMark(handInId, {
      status,
      total: combined.total,
      band: combined.band,
      criteria: combined.criteria,
      basics: combined.basics,
      feedback: { ...combined.feedback, scriptChecks: checks },
      flags,
    })
  }
  return { outcome: "marked", combined: { ...combined, flags }, status, replies }
}
