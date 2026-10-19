/**
 * POST /api/passes/open: opens a gift or pass for the signed-in account
 * (bead gwth-launch-v1uj.4). The clock starts now. Body: { code }.
 *
 * Deliberately NOT behind BILLING_ENABLED: a pass that was paid for must stay
 * openable even if new sales are switched off.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { getSessionIdentity } from "@/lib/auth"
import { normalisePassCode } from "@/lib/billing/passes"
import { openPass } from "@/lib/billing/pass-store"
import { sendOpenedEmail } from "@/lib/billing/pass-fulfil"

const bodySchema = z.object({ code: z.string().max(40) })

const MESSAGES: Record<string, { status: number; error: string }> = {
  not_found: { status: 404, error: "We can't find that code. Please check it and try again." },
  refunded: { status: 410, error: "This gift was refunded, so it can't be opened." },
  expired: { status: 410, error: "This gift's opening deadline has passed. Please contact us for help." },
  opened_by_someone_else: { status: 409, error: "This gift has already been opened on another account." },
  already_has_access: {
    status: 409,
    error: "You already have the course. Keep the code to open later, or give it to someone else before its deadline.",
  },
}

export async function POST(request: Request) {
  const identity = await getSessionIdentity()
  if (!identity) {
    return NextResponse.json(
      { code: "login_required", error: "Please sign in or create an account first." },
      { status: 401 }
    )
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  const code = parsed.success ? normalisePassCode(parsed.data.code) : null
  if (!code) {
    return NextResponse.json({ code: "not_found", error: MESSAGES.not_found!.error }, { status: 404 })
  }

  const result = await openPass(code, identity.id)
  if (!result.ok) {
    const m = MESSAGES[result.reason] ?? MESSAGES.not_found!
    return NextResponse.json({ code: result.reason, error: m.error }, { status: m.status })
  }

  if (!result.alreadyYours) {
    await sendOpenedEmail(result.pass, { email: identity.email, name: identity.name }).catch((err) =>
      console.error("[passes] opened email failed", err)
    )
  }
  return NextResponse.json({ opened: true, product: result.pass.product })
}
