import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/server"
import { clampCourseMonth, stateForCourseMonth } from "@/lib/billing/access"

const betaAccessSchema = z.object({
  apiKey: z.string().min(1),
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  months: z.number().int().min(1).max(3).default(3),
  validUntil: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
}).refine((body) => body.userId || body.email, {
  message: "Either userId or email is required",
})

function isAuthorized(apiKey: string): boolean {
  const expectedKey = process.env.BETA_ACCESS_API_KEY ?? process.env.PIPELINE_API_KEY
  return Boolean(expectedKey && apiKey === expectedKey)
}

async function findUserIdByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
): Promise<string | null> {
  const normalizedEmail = email.toLowerCase()
  let page = 1

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    })

    if (error) throw new Error(error.message)

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    )
    if (match) return match.id
    if (data.users.length < 100) return null
    page += 1
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const parsed = betaAccessSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      )
    }

    if (!isAuthorized(parsed.data.apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const userId =
      parsed.data.userId ??
      (parsed.data.email
        ? await findUserIdByEmail(supabase, parsed.data.email)
        : null)

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const month = clampCourseMonth(parsed.data.months)
    const state = stateForCourseMonth(month)

    const { error } = await supabase.from("user_access").upsert(
      {
        user_id: userId,
        access_source: "manual_beta",
        subscription_state: state,
        subscription_month: month,
        valid_until: parsed.data.validUntil ?? null,
        grace_period_ends: null,
        notes: parsed.data.notes ?? null,
      },
      { onConflict: "user_id" }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userId,
      subscriptionState: state,
      subscriptionMonth: month,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to grant beta access" },
      { status: 500 }
    )
  }
}
