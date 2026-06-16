/**
 * DB-backed user-isolation tests for the W11 billing/access layer.
 *
 * The headline correctness guarantee after the Supabase → Better Auth swap:
 * access is resolved per-user via Drizzle against public."user" (text ids), and
 * one user's grant must NEVER bleed into another's. These run against the live
 * dev Postgres and are SKIPPED unless DATABASE_URL is set.
 *
 * Run them with the dev DB:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/lib/billing/access.db.test.ts
 *
 * Everything is the REAL access layer hitting the REAL database (getDb() resolves
 * the DATABASE_URL); only the raw seed/cleanup uses postgres.js directly.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

// Distinct text ids + lowercase/trimmed emails (beta_access_grants has a
// CHECK email = lower(trim(email)), and user.email is unique + NOT NULL).
const USER_A = "w11_access_user_a"
const USER_B = "w11_access_user_b"
const EMAIL_A = "w11-access-a@example.com"
const EMAIL_B = "w11-access-b@example.com"
const GRANT_EMAIL = "w11-grant@example.com"

describeDb("billing access user isolation (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  // Imported lazily AFTER DATABASE_URL is in place so getDb() resolves it.
  let access: typeof import("./access")

  async function clean() {
    await sql`delete from "user" where id in (${USER_A}, ${USER_B})` // cascades user_access
    await sql`delete from beta_access_grants where email in (${GRANT_EMAIL}, ${EMAIL_A}, ${EMAIL_B})`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    access = await import("./access")
    await clean()

    // Two users with DISTINCT access rows: A = manual_beta month 3, B = none
    // (no user_access row at all → resolves to REGISTERED_ACCESS).
    await sql`insert into "user" (id, name, email) values
      (${USER_A}, 'Access A', ${EMAIL_A}),
      (${USER_B}, 'Access B', ${EMAIL_B})`
    await sql`insert into user_access (user_id, access_source, subscription_state, subscription_month)
      values (${USER_A}, 'manual_beta', 'month3', 3)`
  })

  beforeEach(async () => {
    // The grant + B's access are mutated by the apply test; reset them so the
    // tests are order-independent.
    await sql`delete from beta_access_grants where email in (${GRANT_EMAIL}, ${EMAIL_A}, ${EMAIL_B})`
    await sql`delete from user_access where user_id = ${USER_B}`
    await sql`insert into user_access (user_id, access_source, subscription_state, subscription_month)
      values (${USER_A}, 'manual_beta', 'month3', 3)
      on conflict (user_id) do update set
        access_source = 'manual_beta', subscription_state = 'month3', subscription_month = 3,
        valid_until = null, notes = null`
  })

  afterAll(async () => {
    await clean()
    await sql.end({ timeout: 5 })
  })

  it("getAccessForUser returns each user's own access, never the other's", async () => {
    const a = await access.getAccessForUser(USER_A)
    expect(a.source).toBe("manual_beta")
    expect(a.subscriptionState).toBe("month3")
    expect(a.subscriptionMonth).toBe(3)

    const b = await access.getAccessForUser(USER_B)
    // B has no user_access row → REGISTERED_ACCESS, NOT A's manual_beta.
    expect(b.source).toBe("registered")
    expect(b.subscriptionMonth).toBe(0)
  })

  it("isUserGrantedBetaAccess is true for A and false for B", async () => {
    expect(await access.isUserGrantedBetaAccess(USER_A)).toBe(true)
    expect(await access.isUserGrantedBetaAccess(USER_B)).toBe(false)
  })

  it("getBetaAccessGrantForEmail / isEmailGrantedBetaAccess read an inserted grant", async () => {
    await sql`insert into beta_access_grants (email, subscription_month) values (${GRANT_EMAIL}, 3)`

    expect(await access.isEmailGrantedBetaAccess(GRANT_EMAIL)).toBe(true)
    const grant = await access.getBetaAccessGrantForEmail(GRANT_EMAIL)
    expect(grant).not.toBeNull()
    expect(grant?.email).toBe(GRANT_EMAIL)
    expect(grant?.subscription_month).toBe(3)

    // An email with no grant returns null / false.
    expect(await access.getBetaAccessGrantForEmail("nobody@example.com")).toBeNull()
    expect(await access.isEmailGrantedBetaAccess("nobody@example.com")).toBe(false)
  })

  it("applyBetaAccessGrantToUser upserts the grant onto A only and links it to A", async () => {
    await sql`insert into beta_access_grants (email, subscription_month) values (${GRANT_EMAIL}, 3)`

    const applied = await access.applyBetaAccessGrantToUser(USER_A, GRANT_EMAIL)
    expect(applied).toBe(true)

    // A now has the manual_beta access.
    expect(await access.isUserGrantedBetaAccess(USER_A)).toBe(true)
    // B is untouched — no bleed.
    expect(await access.isUserGrantedBetaAccess(USER_B)).toBe(false)
    const b = await access.getAccessForUser(USER_B)
    expect(b.source).toBe("registered")

    // The grant row is now linked to A's id, and ONLY A's.
    const grantRows = await sql`select user_id from beta_access_grants where email = ${GRANT_EMAIL}`
    expect(grantRows[0]?.user_id).toBe(USER_A)
  })

  it("applyBetaAccessGrantToUser returns false when there is no matching grant", async () => {
    const applied = await access.applyBetaAccessGrantToUser(
      USER_B,
      "no-such-grant@example.com"
    )
    expect(applied).toBe(false)
    // B remains ungranted.
    expect(await access.isUserGrantedBetaAccess(USER_B)).toBe(false)
  })
})
