/**
 * The learner still disagrees after the re-mark: the query goes to David,
 * whose decision is final (bead gwth-launch-9289.6, decision 6c).
 *
 *   POST /api/hand-in/familybot/query/disagree
 */
import { NextResponse } from "next/server"
import { checkHandInAccess } from "@/lib/capstones/access"
import { HandInInputError } from "@/lib/capstones/bundle"
import { stillDisagree } from "@/lib/data/capstone-marks"

export const dynamic = "force-dynamic"

export async function POST(_request: Request, { params }: { params: Promise<{ capstone: string }> }) {
  const access = await checkHandInAccess((await params).capstone)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  try {
    await stillDisagree(access.userId, access.capstoneId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof HandInInputError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error("[hand-in] still-disagree failed", error)
    return NextResponse.json({ error: "Please try again. Something went wrong." }, { status: 500 })
  }
}
