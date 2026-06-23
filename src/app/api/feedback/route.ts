import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { feedbackSchema } from "@/lib/validations"
import { sendPlunkEmail } from "@/lib/email/plunk"
import {
  createFeedback,
  markFeedbackEmailSent,
  getAllFeedback,
  getFeedbackForUser,
  isFeedbackAdmin,
} from "@/lib/data/feedback"

/** Address that receives a notification for every submission. */
const NOTIFY_EMAIL = "david@gwth.ai"

/**
 * Resolves the current Better Auth session user (id + email), or null. Reads
 * the session directly rather than via `getCurrentUser()` so the channel is
 * open to ANY signed-in tester, including those still resolving their beta
 * grant (the access gate is for content, not for reporting a problem).
 */
async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  if (!process.env.DATABASE_URL) return null
  try {
    const { getAuth } = await import("@/lib/better-auth")
    const session = await getAuth().api.getSession({ headers: await headers() })
    const u = session?.user
    if (!u) return null
    return { id: u.id, email: u.email ?? "" }
  } catch {
    return null
  }
}

/** Escapes a string for safe interpolation into the notification HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * POST /api/feedback — persist one tester feedback row, then best-effort email
 * david@gwth.ai. The row is ALWAYS saved first: if Plunk fails (or no key is
 * configured) the feedback is never lost, and `emailSent` simply stays false.
 */
export async function POST(request: Request) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const userAgent = request.headers.get("user-agent")

  // 1. Persist first — this is the durable record and must not depend on email.
  let row
  try {
    row = await createFeedback({
      userId: sessionUser.id,
      sourcePath: parsed.data.sourcePath,
      category: parsed.data.category,
      message: parsed.data.message,
      userAgent,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unable to save feedback",
      },
      { status: 500 }
    )
  }

  // 2. Best-effort notification. Any failure here is swallowed so the saved row
  //    is still reported as success to the tester.
  let emailSent = false
  try {
    emailSent = await sendPlunkEmail({
      to: NOTIFY_EMAIL,
      subject: `GWTH beta feedback: ${parsed.data.category} (${parsed.data.sourcePath})`,
      body: `<p><strong>New beta feedback</strong></p>
<p><strong>From:</strong> ${escapeHtml(sessionUser.email)} (${escapeHtml(sessionUser.id)})</p>
<p><strong>Category:</strong> ${escapeHtml(parsed.data.category)}</p>
<p><strong>Page:</strong> ${escapeHtml(parsed.data.sourcePath)}</p>
<p><strong>Message:</strong></p>
<blockquote>${escapeHtml(parsed.data.message).replace(/\n/g, "<br>")}</blockquote>`,
    })
    if (emailSent) {
      try {
        await markFeedbackEmailSent(row.id)
      } catch {
        // Flag update is cosmetic — the email was accepted; never fail here.
      }
    }
  } catch {
    // Plunk threw — the row is already saved; report success without the email.
    emailSent = false
  }

  return NextResponse.json({ success: true, id: row.id, emailSent })
}

/**
 * GET /api/feedback — returns the caller's own feedback rows. Admins
 * (david@gwth.ai) receive every row, powering the W4 inbox. Per D2 this scoping
 * is enforced here in application code, not by the database.
 */
export async function GET() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rows = isFeedbackAdmin(sessionUser.email)
      ? await getAllFeedback()
      : await getFeedbackForUser(sessionUser.id)
    return NextResponse.json({ feedback: rows })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unable to load feedback",
      },
      { status: 500 }
    )
  }
}
