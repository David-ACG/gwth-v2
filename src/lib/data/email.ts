/**
 * Email integration stubs for waitlist and newsletter signups.
 * Will be wired to MailerSend (transactional) and MailerLite (newsletter) later.
 *
 * Env vars needed (when connecting real providers):
 * - MAILERSEND_API_KEY, MAILERSEND_DOMAIN, MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME
 * - MAILERLITE_API_KEY, MAILERLITE_GROUP_ID
 */

/**
 * Subscribes a user to the waitlist.
 * Sends a confirmation email via MailerSend.
 * Currently a stub that returns success.
 */
export async function subscribeToWaitlist(params: {
  email: string
  name?: string
}): Promise<{ success: boolean; message: string }> {
  // TODO: Wire to MailerSend transactional email
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
