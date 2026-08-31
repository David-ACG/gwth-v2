/**
 * Roster privacy policy (N7 — closes N5 QA defect 3).
 *
 * Better Auth's organization plugin authorises the roster-bearing endpoints
 * on MEMBERSHIP, not on role: verified against better-auth 1.6.19's own
 * source, `/organization/get-full-organization` calls
 * `adapter.checkMembership()` and returns the full member + invitation lists,
 * and `/organization/list-members` / `/organization/list-invitations` only
 * assert `findMemberByOrgId()` exists. A learner therefore reads every other
 * student's name, email and role — the exact hole the tutor-only roster was
 * supposed to prevent. Giving `learner` an empty permission set does NOT
 * close it, because these endpoints never consult the access controller.
 *
 * The fix is a `hooks.before` refusal on the auth instance
 * (`src/lib/better-auth.ts`). It is deliberately at the API layer rather than
 * in the /org pages: the hook runs for `auth.api.*` server-side dispatch too
 * (see `dispatchAuthEndpoint` in better-auth's api/dispatch), so a future
 * server component that calls the plugin directly cannot silently re-open the
 * hole.
 *
 * This module is pure and dependency-free so the policy can be unit tested
 * without the auth stack or a database; `better-auth.ts` supplies the
 * request-shaped inputs and performs the (single, indexed) role lookup.
 */

/**
 * Endpoints that return OTHER members' or invitees' identities. Each was
 * read in `node_modules/better-auth/dist/plugins/organization/routes/` and
 * confirmed to authorise on membership alone:
 *
 * - `get-full-organization` — members[] + invitations[] (checkMembership)
 * - `list-members`          — members[] (findMemberByOrgId)
 * - `list-invitations`      — invitations[] (findMemberByOrgId)
 * - `get-active-member-role` — another member's role when `userId` is passed
 *
 * `set-active` is NOT here: it returns `findOrganizationById`, which carries
 * no member list. `list-user-invitations` and `get-invitation` are scoped to
 * the caller's own email by the plugin.
 */
export const ROSTER_BEARING_PATHS = new Set([
  "/organization/get-full-organization",
  "/organization/list-members",
  "/organization/list-invitations",
  "/organization/get-active-member-role",
])

/**
 * Roles allowed to see who else is in the organisation: the institution
 * admin, the org owner GWTH holds, and the tutor whose whole purpose is
 * roster visibility (design 05 section 4, Steve's "send that to your tutor").
 * `learner` is deliberately absent.
 */
const ROSTER_VISIBLE_ROLES = new Set(["owner", "admin", "tutor"])

/** The refusal message a learner sees instead of the roster. */
export const ROSTER_FORBIDDEN_MESSAGE =
  "You do not have permission to view this organisation's members or invitations."

/** True when this org role may read the member/invitation lists. */
export function canReadOrgRoster(role: string | null | undefined): boolean {
  if (!role) return false
  // Roles are single by policy (src/lib/org-roles.ts) — but a comma value
  // that somehow reached the DB must not widen access, so EVERY part has to
  // be roster-visible for the answer to be yes.
  const parts = role
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return false
  return parts.every((part) => ROSTER_VISIBLE_ROLES.has(part))
}

/** What the hook should do with one request. */
export type RosterAccessDecision =
  /** Not a roster-bearing endpoint — the hook must not interfere. */
  | { kind: "not-applicable" }
  /** Let the plugin's own handler answer (it will apply its own checks). */
  | { kind: "defer"; reason: string }
  /** Refuse with 403 before the handler runs. */
  | { kind: "refuse"; reason: string }

/**
 * The whole policy, as one pure function.
 *
 * @param path The Better Auth endpoint path being dispatched.
 * @param ctx.hasSession Whether a session resolved for this request.
 * @param ctx.organisationId The org the request targets, or null when it
 *   could not be determined (no id/slug in the request and no active org).
 * @param ctx.role The caller's role in that organisation, or null when they
 *   hold no membership there.
 * @param ctx.targetsAnotherUser Only meaningful for `get-active-member-role`:
 *   true when the request asks for someone ELSE's role. Reading your own role
 *   is always allowed — the /org screens and the learner UI both need it.
 *
 * Deferring (rather than refusing) when the org or the session is unknown is
 * safe: those requests never reach a roster, because the plugin's own
 * handlers reject them first (401 UNAUTHORIZED / BAD_REQUEST
 * ORGANIZATION_NOT_FOUND / FORBIDDEN not-a-member). Refusing them here would
 * only change which error a non-member sees.
 */
export function decideRosterAccess(
  path: string,
  ctx: {
    hasSession: boolean
    organisationId: string | null
    role: string | null
    targetsAnotherUser?: boolean
  }
): RosterAccessDecision {
  if (!ROSTER_BEARING_PATHS.has(path)) return { kind: "not-applicable" }

  if (
    path === "/organization/get-active-member-role" &&
    !ctx.targetsAnotherUser
  ) {
    return { kind: "defer", reason: "reading one's own role" }
  }

  if (!ctx.hasSession) {
    return { kind: "defer", reason: "no session — the endpoint returns 401" }
  }
  if (!ctx.organisationId) {
    return {
      kind: "defer",
      reason: "no target organisation — the endpoint returns 400",
    }
  }
  if (!ctx.role) {
    return {
      kind: "defer",
      reason: "not a member — the endpoint returns 403",
    }
  }
  if (canReadOrgRoster(ctx.role)) {
    return { kind: "defer", reason: `role "${ctx.role}" may read the roster` }
  }
  return { kind: "refuse", reason: `role "${ctx.role}" may not read the roster` }
}
