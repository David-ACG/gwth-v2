/**
 * Org role policy (N6, resolves N5 QA defect 4 — 013_org_tenancy.sql:45).
 *
 * Better Auth's organization plugin supports comma-separated MULTI-role
 * values ("tutor,admin") on members and invitations; our tenancy layer
 * deliberately does not. The DB CHECKs (013) accept single roles only, and
 * everything that reads role treats it as a scalar: the one-org-per-learner
 * partial unique index (`WHERE role = 'learner'`), the roster queries, the
 * tutor visibility gate. A member holding "tutor,admin" would silently
 * escape all of them, so instead of widening the CHECK (which would push
 * comma-parsing into every query), the plugin is constrained to SINGLE
 * roles here — a clean application-layer refusal instead of a raw 23514
 * constraint violation surfacing as a 500. The DB CHECK stays as backstop.
 *
 * This module is imported by `src/lib/better-auth.ts` (organizationHooks)
 * and kept dependency-free so it can be unit tested without the auth stack.
 */

/** Every role the GWTH tenancy schema knows (013 CHECK twins). */
export const ORG_MEMBER_ROLES = ["owner", "admin", "tutor", "learner"] as const

/** Roles an invitation may grant: never `owner` (013 invitation CHECK). */
export const ORG_INVITABLE_ROLES = ["admin", "tutor", "learner"] as const

/** The error shape the guard reports; better-auth.ts maps it to APIError. */
export class OrgRoleError extends Error {}

/**
 * Normalises a Better Auth role input (string, comma-joined string, or
 * array) and asserts it is exactly ONE known role. Returns the single role.
 *
 * @param role The role value as the plugin hands it to organizationHooks.
 * @param opts.invitation When true, `owner` is additionally refused with a
 *   clean message (invitations cannot grant owner — N5 QA style note 4's
 *   raw-23514 path becomes an application-layer refusal too).
 * @throws OrgRoleError with a user-presentable message on any violation.
 */
export function assertSingleOrgRole(
  role: string | string[] | null | undefined,
  opts: { invitation?: boolean } = {}
): string {
  const joined = Array.isArray(role) ? role.join(",") : (role ?? "")
  const parts = joined
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    throw new OrgRoleError("A role is required.")
  }
  if (parts.length > 1) {
    throw new OrgRoleError(
      "Each member holds exactly one role. Pick one of owner, admin, tutor or learner."
    )
  }
  const single = parts[0]!
  if (!(ORG_MEMBER_ROLES as readonly string[]).includes(single)) {
    throw new OrgRoleError(
      `Unknown role "${single}". Valid roles are owner, admin, tutor and learner.`
    )
  }
  if (opts.invitation && single === "owner") {
    throw new OrgRoleError(
      "Invitations cannot grant the owner role. Invite the person as admin, tutor or learner."
    )
  }
  return single
}
