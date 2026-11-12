/**
 * Telling David an account was flagged (bead gwth-launch-735c). Sent straight
 * from the site, so it does not depend on the P520 being on. David, 12 Nov
 * 2026: "lets do all 3 - slack, email and telegram". Each channel is switched
 * on by its own setting; with none set the flag still waits on /admin/flagged
 * and nothing is sent. One channel failing never stops the others.
 *
 *   FLAG_ALERT_SLACK_WEBHOOK      a Slack incoming-webhook URL (secret)
 *   FLAG_ALERT_EMAIL              an address to email through Plunk
 *   FLAG_ALERT_TELEGRAM_TOKEN     a Telegram bot token (secret)
 *   FLAG_ALERT_TELEGRAM_CHAT_ID   the chat the bot posts to
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

export type AlertChannel = "slack" | "email" | "telegram"

/**
 * The address David opens: the public sign-in origin (gwth.ai in production,
 * the Tailscale preview on hlab). NEXT_PUBLIC_SITE_URL can be a local address
 * on the preview, so it is only the fallback.
 */
function siteUrl(): string {
  return (process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://gwth.ai").replace(/\/+$/, "")
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

/** The channels switched on by the settings. */
export function enabledChannels(env: NodeJS.ProcessEnv = process.env): AlertChannel[] {
  const out: AlertChannel[] = []
  if (env.FLAG_ALERT_SLACK_WEBHOOK) out.push("slack")
  if (env.FLAG_ALERT_EMAIL) out.push("email")
  if (env.FLAG_ALERT_TELEGRAM_TOKEN && env.FLAG_ALERT_TELEGRAM_CHAT_ID) out.push("telegram")
  return out
}

async function postJson(url: string, payload: unknown, label: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) console.error(`[protection] ${label} alert refused`, res.status)
    return res.ok
  } catch (error) {
    console.error(`[protection] ${label} alert failed`, error)
    return false
  }
}

/**
 * Send the alert on every channel that is switched on. Returns the channels
 * that accepted it; the flag records an alert as sent when at least one did.
 */
export async function sendFlagAlert(a: FlagAlert): Promise<AlertChannel[]> {
  const { title, body } = alertText(a)
  const env = process.env
  const channels = enabledChannels(env)
  if (channels.length === 0) {
    console.info("[protection] flag", a.flagId, "recorded; no alert channel set")
    return []
  }
  const results = await Promise.all(
    channels.map(async (channel): Promise<[AlertChannel, boolean]> => {
      if (channel === "slack") {
        return [channel, await postJson(env.FLAG_ALERT_SLACK_WEBHOOK as string, { text: `*${title}*\n${body}` }, "Slack")]
      }
      if (channel === "telegram") {
        return [
          channel,
          await postJson(
            `https://api.telegram.org/bot${env.FLAG_ALERT_TELEGRAM_TOKEN}/sendMessage`,
            { chat_id: env.FLAG_ALERT_TELEGRAM_CHAT_ID, text: `${title}\n${body}`, disable_web_page_preview: true },
            "Telegram"
          ),
        ]
      }
      const ok = await sendPlunkEmail({
        to: env.FLAG_ALERT_EMAIL as string,
        subject: title,
        body: `<p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>`,
        text: body,
      }).catch(() => false)
      return [channel, ok]
    })
  )
  return results.filter(([, ok]) => ok).map(([channel]) => channel)
}
