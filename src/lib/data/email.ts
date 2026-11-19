/**
 * Email integration for waitlist, newsletter, and contact form.
 * Uses Plunk (useplunk.com) for transactional emails when configured.
 * Falls back to console logging when PLUNK_SECRET_KEY is not set.
 *
 * Env vars:
 * - PLUNK_SECRET_KEY — required for real email delivery
 * - PLUNK_NEXT_SECRET_KEY — new Plunk key; wins when set (see src/lib/email/plunk.ts)
 */

import { getDb } from "@/db"
import { waitlist } from "@/db/schema"
import { renderFdeEmail, type EmailParts } from "@/lib/email/fde-layout"
import { resolvePlunk } from "@/lib/email/plunk"

const FROM_EMAIL = "david@gwth.ai"
const FROM_NAME = "GWTH.ai"
const ADMIN_EMAIL = "david@agilecommercegroup.com"

/**
 * Sends an email via the Plunk API.
 * Returns true on success, false on failure.
 */
async function sendEmail(params: {
  to: string
  subject: string
  /** HTML part. */
  body: string
  /** Optional plain-text alternative shipped alongside the HTML (W17). */
  text?: string
  name?: string
}): Promise<boolean> {
  const plunk = resolvePlunk()
  if (!plunk) return false

  try {
    const res = await fetch(plunk.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${plunk.key}`,
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        body: params.body,
        ...(params.text ? { text: params.text } : {}),
        from: FROM_EMAIL,
        name: params.name ?? FROM_NAME,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("[Plunk] Send failed:", res.status, error)
      return false
    }

    return true
  } catch (err) {
    console.error("[Plunk] Unexpected error:", err)
    return false
  }
}

/**
 * Builds the waitlist confirmation email on the FDE register (W17).
 * Returns both an HTML part and a matching plain-text part.
 */
function buildWaitlistEmail(name: string): EmailParts {
  const firstName = name.split(" ")[0]?.trim() || "there"
  return renderFdeEmail({
    kicker: "Waitlist confirmed",
    heading: `You're on the list, ${firstName}.`,
    blocks: [
      {
        type: "p",
        text: "Thanks for joining the GWTH waitlist. We'll email you when places open.",
      },
      {
        type: "p",
        text: "GWTH is a practical AI course for work and everyday life in the UK. It has three monthly parts, with about five hours of learning each week.",
      },
      {
        type: "p",
        text: "You'll work on a project in every lesson. We rewrite lessons as the tools change.",
      },
      {
        type: "p",
        text: "While you wait, try the free lesson to see what learning with GWTH is like.",
      },
    ],
    cta: { label: "Try the free lesson", href: "https://gwth.ai/start-here" },
    footer: [
      "From the GWTH team",
      "You're receiving this email because you joined the GWTH waitlist.",
    ],
  })
}

/**
 * Builds the admin notification email for a new waitlist signup (FDE register).
 */
function buildAdminNotification(name: string, email: string): EmailParts {
  return renderFdeEmail({
    kicker: "New waitlist signup",
    heading: "A new earlybird joined the waitlist.",
    blocks: [
      { type: "p", text: `Name: ${name}` },
      { type: "p", text: `Email: ${email}` },
      { type: "p", text: `Time: ${new Date().toISOString()}` },
    ],
    footer: ["GWTH.ai admin notification."],
  })
}

/**
 * Persists a waitlist signup to the waitlist table (app Postgres via Drizzle).
 * Uses upsert on email to avoid duplicates. Logs errors but does not throw —
 * email delivery is the primary path, persistence is secondary.
 */
async function persistWaitlistSignup(email: string, name: string): Promise<void> {
  try {
    const db = getDb()
    await db
      .insert(waitlist)
      .values({ email: email.toLowerCase().trim(), name: name.trim() })
      .onConflictDoUpdate({
        target: waitlist.email,
        set: { name: name.trim() },
      })
  } catch (err) {
    console.error("[Waitlist DB] Insert failed:", err)
  }
}

/**
 * Subscribes a user to the waitlist.
 * Persists the signup to Supabase, then sends confirmation + admin notification
 * via Plunk. When PLUNK_SECRET_KEY is not set, falls back to console logging
 * but still persists to the database.
 */
export async function subscribeToWaitlist(params: {
  email: string
  name: string
}): Promise<{ success: boolean; message: string }> {
  // Always persist to Supabase (non-blocking — errors are logged, not thrown)
  await persistWaitlistSignup(params.email, params.name)

  const hasPlunk = resolvePlunk() !== null

  if (!hasPlunk) {
    console.log(`[Stub] Waitlist signup: ${params.email} (${params.name})`)
    console.log("[Stub] No Plunk key — skipping real email delivery")
    return {
      success: true,
      message: "You've been added to the waitlist!",
    }
  }

  try {
    const userEmail = buildWaitlistEmail(params.name)
    const adminEmail = buildAdminNotification(params.name, params.email)
    // Send both emails concurrently
    const [userSent, adminSent] = await Promise.all([
      sendEmail({
        to: params.email,
        subject: "You're on the GWTH waitlist",
        body: userEmail.html,
        text: userEmail.text,
      }),
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New waitlist signup: ${params.name}`,
        body: adminEmail.html,
        text: adminEmail.text,
      }),
    ])

    if (!userSent) {
      console.error("[Plunk] Failed to send user confirmation to:", params.email)
    }
    if (!adminSent) {
      console.error("[Plunk] Failed to send admin notification")
    }

    return {
      success: true,
      message: "You've been added to the waitlist! Check your email for confirmation.",
    }
  } catch (error) {
    console.error("[Plunk] Failed to send waitlist emails:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Subscribes a user to the newsletter.
 * Currently a stub that returns success.
 */
export async function subscribeToNewsletter(params: {
  email: string
}): Promise<{ success: boolean; message: string }> {
  console.log(`[Stub] Newsletter signup: ${params.email}`)
  return {
    success: true,
    message: "You're subscribed to our newsletter!",
  }
}

/**
 * Submits a contact form message.
 * Sends the message to the admin and a confirmation to the sender via Plunk.
 */
export async function submitContactForm(params: {
  name: string
  email: string
  message: string
}): Promise<{ success: boolean; message: string }> {
  const hasPlunk = resolvePlunk() !== null

  if (!hasPlunk) {
    console.log(`[Stub] Contact form: ${params.name} <${params.email}> — ${params.message.slice(0, 50)}...`)
    return {
      success: true,
      message: "Message sent! We will get back to you as soon as possible.",
    }
  }

  const contactEmail = renderFdeEmail({
    kicker: "New contact message",
    heading: "Someone sent a message via the contact form.",
    blocks: [
      { type: "p", text: `Name: ${params.name}` },
      { type: "p", text: `Email: ${params.email}` },
      { type: "p", text: `Message: ${params.message}` },
    ],
    footer: ["GWTH.ai admin notification."],
  })
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Contact form: ${params.name}`,
    body: contactEmail.html,
    text: contactEmail.text,
  })

  return {
    success: true,
    message: "Message sent! We will get back to you as soon as possible.",
  }
}
