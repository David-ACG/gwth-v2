/**
 * W11 regression guard (CRITICAL #2) — the Better Auth Drizzle adapter is handed
 * the `schema` object exported by `@/db`. If that object omits the Better Auth
 * core tables (user/session/account/verification — which live in
 * src/db/auth-schema.ts, NOT the generated drizzle/ files), the adapter throws
 * `model "user" not found` on every op, getSession silently returns null, and
 * every user is denied (sign-in/up/OAuth 500).
 *
 * This is a NON-mocked import test: it imports the real exported schema and
 * asserts the four auth-table keys are present. No live DB required — importing
 * `@/db` only evaluates the schema object; `getDb()` is never called.
 */
import { describe, expect, it } from "vitest"
import { schema } from "@/db"

describe("@/db schema includes Better Auth core tables (W11 #2)", () => {
  it("exposes user/session/account/verification on the adapter schema", () => {
    expect(schema.user).toBeTruthy()
    expect(schema.session).toBeTruthy()
    expect(schema.account).toBeTruthy()
    expect(schema.verification).toBeTruthy()
  })
})
