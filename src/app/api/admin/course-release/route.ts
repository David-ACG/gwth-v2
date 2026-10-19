/**
 * POST /api/admin/course-release { month: 2 | 3, opensOn: "YYYY-MM-DD" | null }
 * Sets or clears when Month 2 or Month 3 opens (hold the clock, decision 5).
 * The date is midnight UK time at the start of that day. Admin only.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdminForApi } from "@/lib/admin"
import { londonTimeToUtc } from "@/lib/billing/passes"
import { setMonthOpensAt } from "@/lib/billing/pass-store"

const bodySchema = z.object({
  month: z.union([z.literal(2), z.literal(3)]),
  opensOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
})

export async function POST(request: Request) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Please give a month and a date" }, { status: 400 })

  const { month, opensOn } = parsed.data
  const opensAt = opensOn
    ? londonTimeToUtc(Number(opensOn.slice(0, 4)), Number(opensOn.slice(5, 7)), Number(opensOn.slice(8, 10)))
    : null
  await setMonthOpensAt(month, opensAt, gate.email)
  return NextResponse.json({ month, opensAt: opensAt?.toISOString() ?? null })
}
