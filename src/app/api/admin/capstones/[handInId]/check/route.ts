/**
 * POST /api/admin/capstones/<hand_in_id>/check: David's decision on one
 * capstone hand-in (bead gwth-launch-9289.7). Body:
 *   { levels: { <criterion id>: "not_yet"|"pass"|"good"|"excellent" },
 *     basics: { <basics id>: true|false }, note?: string }
 * His levels become the final mark and the answer key; a changed mark carries
 * his note to the learner. Admin only.
 */
import { NextResponse } from "next/server"
import { requireAdminForApi } from "@/lib/admin"
import { LEVELS, type Level } from "@/lib/capstones/judge/verdict"
import { recordDavidCheck } from "@/lib/data/capstone-marks"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ handInId: string }> }) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate
  const { handInId } = await params
  if (!/^h_[A-Za-z0-9_-]{22}$/.test(handInId)) return NextResponse.json({ error: "not found" }, { status: 404 })
  const body = (await request.json().catch(() => null)) as { levels?: Record<string, unknown>; basics?: Record<string, unknown>; note?: unknown } | null
  const levels: Record<string, Level> = {}
  for (const [id, level] of Object.entries(body?.levels ?? {})) {
    if (!(LEVELS as readonly unknown[]).includes(level)) return NextResponse.json({ error: `bad level for ${id}` }, { status: 400 })
    levels[id] = level as Level
  }
  const basics: Record<string, boolean> = {}
  for (const [id, met] of Object.entries(body?.basics ?? {})) {
    if (typeof met !== "boolean") return NextResponse.json({ error: `bad basics value for ${id}` }, { status: 400 })
    basics[id] = met
  }
  const note = typeof body?.note === "string" ? body.note.slice(0, 500) : undefined
  try {
    await recordDavidCheck(handInId, { levels, basics, note })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
