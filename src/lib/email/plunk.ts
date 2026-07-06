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
 * - PLUNK_SECRET_KEY — the shared Plunk account key (same one
 *   `src/lib/data/email.ts` uses). Preferred.
 * - PLUNK_API_KEY — legacy alias, accepted as a fallback only.
 * Absent → console log + no-op.
 */

const PLUNK_API_URL = "https://api.useplunk.com/v1/send"
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
  const apiKey = process.env.PLUNK_SECRET_KEY ?? process.env.PLUNK_API_KEY
  if (!apiKey) {
    console.log(
      `[Plunk] no Plunk key set (PLUNK_SECRET_KEY) — skipping email to ${params.to} (subject: ${params.subject})`,
    )
    return false
  }

  try {
    const res = await fetch(PLUNK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
