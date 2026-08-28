/**
 * Unit tests for the single-role org policy (N6, N5 QA defect 4).
 *
 * Better Auth's organization plugin can store comma-separated multi-role
 * values; the GWTH tenancy layer deliberately refuses them at the
 * application layer (organizationHooks in better-auth.ts) with the DB CHECK
 * as backstop — see src/lib/org-roles.ts for the full rationale.
 */
import { describe, expect, it } from "vitest"
import { assertSingleOrgRole, OrgRoleError } from "./org-roles"

describe("assertSingleOrgRole", () => {
  it("accepts each single known role, string or one-element array", () => {
    for (const role of ["owner", "admin", "tutor", "learner"]) {
      expect(assertSingleOrgRole(role)).toBe(role)
      expect(assertSingleOrgRole([role])).toBe(role)
    }
  })

  it("trims whitespace around a single role", () => {
    expect(assertSingleOrgRole(" tutor ")).toBe("tutor")
  })

  it("refuses comma-separated multi-role values (the QA defect's exact shape)", () => {
    expect(() => assertSingleOrgRole("tutor,admin")).toThrow(OrgRoleError)
    expect(() => assertSingleOrgRole("tutor,admin")).toThrow(/exactly one role/i)
    expect(() => assertSingleOrgRole(["tutor", "admin"])).toThrow(OrgRoleError)
  })

  it("refuses unknown roles with a clean message", () => {
    expect(() => assertSingleOrgRole("superuser")).toThrow(/unknown role/i)
  })

  it("refuses an empty or missing role", () => {
    expect(() => assertSingleOrgRole("")).toThrow(OrgRoleError)
    expect(() => assertSingleOrgRole(undefined)).toThrow(OrgRoleError)
    expect(() => assertSingleOrgRole(null)).toThrow(OrgRoleError)
    expect(() => assertSingleOrgRole([" , "])).toThrow(OrgRoleError)
  })

  it("refuses owner on INVITATIONS but accepts it on memberships", () => {
    expect(assertSingleOrgRole("owner")).toBe("owner")
    expect(() => assertSingleOrgRole("owner", { invitation: true })).toThrow(
      /cannot grant the owner role/i
    )
    expect(assertSingleOrgRole("admin", { invitation: true })).toBe("admin")
  })
})
