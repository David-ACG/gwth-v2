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
import { sendPlunkEmail } from "@/lib/email/plunk"
import { renderFdeEmail } from "@/lib/email/fde-layout"
import { resolvePublicEmailBase } from "@/lib/email/auth-links"

const betaAccessSchema = z.object({
  apiKey: z.string().min(1),
  userId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  months: z.number().int().min(1).max(3).default(3),
  validUntil: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  // W5: opt-in beta invite email. Default false preserves the existing
  // grant-only behaviour for programmatic callers (e.g. the pipeline).
  sendInvite: z.boolean().default(false),
}).refine((body) => body.userId || body.email, {
  message: "Either userId or email is required",
})

/**
 * Sends the hand-picked beta invite email (W5). Best-effort: any failure is
 * swallowed so a grant always succeeds even when Plunk is down. Returns whether
 * Plunk accepted the send.
 */
async function sendBetaInviteEmail(email: string): Promise<boolean> {
  // Not NEXT_PUBLIC_SITE_URL directly: on a dev box that is http://localhost:3000,
  // which would put three unreachable links in a real invite (the same fault that
  // sent David a localhost verify button on 2026-07-26).
  const siteUrl = resolvePublicEmailBase()
  try {
    const parts = renderFdeEmail({
      kicker: "Beta access granted",
      heading: "You're in. Your GWTH.ai beta access is ready.",
      blocks: [
        {
          type: "p",
          text: "You have been given early access to the GWTH.ai beta. There is nothing to pay, your access is on us during the beta.",
        },
        {
          type: "p",
          text: `To get started, sign up with this email address at ${siteUrl}/signup and confirm your email. Then read the short beta guide at ${siteUrl}/guide: what is ready, what is switched off on purpose, and how to report problems.`,
        },
        {
          type: "p",
          text: "If anything looks wrong, please use the report a problem panel inside the app. Thank you for testing early.",
        },
      ],
      cta: { label: "Sign up and confirm", href: `${siteUrl}/signup` },
    })
    return await sendPlunkEmail({
      to: email,
      subject: "You're in: your GWTH.ai beta access",
      body: parts.html,
      text: parts.text,
    })
  } catch {
    return false
  }
}

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

    const inviteSent =
      parsed.data.sendInvite && email ? await sendBetaInviteEmail(email) : false

    return NextResponse.json({
      success: true,
      email,
      userId,
      subscriptionState: state,
      subscriptionMonth: month,
      inviteSent,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to grant beta access" },
      { status: 500 }
    )
  }
}
