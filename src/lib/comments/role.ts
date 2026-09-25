/**
 * Who may comment on the real student view (contract: ./types.ts).
 *
 *   admin: the real session email is on ADMIN_EMAILS (David)
 *   beta:  the user has a beta_testers row (ticked on /admin/roster)
 *   null:  everyone else, who must see nothing and trigger no requests
 *
 * Resolved from the REAL Better Auth session (getSessionIdentity), never the
 * dashboard mock user, so the preview's mock learner can never comment.
 * Wrapped in React cache() so a layout and a route resolve it once per
 * request.
 */
import "server-only"

import { cache } from "react"
import { getSessionIdentity } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { isBetaTester } from "@/lib/data/page-comments"
import type { CommentRole } from "./types"

export interface CommentIdentity {
  id: string
  name: string
  email: string
}

export interface CommentRoleResult {
  role: CommentRole | null
  identity: CommentIdentity | null
}

export const getCommentRole = cache(async function getCommentRole(): Promise<CommentRoleResult> {
  const identity = await getSessionIdentity()
  if (!identity) return { role: null, identity: null }
  if (isAdminEmail(identity.email)) return { role: "admin", identity }

  try {
    if (await isBetaTester(identity.id)) return { role: "beta", identity }
  } catch (error) {
    // A missing beta_testers table (migration 021 not yet run) or a DB blip
    // must never break the page this runs on; the person simply cannot
    // comment until it is fixed.
    console.warn("[comments] could not read beta_testers; treating as no role", error)
  }
  return { role: null, identity }
})
