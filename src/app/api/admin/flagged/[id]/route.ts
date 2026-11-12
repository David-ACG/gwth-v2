/**
 * POST /api/admin/flagged/:id { action: clear | suspend | reinstate, note? }
 * (bead gwth-launch-735c). Admin only.
 *
 * - clear ("Looks fine"): the held month opens from now and the learner's
 *   clock restarts (the next pass month or charge follows from today).
 * - suspend: no course access until reinstated. A person always makes this
 *   call (UK GDPR as amended, Feb 2026): the monitor only flags.
 * - reinstate: a suspended account comes back, as if cleared.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdminForApi } from "@/lib/admin"
import { resolveFlag } from "@/lib/protection/store"

const bodySchema = z.object({
  action: z.enum(["clear", "suspend", "reinstate"]),
  note: z.string().max(1000).optional(),
})

const DONE: Record<z.infer<typeof bodySchema>["action"], string> = {
  clear: "Cleared: the held month is open again.",
  suspend: "Suspended: no course access until you reinstate it.",
  reinstate: "Reinstated.",
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate

  const id = Number((await params).id)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
  const ok = await resolveFlag(id, parsed.data.action, gate.email, parsed.data.note)
  if (!ok) return NextResponse.json({ error: "That flag is not open any more." }, { status: 409 })
  return NextResponse.json({ ok: true, message: DONE[parsed.data.action] })
}
