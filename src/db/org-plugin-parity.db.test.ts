/**
 * N5 — Better Auth organization-plugin schema parity test (the W11 lesson:
 * green types can mask a drifted table).
 *
 * The org tables are hand-authored (the lazy getAuth() blocks
 * `@better-auth/cli generate`), so nothing but a runtime round-trip proves the
 * plugin's models actually line up with the UK-named tables from migration
 * 013. This test builds the REAL auth instance (organization plugin, modelName
 * mapping, custom roles) and drives its adapter through create/read/update/
 * delete on all three models plus the session's activeOrganizationId — every
 * op is a live query against the dev Postgres, so a missing column, a wrong
 * modelName, or a drifted field name fails here at once. Raw-SQL assertions
 * then pin the UK table and column names (organisation / org_membership /
 * org_invitation / active_organisation_id).
 *
 * SKIPPED unless DATABASE_URL is set (progress.db.test.ts convention). Run:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/db/org-plugin-parity.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const USER_ID = "n5-parity-user"
const SLUG = "n5-parity-org"

describeDb("organization plugin ↔ UK table parity (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  // The Better Auth internal adapter (model-name + field-name aware).
  let adapter: {
    create: (args: { model: string; data: Record<string, unknown>; forceAllowId?: boolean }) => Promise<Record<string, unknown>>
    findOne: (args: { model: string; where: { field: string; value: unknown }[] }) => Promise<Record<string, unknown> | null>
    findMany: (args: { model: string; where?: { field: string; value: unknown }[] }) => Promise<Record<string, unknown>[]>
    update: (args: { model: string; where: { field: string; value: unknown }[]; update: Record<string, unknown> }) => Promise<unknown>
    delete: (args: { model: string; where: { field: string; value: unknown }[] }) => Promise<void>
  }

  async function cleanup() {
    await sql`DELETE FROM organisation WHERE slug = ${SLUG}`
    await sql`DELETE FROM "user" WHERE id = ${USER_ID}`
  }

  beforeAll(async () => {
    // Env the auth builder needs; set BEFORE getAuth() is first called.
    process.env.BETTER_AUTH_SECRET ??= "n5-parity-test-secret"
    process.env.BETTER_AUTH_URL ??= "http://localhost:3000"

    sql = postgres(DATABASE_URL!)
    await cleanup()

    const { getAuth } = await import("@/lib/better-auth")
    const ctx = await getAuth().$context
    adapter = ctx.adapter as typeof adapter
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  it("round-trips organization -> organisation with the plugin's field set", async () => {
    const now = new Date()
    const org = await adapter.create({
      model: "organization",
      data: {
        name: "N5 Parity Org",
        slug: SLUG,
        logo: null,
        metadata: JSON.stringify({ source: "n5-parity-test" }),
        createdAt: now,
      },
    })
    expect(org.id).toBeTruthy()
    expect(org.slug).toBe(SLUG)

    // The row landed in the UK-named table, and the GWTH domain columns took
    // their defaults without the plugin knowing they exist.
    const [raw] = await sql`
      SELECT name, slug, type, seat_limit FROM organisation WHERE id = ${org.id as string}
    `
    expect(raw!.name).toBe("N5 Parity Org")
    expect(raw!.type).toBe("company")
    expect(raw!.seat_limit).toBeNull()

    const found = await adapter.findOne({
      model: "organization",
      where: [{ field: "slug", value: SLUG }],
    })
    expect(found?.id).toBe(org.id)
  })

  it("round-trips member -> org_membership including the custom tutor role", async () => {
    const org = (await adapter.findOne({
      model: "organization",
      where: [{ field: "slug", value: SLUG }],
    }))!
    await adapter.create({
      model: "user",
      data: {
        id: USER_ID,
        name: "N5 Parity User",
        email: "n5-parity@example.com",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      forceAllowId: true,
    })

    const member = await adapter.create({
      model: "member",
      data: {
        organizationId: org.id,
        userId: USER_ID,
        role: "tutor",
        createdAt: new Date(),
      },
    })
    expect(member.role).toBe("tutor")

    // organizationId (plugin field) landed in organisation_id (UK column).
    const [raw] = await sql`
      SELECT organisation_id, user_id, role, edition_id
      FROM org_membership WHERE id = ${member.id as string}
    `
    expect(raw!.organisation_id).toBe(org.id)
    expect(raw!.user_id).toBe(USER_ID)
    expect(raw!.role).toBe("tutor")
    expect(raw!.edition_id).toBeNull() // domain column, plugin-invisible

    const members = await adapter.findMany({
      model: "member",
      where: [{ field: "organizationId", value: org.id }],
    })
    expect(members).toHaveLength(1)
  })

  it("round-trips invitation -> org_invitation", async () => {
    const org = (await adapter.findOne({
      model: "organization",
      where: [{ field: "slug", value: SLUG }],
    }))!
    const invitation = await adapter.create({
      model: "invitation",
      data: {
        organizationId: org.id,
        email: "n5-invitee@example.com",
        role: "learner",
        status: "pending",
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
        createdAt: new Date(),
        inviterId: USER_ID,
      },
    })
    expect(invitation.status).toBe("pending")

    const [raw] = await sql`
      SELECT organisation_id, email, role, status, inviter_id
      FROM org_invitation WHERE id = ${invitation.id as string}
    `
    expect(raw!.organisation_id).toBe(org.id)
    expect(raw!.role).toBe("learner")
    expect(raw!.inviter_id).toBe(USER_ID)

    await adapter.update({
      model: "invitation",
      where: [{ field: "id", value: invitation.id }],
      update: { status: "canceled" },
    })
    const [after] = await sql`
      SELECT status FROM org_invitation WHERE id = ${invitation.id as string}
    `
    expect(after!.status).toBe("canceled")
  })

  it("stores the active organisation on the session (active_organisation_id)", async () => {
    const org = (await adapter.findOne({
      model: "organization",
      where: [{ field: "slug", value: SLUG }],
    }))!
    const session = await adapter.create({
      model: "session",
      data: {
        userId: USER_ID,
        token: `n5-parity-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    await adapter.update({
      model: "session",
      where: [{ field: "id", value: session.id }],
      update: { activeOrganizationId: org.id },
    })
    const [raw] = await sql`
      SELECT active_organisation_id FROM session WHERE id = ${session.id as string}
    `
    expect(raw!.active_organisation_id).toBe(org.id)
  })

  it("cascades membership + invitation away when the organisation is deleted", async () => {
    const org = (await adapter.findOne({
      model: "organization",
      where: [{ field: "slug", value: SLUG }],
    }))!
    await adapter.delete({
      model: "organization",
      where: [{ field: "id", value: org.id }],
    })
    const [counts] = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM org_membership WHERE organisation_id = ${org.id as string}) AS members,
        (SELECT COUNT(*)::int FROM org_invitation WHERE organisation_id = ${org.id as string}) AS invitations
    `
    expect(counts!.members).toBe(0)
    expect(counts!.invitations).toBe(0)
  })
})
