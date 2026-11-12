/**
 * Telling David an account was flagged (bead gwth-launch-735c). Sent straight
 * from the site, so it does not depend on the P520 being on. Each channel is
 * switched on by its own setting; with none set the flag still waits on
 * /admin/flagged and nothing is sent.
 *
 *   FLAG_ALERT_SLACK_WEBHOOK  a Slack incoming-webhook URL (secret)
 *   FLAG_ALERT_EMAIL          an address to email through Plunk
 */
import "server-only"

import { sendPlunkEmail } from "@/lib/email/plunk"

export type FlagAlert = {
  flagId: number
  email: string
  heldMonth: number | null
  reasons: string[]
  summary: string
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL ?? "https://gwth.ai").replace(/\/+$/, "")
}

export function flagLink(flagId: number): string {
  return `${siteUrl()}/admin/flagged#flag-${flagId}`
}

export function alertText(a: FlagAlert): { title: string; body: string } {
  const held = a.heldMonth ? ` Month ${a.heldMonth} is held until you look.` : ""
  return {
    title: `GWTH: account moving too fast: ${a.email}`,
    body: `${a.reasons.join("; ")}.${held}\n${a.summary}.\nOpen: ${flagLink(a.flagId)}`,
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** True when at least one channel accepted the alert. */
export async function sendFlagAlert(a: FlagAlert): Promise<boolean> {
  const { title, body } = alertText(a)
  let sent = false
  const webhook = process.env.FLAG_ALERT_SLACK_WEBHOOK
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: `*${title}*\n${body}` }),
      })
      sent = sent || res.ok
      if (!res.ok) console.error("[protection] Slack alert refused", res.status)
    } catch (error) {
      console.error("[protection] Slack alert failed", error)
    }
  }
  const to = process.env.FLAG_ALERT_EMAIL
  if (to) {
    const ok = await sendPlunkEmail({
      to,
      subject: title,
      body: `<p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>`,
      text: body,
    }).catch(() => false)
    sent = sent || ok
  }
  if (!webhook && !to) console.info("[protection] flag", a.flagId, "recorded; no alert channel set")
  return sent
}
