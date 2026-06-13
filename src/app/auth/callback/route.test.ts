import type { User as SupabaseUser } from "@supabase/supabase-js"
import { describe, expect, it } from "vitest"
import { shouldDeleteUngrantedOAuthUser } from "./route"

function supabaseUser(
  overrides: Partial<SupabaseUser> = {}
): SupabaseUser {
  return {
    id: "user_oauth_1",
    aud: "authenticated",
    app_metadata: { provider: "google", providers: ["google"] },
    user_metadata: {},
    created_at: "2026-06-13T11:55:00.000Z",
    ...overrides,
  } as SupabaseUser
}

describe("auth callback beta OAuth cleanup", () => {
  const now = new Date("2026-06-13T12:00:00.000Z")

  it("cleans up recently auto-provisioned OAuth users that are not granted", () => {
    expect(shouldDeleteUngrantedOAuthUser(supabaseUser(), now)).toBe(true)
  })

  it("does not clean up email-password users", () => {
    expect(
      shouldDeleteUngrantedOAuthUser(
        supabaseUser({
          app_metadata: { provider: "email", providers: ["email"] },
        }),
        now
      )
    ).toBe(false)
  })

  it("does not clean up older OAuth accounts", () => {
    expect(
      shouldDeleteUngrantedOAuthUser(
        supabaseUser({ created_at: "2026-06-13T11:00:00.000Z" }),
        now
      )
    ).toBe(false)
  })
})
