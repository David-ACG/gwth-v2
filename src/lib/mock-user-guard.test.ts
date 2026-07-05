/**
 * W15 fail-fast tests: the mock-user flag must abort startup on the gwth.ai
 * host and must NEVER trip on staging, dev, or unset configurations.
 */
import { describe, expect, it } from "vitest"
import { assertMockUserFlagAllowed } from "./mock-user-guard"

describe("assertMockUserFlagAllowed", () => {
  it("throws when the flag is on and BETTER_AUTH_URL is gwth.ai", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "https://gwth.ai",
      })
    ).toThrow(/ENABLE_DEV_MOCK_USER/)
  })

  it("throws for gwth.ai subdomains (www.gwth.ai)", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "https://www.gwth.ai",
      })
    ).toThrow(/production host/)
  })

  it("throws for any truthy flag value, not just 'true'", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "1",
        BETTER_AUTH_URL: "https://gwth.ai",
      })
    ).toThrow()
  })

  it("never trips on the Tailscale staging host", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "http://hlab.taila51191.ts.net:3001",
      })
    ).not.toThrow()
  })

  it("never trips on the LAN staging origin", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "http://192.168.178.50:3001",
      })
    ).not.toThrow()
  })

  it("never trips on localhost dev", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "http://localhost:3000",
      })
    ).not.toThrow()
  })

  it("never trips when the flag is unset or explicitly off", () => {
    for (const flag of [undefined, "", "false", "FALSE", "0"]) {
      expect(() =>
        assertMockUserFlagAllowed({
          ENABLE_DEV_MOCK_USER: flag,
          BETTER_AUTH_URL: "https://gwth.ai",
        })
      ).not.toThrow()
    }
  })

  it("never trips on a missing or malformed BETTER_AUTH_URL", () => {
    expect(() =>
      assertMockUserFlagAllowed({ ENABLE_DEV_MOCK_USER: "true" })
    ).not.toThrow()
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "not a url",
      })
    ).not.toThrow()
  })

  it("does not treat a host merely containing gwth.ai as production", () => {
    expect(() =>
      assertMockUserFlagAllowed({
        ENABLE_DEV_MOCK_USER: "true",
        BETTER_AUTH_URL: "https://notgwth.ai.example.com",
      })
    ).not.toThrow()
  })
})
