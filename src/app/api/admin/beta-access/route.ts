import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { betaAccessGrants, userAccess, user } from "@/db/schema"
import {
  clampCourseMonth,
  normalizeBetaAccessEmail,
  stateForCourseMonth,
} from "@/lib/billing/access"

const betaAccessSchema = z.object({
  apiKey: z.string().min(1),
  userId: z.string().min(1).optional(),
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

/**
 * Resolves a Better Auth user id from an email by querying the canonical
 * `public."user"` table directly (W11 — replaces the Supabase
 * `auth.admin.listUsers` paged scan).
 */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const normalizedEmail = normalizeBetaAccessEmail(email)
  const db = getDb()
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)
  return rows[0]?.id ?? null
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

    const db = getDb()
    const email = parsed.data.email
      ? normalizeBetaAccessEmail(parsed.data.email)
      : null
    const userId =
      parsed.data.userId ?? (email ? await findUserIdByEmail(email) : null)

    const month = clampCourseMonth(parsed.data.months)
    const state = stateForCourseMonth(month)
    const validUntil = parsed.data.validUntil ?? null
    const notes = parsed.data.notes ?? null

    if (email) {
      await db
        .insert(betaAccessGrants)
        .values({
          email,
          userId,
          subscriptionMonth: month,
          validUntil,
          notes,
        })
        .onConflictDoUpdate({
          target: betaAccessGrants.email,
          set: {
            userId,
            subscriptionMonth: month,
            validUntil,
            notes,
          },
        })
    }

    if (userId) {
      await db
        .insert(userAccess)
        .values({
          userId,
          accessSource: "manual_beta",
          subscriptionState: state,
          subscriptionMonth: month,
          validUntil,
          gracePeriodEnds: null,
          notes,
        })
        .onConflictDoUpdate({
          target: userAccess.userId,
          set: {
            accessSource: "manual_beta",
            subscriptionState: state,
            subscriptionMonth: month,
            validUntil,
            gracePeriodEnds: null,
            notes,
          },
        })
    }

    return NextResponse.json({
      success: true,
      email,
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
