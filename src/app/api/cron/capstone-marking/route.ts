/**
 * POST /api/cron/capstone-marking: marks hand-ins waiting for the judges
 * (bead gwth-launch-9289.5). Each confirmed hand-in is also marked straight
 * after the learner hands it in; this catches any that waited (no API keys
 * yet, no published guide, a server restart mid-mark). A Coolify scheduled
 * task on production (a P520 timer for hlab) calls it every 10 minutes:
 *
 *   curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://gwth.ai/api/cron/capstone-marking
 *
 * Fails closed: no CRON_SECRET on the server, nothing runs. Marks at most
 * five per call, one after another, so a backlog cannot burst the spend cap.
 */
import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { markHandIn } from "@/lib/capstones/judge/runner"
import { handInsAwaitingMarking } from "@/lib/data/capstone-hand-ins"

export const dynamic = "force-dynamic"
export const maxDuration = 600

function sameKey(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET
  if (!expected) return NextResponse.json({ error: "CRON_SECRET not configured on server" }, { status: 500 })
  const presented = request.headers.get("x-cron-secret") ?? ""
  if (!presented || !sameKey(presented, expected)) return NextResponse.json({ error: "Invalid cron secret" }, { status: 401 })

  const results: { handInId: string; outcome: string; detail?: string }[] = []
  for (const handInId of await handInsAwaitingMarking(5)) {
    try {
      const run = await markHandIn(handInId)
      results.push({ handInId, outcome: run.outcome, detail: run.outcome === "marked" ? run.status : run.reason })
    } catch (error) {
      console.error("[capstone-marking] failed", handInId, error)
      results.push({ handInId, outcome: "error", detail: error instanceof Error ? error.message : String(error) })
    }
  }
  return NextResponse.json({ results })
}
