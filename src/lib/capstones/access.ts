/**
 * Who may use a capstone's hand-in page and its API (bead gwth-launch-9289.2).
 *
 * The feature flag first (off: the page and API do not exist), then a real
 * signed-in learner with course access (the sessionless review mock is
 * refused: it has no row in "user", so nothing could be stored for it), the
 * private-content allowlist, and access to the capstone's month.
 */
import "server-only"

import { isAdminEmail } from "@/lib/admin"
import { canUserAccessMonth, getCurrentUser } from "@/lib/auth"
import { ENABLE_CAPSTONE_HAND_IN } from "@/lib/config"
import { isContentAllowedEmail, isPrivateContentMode } from "@/lib/content-mode"
import { builtInGuide, isCapstoneId, type CapstoneId } from "./guides"

/** The outcome of {@link checkHandInAccess}. */
export type HandInAccess =
  | { ok: true; userId: string; email: string; capstoneId: CapstoneId }
  | { ok: false; status: 401 | 403 | 404; message: string }

/** Checks the flag, the session and the month for one capstone. */
export async function checkHandInAccess(capstone: string): Promise<HandInAccess> {
  if (!ENABLE_CAPSTONE_HAND_IN || !isCapstoneId(capstone)) {
    return { ok: false, status: 404, message: "Not found." }
  }
  const user = await getCurrentUser()
  if (!user) return { ok: false, status: 401, message: "Sign in to hand in your project." }
  if (isPrivateContentMode() && !isContentAllowedEmail(user.email) && !isAdminEmail(user.email)) {
    return { ok: false, status: 403, message: "Hand-ins are not open to your account yet." }
  }
  if (!canUserAccessMonth(user, builtInGuide(capstone).month)) {
    return { ok: false, status: 403, message: "This project is not part of your current access." }
  }
  return { ok: true, userId: user.id, email: user.email, capstoneId: capstone }
}
