/**
 * Roster-privacy policy tests (N7 — N5 QA defect 3).
 *
 * The policy is a pure function precisely so the security decision can be
 * pinned without a database or an auth instance; the wiring that feeds it
 * (path, session, org resolution, role lookup) is exercised against a real
 * Postgres in src/db/org-roster-privacy.db.test.ts.
 */
import { describe, expect, it } from "vitest"
import {
  canReadOrgRoster,
  decideRosterAccess,
  ROSTER_BEARING_PATHS,
} from "./org-roster-privacy"
import { ORG_STAFF_ROLES } from "@/lib/org-admin-policy"

/** A member of the org in question, with a session. */
function member(role: string | null, extra: Record<string, unknown> = {}) {
  return {
    hasSession: true,
    organisationId: "org_a",
    role,
    targetsAnotherUser: false,
    isStaffAnywhere: false,
    ...extra,
  }
}

describe("canReadOrgRoster", () => {
  it("admits the three staff roles", () => {
    expect(canReadOrgRoster("owner")).toBe(true)
    expect(canReadOrgRoster("admin")).toBe(true)
    expect(canReadOrgRoster("tutor")).toBe(true)
  })

  it("refuses the learner role", () => {
    expect(canReadOrgRoster("learner")).toBe(false)
  })

  it("refuses an absent or unknown role", () => {
    expect(canReadOrgRoster(null)).toBe(false)
    expect(canReadOrgRoster(undefined)).toBe(false)
    expect(canReadOrgRoster("")).toBe(false)
    expect(canReadOrgRoster("superuser")).toBe(false)
  })

  it("does not let a comma role widen access", () => {
    // Single roles are policy (src/lib/org-roles.ts) — but if one ever
    // reached the DB, "learner,admin" must NOT read the roster.
    expect(canReadOrgRoster("learner,admin")).toBe(false)
    expect(canReadOrgRoster("admin,tutor")).toBe(true)
  })
})

describe("decideRosterAccess", () => {
  it("ignores every path that is not roster-bearing", () => {
    for (const path of [
      "/sign-in/email",
      "/organization/list",
      "/organization/set-active",
      "/organization/list-user-invitations",
      "/get-session",
    ]) {
      expect(decideRosterAccess(path, member("learner")).kind).toBe(
        "not-applicable"
      )
    }
  })

  it("refuses a learner on every roster-bearing endpoint", () => {
    for (const path of ROSTER_BEARING_PATHS) {
      const decision = decideRosterAccess(
        path,
        member("learner", { targetsAnotherUser: true })
      )
      expect(decision.kind, path).toBe("refuse")
    }
  })

  it("lets staff through on every roster-bearing endpoint", () => {
    for (const path of ROSTER_BEARING_PATHS) {
      for (const role of ["owner", "admin", "tutor"]) {
        const decision = decideRosterAccess(
          path,
          member(role, { targetsAnotherUser: true })
        )
        expect(decision.kind, `${path} / ${role}`).toBe("defer")
      }
    }
  })

  it("lets a learner read their OWN role", () => {
    const decision = decideRosterAccess(
      "/organization/get-active-member-role",
      member("learner", { targetsAnotherUser: false })
    )
    expect(decision.kind).toBe("defer")
  })

  it("refuses a learner asking for someone else's role", () => {
    const decision = decideRosterAccess(
      "/organization/get-active-member-role",
      member("learner", { targetsAnotherUser: true })
    )
    expect(decision.kind).toBe("refuse")
  })

  it("defers when there is no session (the endpoint returns 401)", () => {
    const decision = decideRosterAccess("/organization/list-members", {
      hasSession: false,
      organisationId: null,
      role: null,
      targetsAnotherUser: true,
      isStaffAnywhere: false,
    })
    expect(decision.kind).toBe("defer")
  })

  it("REFUSES an unresolved organisation for a non-staff caller", () => {
    // Fail closed (QA round-3 defect 11): if better-auth ever accepts an
    // organisation identifier shape this hook's resolver does not, an
    // unresolved target must not fall through to the plugin's
    // membership-only check and hand a learner the roster.
    const decision = decideRosterAccess("/organization/list-members", {
      hasSession: true,
      organisationId: null,
      role: null,
      targetsAnotherUser: true,
      isStaffAnywhere: false,
    })
    expect(decision.kind).toBe("refuse")
  })

  it("defers an unresolved organisation for a caller who is staff somewhere", () => {
    const decision = decideRosterAccess("/organization/list-members", {
      hasSession: true,
      organisationId: null,
      role: null,
      targetsAnotherUser: true,
      isStaffAnywhere: true,
    })
    expect(decision.kind).toBe("defer")
  })

  it("defers for a non-member (the endpoint returns 403 itself)", () => {
    const decision = decideRosterAccess(
      "/organization/get-full-organization",
      member(null, { targetsAnotherUser: true })
    )
    expect(decision.kind).toBe("defer")
  })

  it("keeps the roster-visible roles in step with the staff-role policy", () => {
    // One list, not two (QA round-1 style note 4): every staff role reads the
    // roster and no other role does, so a future role added to the staff
    // policy cannot silently gain or lose roster access here.
    for (const role of ORG_STAFF_ROLES) {
      expect(canReadOrgRoster(role), role).toBe(true)
    }
    expect(canReadOrgRoster("learner")).toBe(false)
  })

  it("covers the endpoints that actually carry the roster", () => {
    // Pinned deliberately: if a better-auth upgrade adds another endpoint
    // that returns members or invitations, this list must grow with it.
    expect([...ROSTER_BEARING_PATHS].sort()).toEqual([
      "/organization/get-active-member-role",
      "/organization/get-full-organization",
      "/organization/list-invitations",
      "/organization/list-members",
    ])
  })
})
