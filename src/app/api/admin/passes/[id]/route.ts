/**
 * POST /api/admin/passes/:id { action: resend | refund | extend }
 * (bead gwth-launch-v1uj.5, row 1.8). Admin only.
 *
 * - resend: queues the gift email to send again now (the next cron run, or
 *   at once here).
 * - refund: unopened passes only (the refund policy: full refund on any
 *   unopened gift). Refunds the Stripe payment, then marks the pass.
 * - extend: an unopened pass gets three more months to be opened; an opened
 *   pass gets one more month of access.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdminForApi } from "@/lib/admin"
import {
  extendPass,
  getPassById,
  markPassRefunded,
  queueGiftResend,
  recordRefund,
} from "@/lib/billing/pass-store"
import { deliverGift } from "@/lib/billing/pass-fulfil"
import { getStripeClient } from "@/lib/billing/stripe"

const bodySchema = z.object({ action: z.enum(["resend", "refund", "extend"]) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate

  const { id } = await params
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Unknown action" }, { status: 400 })

  const pass = await getPassById(id)
  if (!pass) return NextResponse.json({ error: "No such pass" }, { status: 404 })

  switch (parsed.data.action) {
    case "resend": {
      if (!pass.isGift || pass.refundedAt) {
        return NextResponse.json({ error: "Only an unrefunded gift can be resent" }, { status: 409 })
      }
      const queued = await queueGiftResend(id)
      const sent = queued ? await deliverGift(queued) : false
      return NextResponse.json({
        message: sent ? "Gift email sent again." : "Queued: the next scheduled run will send it.",
      })
    }
    case "refund": {
      if (pass.refundedAt) return NextResponse.json({ error: "Already refunded" }, { status: 409 })
      if (pass.redeemedAt) {
        return NextResponse.json({ error: "This pass has been opened, so it is not refunded here" }, { status: 409 })
      }
      if (pass.stripePaymentIntent) {
        try {
          const refund = await getStripeClient().refunds.create({ payment_intent: pass.stripePaymentIntent })
          await recordRefund(pass.stripePaymentIntent, refund.amount)
        } catch (err) {
          console.error("[admin/passes] Stripe refund failed", err)
          return NextResponse.json({ error: "Stripe refused the refund; nothing was changed" }, { status: 502 })
        }
      }
      await markPassRefunded(id)
      return NextResponse.json({ message: "Refunded in full." })
    }
    case "extend": {
      if (pass.refundedAt) return NextResponse.json({ error: "A refunded pass cannot be extended" }, { status: 409 })
      await extendPass(id)
      return NextResponse.json({
        message: pass.redeemedAt ? "One more month added." : "Three more months to open it.",
      })
    }
  }
}
