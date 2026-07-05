/**
 * W15 guard tests: a provider is only offered when BOTH its client id and
 * secret are present in the env, so the login page can never render a button
 * for an unregistered provider app.
 */
import { describe, expect, it } from "vitest"
import { getEnabledOAuthProviders } from "./oauth-providers"

describe("getEnabledOAuthProviders", () => {
  it("returns no providers when the env is empty", () => {
    expect(getEnabledOAuthProviders({})).toEqual([])
  })

  it("returns only providers with BOTH client id and secret", () => {
    expect(
      getEnabledOAuthProviders({
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
        GITHUB_CLIENT_ID: "id-without-secret",
        LINKEDIN_CLIENT_SECRET: "secret-without-id",
      })
    ).toEqual(["google"])
  })

  it("returns all three in display order when fully configured", () => {
    expect(
      getEnabledOAuthProviders({
        GOOGLE_CLIENT_ID: "a",
        GOOGLE_CLIENT_SECRET: "b",
        GITHUB_CLIENT_ID: "c",
        GITHUB_CLIENT_SECRET: "d",
        LINKEDIN_CLIENT_ID: "e",
        LINKEDIN_CLIENT_SECRET: "f",
      })
    ).toEqual(["google", "github", "linkedin"])
  })

  it("treats empty strings as unset", () => {
    expect(
      getEnabledOAuthProviders({
        GOOGLE_CLIENT_ID: "",
        GOOGLE_CLIENT_SECRET: "secret",
      })
    ).toEqual([])
  })
})
