/**
 * Session-gated manual beta grant (W4 — Panel 4's endpoint).
 *
 * The existing POST /api/admin/beta-access stays the programmatic seam (it is
 * key-gated for the pipeline and never callable from a browser without
 * shipping the secret to the client). This route is the admin-UI wrapper: it
 * authenticates the ADMIN via the Better Auth session + ADMIN_EMAILS
 * allowlist (identical to the /admin layout gate), then REUSES the
 * beta-access handler in-process, injecting the server-side API key. No
 * grant logic is duplicated and the key never leaves the server.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdminForApi } from "@/lib/admin"
import { POST as betaAccessPost } from "@/app/api/admin/beta-access/route"

const grantSchema = z.object({
  email: z.string().email(),
  months: z.number().int().min(1).max(3).default(3),
  notes: z.string().max(500).optional(),
  sendInvite: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate

  const parsed = grantSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const apiKey =
    process.env.BETA_ACCESS_API_KEY ?? process.env.PIPELINE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Beta access API key is not configured" },
      { status: 500 }
    )
  }

  // In-process reuse of the existing endpoint — same validation, same grant
  // writes, same invite email path; no self-HTTP hop.
  const inner = new NextRequest(
    new URL("/api/admin/beta-access", request.nextUrl.origin),
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...parsed.data, apiKey }),
    }
  )
  return betaAccessPost(inner)
}
