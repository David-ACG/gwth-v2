/**
 * Start Here: the signed links (bead gwth-launch-xw6s).
 *
 * David picked the gate on 2026-10-09: the public page shows the title and a
 * short summary; the visitor gives an email address; a confirmation email's
 * button brings them back and opens the lesson. On 2026-10-16 he added that
 * the whole lesson and its film sit behind an email pop-up. The consent
 * wording is in ./consent-wording.
 *
 * Links are stateless HMAC tokens, so no secret ever sits in the database:
 *   v1.<consent id>.<issued at, unix seconds>.<signature>
 * The purpose (confirm, access, unsubscribe) is signed but not written, so a
 * token made for one purpose never verifies as another.
 */
import { createHmac, timingSafeEqual } from "node:crypto"

export { CONSENT_BUTTON, CONSENT_LINE, CONSENT_VERSION } from "./consent-wording"

/** The cookie that keeps the lesson open in this browser after confirming. */
export const ACCESS_COOKIE = "gwth_start_here"
export const ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

/** The emailed button keeps working: the email is the reader's way back in. */
const CONFIRM_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export type TokenPurpose = "confirm" | "access" | "unsubscribe"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Env = Record<string, string | undefined>

function signingKey(env: Env): Buffer {
  const secret = env.START_HERE_SECRET?.trim() || env.BETTER_AUTH_SECRET?.trim()
  if (!secret) throw new Error("START_HERE_SECRET or BETTER_AUTH_SECRET must be set")
  // Derived, so a Start Here token can never be replayed as anything the auth
  // library signs with the same secret.
  return createHmac("sha256", secret).update("gwth-start-here-v1").digest()
}

function signature(purpose: TokenPurpose, id: string, iat: number, env: Env): string {
  return createHmac("sha256", signingKey(env))
    .update(`${purpose}:${id}:${iat}`)
    .digest("base64url")
}

export function signToken(
  purpose: TokenPurpose,
  consentId: string,
  env: Env = process.env,
  now: Date = new Date()
): string {
  const iat = Math.floor(now.getTime() / 1000)
  return `v1.${consentId}.${iat}.${signature(purpose, consentId, iat, env)}`
}

/** The consent id inside a valid token for this purpose, or null. */
export function verifyToken(
  purpose: TokenPurpose,
  token: string | null | undefined,
  env: Env = process.env,
  now: Date = new Date()
): string | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 4 || parts[0] !== "v1") return null
  const [, id = "", iatText = "", sig = ""] = parts
  if (!UUID.test(id) || !/^\d{1,12}$/.test(iatText)) return null
  const iat = Number(iatText)
  const age = now.getTime() / 1000 - iat
  if (age < -300) return null
  if (purpose === "confirm" && age > CONFIRM_MAX_AGE_SECONDS) return null
  if (purpose === "access" && age > ACCESS_MAX_AGE_SECONDS) return null
  let expected: string
  try {
    expected = signature(purpose, id, iat, env)
  } catch {
    return null
  }
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return id.toLowerCase()
}
