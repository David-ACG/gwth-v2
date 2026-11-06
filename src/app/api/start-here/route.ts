/**
 * Start Here sign-up (bead gwth-launch-xw6s).
 *
 * Records the consent with the exact wording that was on screen, then emails
 * a link that confirms the address and opens the lesson. Nothing is unlocked
 * here: only the link in the email opens the lesson.
 */
import { z } from "zod"
import { sendPlunkEmail } from "@/lib/email/plunk"
import { CONSENT_VERSION, signToken } from "@/lib/start-here/consent"
import { START_HERE_EMAIL_SUBJECT, startHereEmail } from "@/lib/start-here/emails"
import { MAX_SIGNUPS_PER_HOUR, normaliseEmail, recentSignupCount, recordConsent } from "@/lib/start-here/store"

const bodySchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").max(254).email("Enter a valid email address."),
  consentVersion: z.string(),
  // Left empty by people; bots that fill every field get a quiet success.
  website: z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, message: "Something went wrong. Please try again." }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address."
    return Response.json({ success: false, message }, { status: 400 })
  }
  const { email, consentVersion, website } = parsed.data
  if (website) return Response.json({ success: true })

  // The wording stored is the server's copy, so it must be the wording the
  // visitor saw. A page loaded before a wording change asks for a reload.
  if (consentVersion !== CONSENT_VERSION) {
    return Response.json(
      { success: false, message: "This page has changed since you opened it. Please reload it and try again." },
      { status: 409 }
    )
  }

  try {
    if ((await recentSignupCount(email)) >= MAX_SIGNUPS_PER_HOUR) {
      return Response.json(
        {
          success: false,
          message: "We've already sent a few emails to this address. Check your inbox and junk folder, or try again in an hour.",
        },
        { status: 429 }
      )
    }
    const id = await recordConsent(email)
    const parts = startHereEmail(signToken("confirm", id), signToken("unsubscribe", id))
    const sent = await sendPlunkEmail({
      to: normaliseEmail(email),
      subject: START_HERE_EMAIL_SUBJECT,
      body: parts.html,
      text: parts.text,
    })
    if (!sent) console.error("[start-here] confirmation email not sent for consent", id)
    return Response.json({ success: true })
  } catch (err) {
    console.error("[start-here] sign-up failed:", err)
    return Response.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 })
  }
}
