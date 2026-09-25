import { NextResponse } from "next/server"
import { requireAdminForApi } from "@/lib/admin"
import { betaTesterPatchSchema } from "@/lib/comments/validation"
import { setBetaTester } from "@/lib/data/page-comments"

/** Postgres foreign-key violation, possibly wrapped by Drizzle. */
function isForeignKeyViolation(err: unknown): boolean {
  const codeOf = (value: unknown) =>
    value && typeof value === "object" ? (value as { code?: unknown }).code : undefined
  const cause = err && typeof err === "object" ? (err as { cause?: unknown }).cause : undefined
  return codeOf(err) === "23503" || codeOf(cause) === "23503"
}

/**
 * PATCH /api/admin/beta-testers: body {userId, betaTester}.
 *
 * The "Beta tester" tick box on /admin/roster. A ticked user can comment on
 * the real student view (src/lib/comments/role.ts). Admin only.
 */
export async function PATCH(request: Request) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate
  const admin = gate

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const parsed = betaTesterPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { userId, betaTester } = parsed.data
  try {
    await setBetaTester(userId, betaTester, admin.id)
    return NextResponse.json({ ok: true, userId, betaTester })
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return NextResponse.json({ error: "No such user" }, { status: 404 })
    }
    console.error("[admin/beta-testers] could not update", err)
    return NextResponse.json({ error: "Unable to update beta tester" }, { status: 500 })
  }
}
