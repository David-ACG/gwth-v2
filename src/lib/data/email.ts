/**
 * Email integration for waitlist, newsletter, and contact form.
 * Uses MailerSend for transactional emails when configured.
 * Falls back to console logging when MAILERSEND_API_KEY is not set.
 *
 * Env vars:
 * - MAILERSEND_API_KEY — required for real email delivery
 * - MAILERSEND_FROM_EMAIL — sender address (default: hello@gwth.ai)
 * - MAILERSEND_FROM_NAME — sender name (default: GWTH.ai)
 */

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"

/** Returns a configured MailerSend client, or null if no API key is set. */
function getMailerSend(): MailerSend | null {
  const apiKey = process.env.MAILERSEND_API_KEY
  if (!apiKey) return null
  return new MailerSend({ apiKey })
}

/** Returns the configured sender for transactional emails. */
function getSender(): Sender {
  return new Sender(
    process.env.MAILERSEND_FROM_EMAIL ?? "hello@gwth.ai",
    process.env.MAILERSEND_FROM_NAME ?? "GWTH.ai"
  )
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
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; 94 hands-on projects — no theory, no fluff</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; Video walkthroughs for every single project</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5E6E85;font-size:14px;line-height:1.5;">&#10003;&ensp; 60+ AI tools tracked and compared daily</td>
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
        In the meantime, feel free to explore the <a href="https://gwth.ai/tech-radar" style="color:#33BBFF;text-decoration:none;font-weight:500;">Tech Radar</a> — it is live right now and tracks 60+ AI tools daily.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="https://gwth.ai/tech-radar" style="display:inline-block;background:#33BBFF;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">Explore the Tech Radar</a>
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
 * Subscribes a user to the waitlist.
 * Sends a confirmation email to the user and a notification to the admin.
 * When MAILERSEND_API_KEY is not set, falls back to console logging.
 */
export async function subscribeToWaitlist(params: {
  email: string
  name: string
}): Promise<{ success: boolean; message: string }> {
  const mailerSend = getMailerSend()

  if (!mailerSend) {
    console.log(`[Stub] Waitlist signup: ${params.email} (${params.name})`)
    console.log("[Stub] No MAILERSEND_API_KEY — skipping real email delivery")
    return {
      success: true,
      message: "You've been added to the waitlist!",
    }
  }

  try {
    const sender = getSender()

    // 1. Send confirmation email to the user
    const userEmail = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient(params.email, params.name)])
      .setSubject("You're on the GWTH earlybird list")
      .setHtml(buildWaitlistEmailHtml(params.name))

    await mailerSend.email.send(userEmail)

    // 2. Send notification to admin
    const adminEmail = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient("david@agilecommercegroup.com", "David")])
      .setSubject(`New waitlist signup: ${params.name}`)
      .setHtml(buildAdminNotificationHtml(params.name, params.email))

    await mailerSend.email.send(adminEmail)

    return {
      success: true,
      message: "You've been added to the waitlist! Check your email for confirmation.",
    }
  } catch (error) {
    console.error("[MailerSend] Failed to send waitlist emails:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Subscribes a user to the newsletter via MailerLite.
 * Currently a stub that returns success.
 */
export async function subscribeToNewsletter(params: {
  email: string
}): Promise<{ success: boolean; message: string }> {
  // TODO: Wire to MailerLite API
  console.log(`[Stub] Newsletter signup: ${params.email}`)
  return {
    success: true,
    message: "You're subscribed to our newsletter!",
  }
}

/**
 * Submits a contact form message.
 * In production: sends the message to david@agilecommercegroup.com via MailerSend,
 * and sends a confirmation email to the sender.
 * Currently a stub that logs and returns success.
 */
export async function submitContactForm(params: {
  name: string
  email: string
  message: string
}): Promise<{ success: boolean; message: string }> {
  // TODO: Wire to MailerSend
  // 1. Send message to admin (david@agilecommercegroup.com) with sender details
  // 2. Send confirmation email to sender ("We received your message")
  console.log(`[Stub] Contact form: ${params.name} <${params.email}> — ${params.message.slice(0, 50)}...`)
  return {
    success: true,
    message: "Message sent! We will get back to you as soon as possible.",
  }
}
