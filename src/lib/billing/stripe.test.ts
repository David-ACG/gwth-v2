import { describe, expect, it } from "vitest"
import { assertStripeKeyAllowed, siteOrigin } from "./stripe"

describe("siteOrigin", () => {
  it("prefers a reachable origin over a loopback one", () => {
    expect(
      siteOrigin({
        BETTER_AUTH_URL: "https://hlab.example.net:9458",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      })
    ).toBe("https://hlab.example.net:9458")
    expect(siteOrigin({ NEXT_PUBLIC_SITE_URL: "https://gwth.ai/" })).toBe("https://gwth.ai")
  })

  it("uses loopback only when that is all there is", () => {
    expect(siteOrigin({ BETTER_AUTH_URL: "http://localhost:3000" })).toBe("http://localhost:3000")
    expect(siteOrigin({})).toBe("http://localhost:3000")
  })
})

describe("STRIPE_REQUIRE_TEST_MODE", () => {
  it("refuses a live key on a test-only preview, and allows a test key", () => {
    const env = { STRIPE_REQUIRE_TEST_MODE: "1" }
    expect(() => assertStripeKeyAllowed("sk_live_abc", env)).toThrow(/not a test key/)
    expect(() => assertStripeKeyAllowed("rk_live_abc", env)).toThrow()
    expect(() => assertStripeKeyAllowed("sk_test_abc", env)).not.toThrow()
  })

  it("does nothing when the switch is off", () => {
    expect(() => assertStripeKeyAllowed("sk_live_abc", {})).not.toThrow()
  })
})
