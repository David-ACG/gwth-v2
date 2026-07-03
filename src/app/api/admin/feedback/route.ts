/**
 * Admin feedback-inbox state (W4 — Panel 3's read/unread marker).
 *
 * PATCH toggles one feedback row's read marker. Gated identically to the
 * /admin layout (Better Auth session + ADMIN_EMAILS allowlist) via
 * requireAdminForApi — a UI gate alone is not security.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdminForApi } from "@/lib/admin"
import { setFeedbackRead } from "@/lib/data/feedback"

const readSchema = z.object({
  id: z.string().uuid(),
  read: z.boolean(),
})

export async function PATCH(request: NextRequest) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate

  const parsed = readSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    await setFeedbackRead(parsed.data.id, parsed.data.read)
    return NextResponse.json({
      success: true,
      id: parsed.data.id,
      read: parsed.data.read,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to update feedback" },
      { status: 500 }
    )
  }
}
