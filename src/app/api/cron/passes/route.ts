/**
 * POST /api/cron/passes: the gift sale's scheduler (bead gwth-launch-v1uj.5,
 * row 1.7). The app has no job runner, so a Coolify scheduled task on
 * production (a P520 systemd timer for hlab) calls this every 15 minutes:
 *
 *   curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://gwth.ai/api/cron/passes
 *
 * Each run, idempotently (every email is claimed before it is sent):
 * - sends each gift email whose delivery time has come,
 * - retries any buyer receipt the webhook failed to send,
 * - holds payers' next charge while the month they would pay for is not
 *   open (hold the clock), when billing is on.
 * Fails closed: no CRON_SECRET on the server, nothing runs.
 */
import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { ENABLE_BILLING } from "@/lib/config"
import { listDueGifts, listUnsentReceipts } from "@/lib/billing/pass-store"
import { deliverGift, sendReceipt } from "@/lib/billing/pass-fulfil"
import { holdPayersForUnopenedMonths } from "@/lib/billing/subscriptions"

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

  const now = new Date()
  const result = { giftsSent: 0, giftsFailed: 0, receiptsSent: 0, payersHeld: 0, errors: [] as string[] }

  try {
    for (const pass of await listDueGifts(now)) {
      if (await deliverGift(pass)) result.giftsSent++
      else result.giftsFailed++
    }
    for (const pass of await listUnsentReceipts(new Date(now.getTime() - 10 * 60 * 1000))) {
      if (await sendReceipt(pass)) result.receiptsSent++
    }
  } catch (err) {
    console.error("[cron/passes] pass emails failed", err)
    result.errors.push("pass_emails")
  }

  if (ENABLE_BILLING && process.env.STRIPE_SECRET_KEY) {
    try {
      result.payersHeld = await holdPayersForUnopenedMonths(now)
    } catch (err) {
      console.error("[cron/passes] payer holds failed", err)
      result.errors.push("payer_holds")
    }
  }

  return NextResponse.json(result, { status: result.errors.length ? 500 : 200 })
}
