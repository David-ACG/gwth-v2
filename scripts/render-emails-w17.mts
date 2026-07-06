/**
 * W17 render harness: writes each FDE email template's HTML + plain-text part
 * to completion/W17/ so they can be screenshotted for the packet. Not shipped
 * in the app runtime.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { renderFdeEmail } from "../src/lib/email/fde-layout.ts"

const OUT = new URL("../completion/W17/", import.meta.url)
mkdirSync(OUT, { recursive: true })

const siteUrl = "https://gwth.ai"

const templates: Record<string, ReturnType<typeof renderFdeEmail>> = {
  "waitlist-confirm": renderFdeEmail({
    kicker: "Waitlist confirmed",
    heading: "You're on the list, Sam.",
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
    cta: { label: "Explore the Tech Radar", href: `${siteUrl}/tech-radar` },
    footer: [
      "GWTH.ai. Independent AI education, updated every day.",
      "You are receiving this because you joined the earlybird waitlist.",
    ],
  }),
  "beta-invite": renderFdeEmail({
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
  }),
  "verify-email": renderFdeEmail({
    kicker: "Confirm your email",
    heading: "Welcome to GWTH.ai, Sam.",
    blocks: [
      {
        type: "p",
        text: "Please confirm your email address using the button below to finish setting up your account.",
      },
      {
        type: "p",
        text: "If you didn't create this account, you can safely ignore this email.",
      },
    ],
    cta: { label: "Verify your email", href: `${siteUrl}/verify?token=demo` },
  }),
  "reset-password": renderFdeEmail({
    kicker: "Password reset",
    heading: "Reset your password, Sam.",
    blocks: [
      {
        type: "p",
        text: "We received a request to reset your GWTH.ai password. Use the button below to choose a new one.",
      },
      {
        type: "p",
        text: "If you didn't request this, you can safely ignore this email.",
      },
    ],
    cta: { label: "Reset your password", href: `${siteUrl}/reset?token=demo` },
  }),
  "admin-waitlist": renderFdeEmail({
    kicker: "New waitlist signup",
    heading: "A new earlybird joined the waitlist.",
    blocks: [
      { type: "p", text: "Name: Sam Rivera" },
      { type: "p", text: "Email: sam@example.com" },
      { type: "p", text: `Time: ${new Date().toISOString()}` },
    ],
    footer: ["GWTH.ai admin notification."],
  }),
  "admin-contact": renderFdeEmail({
    kicker: "New contact message",
    heading: "Someone sent a message via the contact form.",
    blocks: [
      { type: "p", text: "Name: Sam Rivera" },
      { type: "p", text: "Email: sam@example.com" },
      {
        type: "p",
        text: "Message: Loving the Tech Radar. When does the course open for earlybirds?",
      },
    ],
    footer: ["GWTH.ai admin notification."],
  }),
}

for (const [name, parts] of Object.entries(templates)) {
  writeFileSync(new URL(`${name}.html`, OUT), parts.html)
  writeFileSync(new URL(`${name}.txt`, OUT), parts.text)
  console.log(`wrote ${name}.html + ${name}.txt`)
}
