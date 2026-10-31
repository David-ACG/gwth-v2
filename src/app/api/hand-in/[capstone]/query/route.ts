/**
 * Query a capstone mark (bead gwth-launch-9289.6, decision 6c).
 *
 *   POST /api/hand-in/familybot/query   JSON { handInId, criterionId, reason }
 *
 * One query per capstone. Both judges re-mark that criterion with the
 * learner's reason attached, straight after the reply is sent.
 */
import { after, NextResponse } from "next/server"
import { checkHandInAccess } from "@/lib/capstones/access"
import { HandInInputError } from "@/lib/capstones/bundle"
import { remarkQuery } from "@/lib/capstones/judge/query"
import { openQuery } from "@/lib/data/capstone-marks"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ capstone: string }> }) {
  const access = await checkHandInAccess((await params).capstone)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  const body = (await request.json().catch(() => null)) as { handInId?: unknown; criterionId?: unknown; reason?: unknown } | null
  if (!body || typeof body.handInId !== "string" || typeof body.criterionId !== "string" || typeof body.reason !== "string") {
    return NextResponse.json({ error: "Choose a criterion and say why." }, { status: 400 })
  }
  try {
    const queryId = await openQuery(access.userId, access.capstoneId, body.handInId, body.criterionId, body.reason)
    after(async () => {
      await remarkQuery(queryId).catch((error) => console.error("[hand-in] query re-mark failed", error))
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof HandInInputError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error("[hand-in] query failed", error)
    return NextResponse.json({ error: "Something went wrong sending your query. Please try again." }, { status: 500 })
  }
}
