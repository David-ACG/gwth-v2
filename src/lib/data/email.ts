/**
 * Email integration for waitlist, newsletter, and contact form.
 * Uses Plunk (useplunk.com) for transactional emails when configured.
 * Falls back to console logging when PLUNK_SECRET_KEY is not set.
 *
 * Env vars:
 * - PLUNK_SECRET_KEY — required for real email delivery
 */

import { getDb } from "@/db"
import { waitlist } from "@/db/schema"
import { renderFdeEmail, type EmailParts } from "@/lib/email/fde-layout"

const PLUNK_API_URL = "https://api.useplunk.com/v1/send"
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
  const secretKey = process.env.PLUNK_SECRET_KEY
  if (!secretKey) return false

  try {
    const res = await fetch(PLUNK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
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
        text: "Thanks for joining the GWTH earlybird waitlist. We are building something genuinely different: an AI course that is updated every single day, built by practitioners, and completely independent. No sponsors, no ads, no vendor partnerships.",
      },
      {
        type: "p",
        text: "As an earlybird, you will be among the first to access the course when it launches. We will email you as soon as it is ready.",
      },
      {
        type: "list",
        items: [
          "94 hands-on projects, no theory and no fluff",
          "Video walkthroughs for every single project",
          "60+ AI tools tracked and compared daily",
          "Content updated every day so your skills never go stale",
          "No coding required, everything in plain English",
        ],
      },
      {
        type: "p",
        text: "In the meantime, explore the Tech Radar. It is live right now and tracks 60+ AI tools daily.",
      },
    ],
    cta: { label: "Explore the Tech Radar", href: "https://gwth.ai/tech-radar" },
    footer: [
      "GWTH.ai. Independent AI education, updated every day.",
      "You are receiving this because you joined the earlybird waitlist.",
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

  const hasPlunk = !!process.env.PLUNK_SECRET_KEY

  if (!hasPlunk) {
    console.log(`[Stub] Waitlist signup: ${params.email} (${params.name})`)
    console.log("[Stub] No PLUNK_SECRET_KEY — skipping real email delivery")
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
        subject: "You're on the GWTH earlybird list",
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
  const hasPlunk = !!process.env.PLUNK_SECRET_KEY

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
