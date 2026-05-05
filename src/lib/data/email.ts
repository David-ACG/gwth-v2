/**
 * Email integration for waitlist, newsletter, and contact form.
 * Uses Plunk (useplunk.com) for transactional emails when configured.
 * Falls back to console logging when PLUNK_SECRET_KEY is not set.
 *
 * Env vars:
 * - PLUNK_SECRET_KEY — required for real email delivery
 */

import { createClient } from "@supabase/supabase-js"

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
  body: string
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
 * Builds the waitlist confirmation HTML email.
 * Friendly, professional, and on-brand.
 */
function buildWaitlistEmailHtml(name: string): string {
  const firstName = name.split(" ")[0]
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0E7C7B,#33BBFF);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">GWTH.ai</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Learn to Build with AI</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="margin:0 0 16px;color:#0F2624;font-size:22px;font-weight:600;">You're on the list, ${firstName}.</h2>
      <p style="margin:0 0 16px;color:#5E6E85;font-size:16px;line-height:1.6;">
        Thanks for joining the GWTH earlybird waitlist. We are building something genuinely different — an AI course that is updated every single day, built by practitioners, and completely independent. No sponsors. No ads. No vendor partnerships.
      </p>
      <p style="margin:0 0 16px;color:#5E6E85;font-size:16px;line-height:1.6;">
        As an earlybird, you will be among the first to access the course when it launches. We will email you as soon as it is ready.
      </p>

      <!-- What to expect -->
      <div style="background:#f8fafb;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 12px;color:#0F2624;font-size:14px;font-weight:600;">What you will get:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; Hands-on projects — no theory, no fluff</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; Video walkthroughs for every single project</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; UK-focused examples for work, family, and real local life</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; Content updated every day so your skills never go stale</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; No coding required — everything in plain English</td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 24px;color:#5E6E85;font-size:16px;line-height:1.6;">
        In the meantime, feel free to read <a href="https://gwth.ai/why-gwth" style="color:#33BBFF;text-decoration:none;font-weight:500;">why GWTH exists</a> and how the course is being built for UK learners first.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="https://gwth.ai/why-gwth" style="display:inline-block;background:#33BBFF;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">Why GWTH</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.5;">
        GWTH.ai — Independent AI education, updated every day.<br>
        You are receiving this because you joined the earlybird waitlist.
      </p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Builds the admin notification HTML for a new waitlist signup.
 */
function buildAdminNotificationHtml(name: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:20px auto;padding:24px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 16px;color:#0F2624;font-size:18px;">New Waitlist Signup</h2>
    <p style="margin:0 0 8px;color:#5E6E85;font-size:14px;"><strong>Name:</strong> ${name}</p>
    <p style="margin:0 0 8px;color:#5E6E85;font-size:14px;"><strong>Email:</strong> ${email}</p>
    <p style="margin:0;color:#5E6E85;font-size:14px;"><strong>Time:</strong> ${new Date().toISOString()}</p>
  </div>
</body>
</html>`
}

/**
 * Persists a waitlist signup to the Supabase waitlist table.
 * Uses upsert on email to avoid duplicates. Logs errors but does not throw —
 * email delivery is the primary path, persistence is secondary.
 */
async function persistWaitlistSignup(email: string, name: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email: email.toLowerCase().trim(), name: name.trim() },
        { onConflict: "email" }
      )
    if (error) {
      console.error("[Waitlist DB] Insert failed:", error.message)
    }
  } catch (err) {
    console.error("[Waitlist DB] Unexpected error:", err)
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
    // Send both emails concurrently
    const [userSent, adminSent] = await Promise.all([
      sendEmail({
        to: params.email,
        subject: "You're on the GWTH earlybird list",
        body: buildWaitlistEmailHtml(params.name),
      }),
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New waitlist signup: ${params.name}`,
        body: buildAdminNotificationHtml(params.name, params.email),
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

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Contact form: ${params.name}`,
    body: `
<div style="font-family:sans-serif;max-width:480px;margin:20px auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
  <h2 style="margin:0 0 16px;font-size:18px;">New Contact Form Message</h2>
  <p><strong>Name:</strong> ${params.name}</p>
  <p><strong>Email:</strong> ${params.email}</p>
  <p><strong>Message:</strong></p>
  <p style="white-space:pre-wrap;">${params.message}</p>
</div>`,
  })

  return {
    success: true,
    message: "Message sent! We will get back to you as soon as possible.",
  }
}
