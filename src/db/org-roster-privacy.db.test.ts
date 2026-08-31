/**
 * N7 — roster privacy end to end (closes N5 QA defect 3).
 *
 * The unit test in src/lib/org-roster-privacy.test.ts pins the POLICY. This
 * one pins the WIRING against the real Better Auth instance and a real
 * Postgres, because the defect was never in the policy — it was that the
 * organization plugin authorises the roster endpoints on membership alone, so
 * only a live call proves the refusal is actually in the path.
 *
 * Each case signs in for real (email + password → session cookie) and calls
 * the endpoint exactly as a browser would.
 *
 * SKIPPED unless DATABASE_URL is set. Run:
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/db/org-roster-privacy.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const P = "n7priv"
const ORG_ID = `${P}_org`
const PASSWORD = "n7-roster-privacy-Pass1"

describeDb("roster privacy (live DB + real auth instance)", () => {
  let sql: ReturnType<typeof postgres>
  let auth: Awaited<typeof import("@/lib/better-auth")>["getAuth"] extends () => infer A
    ? A
    : never
  /** role → the signed-in cookie header for that member. */
  const cookies = new Map<string, string>()

  async function cleanup() {
    await sql`DELETE FROM org_membership WHERE organisation_id = ${ORG_ID}`
    await sql`DELETE FROM organisation WHERE id = ${ORG_ID}`
    await sql`DELETE FROM session WHERE user_id LIKE ${P + "%"}`
    await sql`DELETE FROM account WHERE user_id LIKE ${P + "%"}`
    await sql`DELETE FROM "user" WHERE id LIKE ${P + "%"}`
  }

  /**
   * Creates a verified user with a credential account, signs them in, and
   * stores the resulting session cookie. Uses the auth instance's own
   * password hasher so sign-in is a genuine round trip.
   */
  async function signInAs(role: string): Promise<void> {
    const id = `${P}_${role}`
    const email = `${id}@example.test`
    const ctx = await auth.$context
    await sql`
      INSERT INTO "user" (id, name, email, email_verified)
      VALUES (${id}, ${role}, ${email}, TRUE)
    `
    await sql`
      INSERT INTO account (id, account_id, provider_id, user_id, password,
                           created_at, updated_at)
      VALUES (${`acc_${id}`}, ${id}, 'credential', ${id},
              ${await ctx.password.hash(PASSWORD)}, NOW(), NOW())
    `
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role)
      VALUES (${`mem_${id}`}, ${ORG_ID}, ${id}, ${role})
    `

    const response = (await auth.api.signInEmail({
      body: { email, password: PASSWORD },
      asResponse: true,
    })) as Response
    const setCookie = response.headers.get("set-cookie")
    expect(setCookie, `sign-in failed for ${role}`).toBeTruthy()
    cookies.set(
      role,
      setCookie!
        .split(",")
        .map((part) => part.trim().split(";")[0])
        .filter((part) => part?.includes("session_token"))
        .join("; ")
    )
  }

  /** Headers for one role's session. */
  function headersFor(role: string): Headers {
    return new Headers({ cookie: cookies.get(role)! })
  }

  beforeAll(async () => {
    process.env.BETTER_AUTH_SECRET ??= "n7-roster-privacy-test-secret"
    process.env.BETTER_AUTH_URL ??= "http://localhost:3000"
    // The invite-only lock disables sign-UP, not sign-IN, but keep the test
    // independent of whichever mode the developer's .env.local is in.
    delete process.env.PRIVATE_CONTENT_MODE

    sql = postgres(DATABASE_URL!)
    await cleanup()
    await sql`
      INSERT INTO organisation (id, name, slug, type)
      VALUES (${ORG_ID}, 'N7 privacy org', ${`${ORG_ID}-slug`}, 'institution')
    `

    const { getAuth } = await import("@/lib/better-auth")
    auth = getAuth() as typeof auth

    for (const role of ["learner", "tutor", "admin"]) {
      await signInAs(role)
    }
  }, 30_000)

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  describe("a learner", () => {
    it("cannot read the full organisation (the N5 defect-3 call)", async () => {
      await expect(
        auth.api.getFullOrganization({
          headers: headersFor("learner"),
          query: { organizationId: ORG_ID },
        })
      ).rejects.toMatchObject({ status: "FORBIDDEN" })
    })

    it("cannot list members", async () => {
      await expect(
        auth.api.listMembers({
          headers: headersFor("learner"),
          query: { organizationId: ORG_ID },
        })
      ).rejects.toMatchObject({ status: "FORBIDDEN" })
    })

    it("cannot list invitations", async () => {
      await expect(
        auth.api.listInvitations({
          headers: headersFor("learner"),
          query: { organizationId: ORG_ID },
        })
      ).rejects.toMatchObject({ status: "FORBIDDEN" })
    })

    it("cannot read another member's role", async () => {
      await expect(
        auth.api.getActiveMemberRole({
          headers: headersFor("learner"),
          query: { organizationId: ORG_ID, userId: `${P}_admin` },
        })
      ).rejects.toMatchObject({ status: "FORBIDDEN" })
    })

    it("CAN still read their own role (the refusal is not a blanket block)", async () => {
      const result = await auth.api.getActiveMemberRole({
        headers: headersFor("learner"),
        query: { organizationId: ORG_ID },
      })
      expect(result).toMatchObject({ role: "learner" })
    })

    it("can still list the organisations they belong to", async () => {
      const orgs = (await auth.api.listOrganizations({
        headers: headersFor("learner"),
      })) as Array<{ id: string }>
      expect(orgs.map((org) => org.id)).toContain(ORG_ID)
    })
  })

  for (const role of ["tutor", "admin"]) {
    describe(`a ${role}`, () => {
      it("reads the full organisation, members included", async () => {
        const org = (await auth.api.getFullOrganization({
          headers: headersFor(role),
          query: { organizationId: ORG_ID },
        })) as { members: Array<{ userId: string }> } | null
        expect(org?.members.map((member) => member.userId)).toContain(
          `${P}_learner`
        )
      })

      it("lists members", async () => {
        const result = (await auth.api.listMembers({
          headers: headersFor(role),
          query: { organizationId: ORG_ID },
        })) as { members: Array<{ userId: string }> }
        expect(result.members.length).toBeGreaterThanOrEqual(3)
      })

      it("lists invitations", async () => {
        await expect(
          auth.api.listInvitations({
            headers: headersFor(role),
            query: { organizationId: ORG_ID },
          })
        ).resolves.toBeDefined()
      })
    })
  }
})
