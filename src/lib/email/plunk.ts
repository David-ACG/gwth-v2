/**
 * Minimal Plunk transactional email helper (W11 — Better Auth).
 *
 * Posts a single transactional email to Plunk's `/v1/send` endpoint. Used by the
 * Better Auth send-callbacks (password reset + email verification). Kept tiny and
 * dependency-free (global `fetch`).
 *
 * When no Plunk key is set (local dev / mock mode) this logs and no-ops so
 * imports and signup flows never crash without a key configured.
 *
 * Env vars (unified with the existing waitlist/contact helper):
 * - PLUNK_NEXT_SECRET_KEY — a key for the new hosted Plunk (next-api.useplunk.com).
 *   When set it wins, and mail goes to the new API. The two services are separate
 *   accounts, so each key only works on its own host; giving the new key its own
 *   name means an older build that only knows PLUNK_SECRET_KEY keeps working while
 *   the new key sits in its environment.
 * - PLUNK_SECRET_KEY — the legacy hosted Plunk key (api.useplunk.com).
 * - PLUNK_API_KEY — legacy alias, accepted as a fallback only.
 * Absent → console log + no-op.
 */

/** Legacy hosted Plunk. It drops our text/plain part and its free-tier badge has no
 * alt text: 8.8/10 on mail-tester (2026-10-09), where the new API scores 10/10. */
export const LEGACY_PLUNK_SEND_URL = "https://api.useplunk.com/v1/send"
export const NEXT_PLUNK_SEND_URL = "https://next-api.useplunk.com/v1/send"

/** Which Plunk this deployment sends through, or null when no key is set. */
export function resolvePlunk(
  env: Record<string, string | undefined> = process.env,
): { url: string; key: string } | null {
  const next = env.PLUNK_NEXT_SECRET_KEY?.trim()
  if (next) return { url: NEXT_PLUNK_SEND_URL, key: next }
  const legacy = (env.PLUNK_SECRET_KEY ?? env.PLUNK_API_KEY)?.trim()
  return legacy ? { url: LEGACY_PLUNK_SEND_URL, key: legacy } : null
}

const FROM_EMAIL = "david@gwth.ai"
const FROM_NAME = "GWTH.ai"

/**
 * Sends one transactional email via Plunk. Returns true on success, false on
 * failure or when no API key is configured (dev no-op).
 */
export async function sendPlunkEmail(params: {
  to: string
  subject: string
  /** HTML part. */
  body: string
  /** Optional plain-text alternative shipped alongside the HTML (W17). */
  text?: string
}): Promise<boolean> {
  // EMAIL_OUTBOX_DIR (hlab preview and tests only, never production): keep a
  // copy of every email as JSON so an end-to-end run can read what was sent.
  await writeToOutbox(params)

  // Reserved test domains (RFC 2606: example.com/.org/.net, .test, .invalid,
  // .example) never reach a real inbox; sending would only bounce and hurt
  // the sender's reputation. Test runs read the outbox instead.
  if (isReservedTestAddress(params.to)) return false

  const plunk = resolvePlunk()
  if (!plunk) {
    console.log(
      `[Plunk] no Plunk key set (PLUNK_SECRET_KEY) — skipping email to ${params.to} (subject: ${params.subject})`,
    )
    return false
  }

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
        name: FROM_NAME,
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

export function isReservedTestAddress(to: string): boolean {
  const domain = to.trim().toLowerCase().split("@")[1] ?? ""
  return (
    /^example\.(com|org|net)$/.test(domain) ||
    /\.(test|invalid|example)$/.test(domain) ||
    /^(test|invalid|example)$/.test(domain)
  )
}

async function writeToOutbox(params: {
  to: string
  subject: string
  body: string
  text?: string
}): Promise<void> {
  const dir = process.env.EMAIL_OUTBOX_DIR?.trim()
  if (!dir) return
  try {
    const { mkdir, writeFile } = await import("node:fs/promises")
    const { join } = await import("node:path")
    await mkdir(dir, { recursive: true })
    const at = new Date().toISOString()
    const safe = params.to.replace(/[^a-z0-9@._-]/gi, "_")
    const name = `${at.replace(/[:.]/g, "-")}-${safe}-${Math.random().toString(36).slice(2, 8)}.json`
    await writeFile(
      join(dir, name),
      JSON.stringify({ at, to: params.to, subject: params.subject, html: params.body, text: params.text ?? "" }, null, 2)
    )
  } catch (err) {
    console.error("[Plunk] could not write to EMAIL_OUTBOX_DIR:", err)
  }
}
