/**
 * POST /api/cron/hand-in-retention: deletes capstone hand-in files when they
 * are due (bead gwth-launch-9289.11, decision 7b). The app has no job runner,
 * so a Coolify scheduled task on production (a P520 systemd timer for hlab)
 * calls this once a day:
 *
 *   curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://gwth.ai/api/cron/hand-in-retention
 *
 * Each run, idempotently: deletes the stored files and recording of every
 * hand-in whose mark has been final for 12 months (the mark and feedback
 * stay), and removes drafts never handed in after 30 days.
 * Fails closed: no CRON_SECRET on the server, nothing runs. With no hand-ins
 * store configured there is nothing stored to delete, so it does nothing.
 */
import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { handInStore } from "@/lib/capstones/storage"
import { deleteExpiredHandInFiles } from "@/lib/data/capstone-retention"

export const dynamic = "force-dynamic"

function sameKey(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured on server" }, { status: 500 })
  }
  const presented = request.headers.get("x-cron-secret") ?? ""
  if (!presented || !sameKey(presented, expected)) {
    return NextResponse.json({ error: "Invalid cron secret" }, { status: 401 })
  }

  const store = handInStore()
  if (!store) return NextResponse.json({ skipped: "no hand-ins store configured" })

  try {
    const result = await deleteExpiredHandInFiles(new Date(), store)
    return NextResponse.json(
      { deleted: result.deleted.length, draftsRemoved: result.draftsRemoved.length, failed: result.failed },
      { status: result.failed.length ? 500 : 200 },
    )
  } catch (err) {
    console.error("[cron/hand-in-retention] failed", err)
    return NextResponse.json({ error: "retention_failed" }, { status: 500 })
  }
}
