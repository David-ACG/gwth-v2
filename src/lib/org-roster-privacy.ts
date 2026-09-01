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
import { ORG_STAFF_ROLES } from "@/lib/org-admin-policy"

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
 * Roles allowed to see who else is in the organisation. Derived from the ONE
 * staff-role list in `org-admin-policy.ts` rather than restated (QA round-1
 * style note 4): two security-sensitive role lists would drift, and "may open
 * /org" and "may see the roster" are the same question — the tutor role
 * exists precisely for roster visibility (design 05 section 4, Steve's "send
 * that to your tutor"). `learner` is absent from both by construction.
 */
const ROSTER_VISIBLE_ROLES: ReadonlySet<string> = new Set(ORG_STAFF_ROLES)

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
 *   REQUIRED, not optional (QA round-1 style note 2): an optional flag
 *   defaults to false, so a better-auth upgrade that moved the field it is
 *   derived from would silently reopen that endpoint instead of failing.
 *
 * Deferring when there is no session, or when the caller holds no membership
 * in the resolved organisation, is safe: those requests never reach a roster
 * because the plugin's own handlers reject them first (401 UNAUTHORIZED /
 * FORBIDDEN not-a-member), and refusing here would only change which error a
 * non-member sees. An UNRESOLVED organisation is different and fails closed —
 * see the branch below.
 */
export function decideRosterAccess(
  path: string,
  ctx: {
    hasSession: boolean
    organisationId: string | null
    role: string | null
    targetsAnotherUser: boolean
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
    // Fail CLOSED, with no exemption (QA round-3 defect 11, tightened at
    // round 4). Deferring here assumed the hook's resolver understands every
    // identifier shape better-auth does; if a future version accepts one it
    // does not, an unresolved target would fall through to the plugin's
    // membership-only check and hand a learner the roster.
    //
    // The first attempt exempted callers who are staff SOMEWHERE, which does
    // not prove they are staff in the organisation being asked about: an
    // admin of org A who is a learner in org B would have been let through to
    // B's roster. Every identifier shape the four gated endpoints accept is
    // resolved here today, so this branch is unreachable in practice; if a
    // future version adds one, staff get a clear 403 and the resolver is
    // fixed. That is the correct direction for a security control to fail.
    return {
      kind: "refuse",
      reason: "target organisation could not be resolved",
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
