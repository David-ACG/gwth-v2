/**
 * Email integration stubs for waitlist, newsletter, and contact form.
 * Will be wired to MailerSend (transactional) and MailerLite (newsletter) later.
 *
 * Env vars needed (when connecting real providers):
 * - MAILERSEND_API_KEY, MAILERSEND_DOMAIN, MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME
 * - MAILERLITE_API_KEY, MAILERLITE_GROUP_ID
 */

/**
 * Subscribes a user to the waitlist.
 * In production: sends a confirmation email to the user via MailerSend,
 * and a notification email to the admin (david@agilecommercegroup.com).
 * Currently a stub that returns success.
 */
export async function subscribeToWaitlist(params: {
  email: string
  name?: string
}): Promise<{ success: boolean; message: string }> {
  // TODO: Wire to MailerSend transactional email
  // 1. Send confirmation email to user
  // 2. Send notification email to admin (david@agilecommercegroup.com)
  console.log(`[Stub] Waitlist signup: ${params.email} (${params.name ?? "no name"})`)
  return {
    success: true,
    message: "You've been added to the waitlist! Check your email for confirmation.",
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
