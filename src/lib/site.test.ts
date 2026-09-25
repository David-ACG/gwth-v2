import { describe, expect, it } from "vitest"
import { getSiteKind } from "./site"

describe("getSiteKind", () => {
  it("is production for gwth.ai and its subdomains", () => {
    expect(getSiteKind({ BETTER_AUTH_URL: "https://gwth.ai" })).toBe("production")
    expect(getSiteKind({ BETTER_AUTH_URL: "https://www.gwth.ai/" })).toBe("production")
  })

  it("is preview on the hlab tailnet", () => {
    expect(
      getSiteKind({ BETTER_AUTH_URL: "https://hlab.taila51191.ts.net:9458" })
    ).toBe("preview")
  })

  it("falls back to the public env var", () => {
    expect(
      getSiteKind({ NEXT_PUBLIC_BETTER_AUTH_URL: "https://gwth.ai" })
    ).toBe("production")
  })

  it("is local for localhost, a look-alike host, junk or nothing", () => {
    expect(getSiteKind({ BETTER_AUTH_URL: "http://localhost:3000" })).toBe("local")
    expect(getSiteKind({ BETTER_AUTH_URL: "https://notgwth.ai" })).toBe("local")
    expect(getSiteKind({ BETTER_AUTH_URL: "not a url" })).toBe("local")
    expect(getSiteKind({})).toBe("local")
  })
})
