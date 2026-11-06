/**
 * The Start Here confirmation email (bead gwth-launch-xw6s).
 *
 * David, 2026-10-09: "we should send an email and then they have to click on
 * a button to return them to the page and read the lesson". The email repeats
 * the deal they agreed to and carries an opt-out link, because the line under
 * the form promises they can opt out in any email.
 */
import { renderPaperEmail, type EmailParts } from "@/lib/email/paper-layout"
import { siteOrigin } from "@/lib/billing/stripe"

type Env = Record<string, string | undefined>

export function startHereConfirmUrl(token: string, env: Env = process.env): string {
  return `${siteOrigin(env)}/api/start-here/confirm?t=${encodeURIComponent(token)}`
}

export function startHereUnsubscribeUrl(token: string, env: Env = process.env): string {
  return `${siteOrigin(env)}/start-here/unsubscribe?t=${encodeURIComponent(token)}`
}

export const START_HERE_EMAIL_SUBJECT = "Your free GWTH lesson: Start Here"

export function startHereEmail(confirmToken: string, unsubscribeToken: string, env: Env = process.env): EmailParts {
  return renderPaperEmail({
    preheader: "Press the button to open Start Here, the free GWTH lesson.",
    heading: "Here's your free lesson",
    blocks: [
      {
        type: "p",
        text: "Thank you for asking for Start Here, the free GWTH lesson. Press the button to confirm your email address and open the lesson.",
      },
      {
        type: "p",
        text: "Keep this email. The button opens the lesson again whenever you want to come back to it, on any device.",
      },
      {
        type: "p",
        text: "When you asked for the lesson, you agreed to receive news about the GWTH course when it's available. You can opt out in any email, including this one.",
      },
      {
        type: "link",
        text: "Don't want course news?",
        label: "Opt out",
        href: startHereUnsubscribeUrl(unsubscribeToken, env),
      },
    ],
    cta: { label: "Open the lesson", href: startHereConfirmUrl(confirmToken, env) },
    footer: [
      "GWTH.ai is a practical AI course for work and everyday life in the UK.",
      "You're receiving this because someone entered this address on gwth.ai/start-here. If it wasn't you, ignore this email: we only send course news to people who open the lesson from it.",
    ],
  })
}
