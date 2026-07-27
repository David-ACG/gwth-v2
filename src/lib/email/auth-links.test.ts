import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  isLoopbackUrl,
  resolvePublicEmailBase,
  toPublicEmailLink,
} from "./auth-links"

const PROD = { BETTER_AUTH_URL: "https://gwth.ai" }
const DEV = {
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
}

describe("isLoopbackUrl", () => {
  it("spots every loopback spelling", () => {
    expect(isLoopbackUrl("http://localhost:3000/api/auth/verify-email")).toBe(true)
    expect(isLoopbackUrl("http://127.0.0.1:3000/x")).toBe(true)
    expect(isLoopbackUrl("http://0.0.0.0:3000/x")).toBe(true)
    expect(isLoopbackUrl("http://[::1]:3000/x")).toBe(true)
  })

  it("leaves reachable hosts alone, including the LAN and the tailnet", () => {
    expect(isLoopbackUrl("https://gwth.ai/x")).toBe(false)
    expect(isLoopbackUrl("http://192.168.178.50:3001/x")).toBe(false)
    expect(isLoopbackUrl("https://hlab.taila51191.ts.net:9458/x")).toBe(false)
  })

  it("never throws on junk", () => {
    expect(isLoopbackUrl("not a url")).toBe(false)
    expect(isLoopbackUrl("")).toBe(false)
  })
})

describe("resolvePublicEmailBase", () => {
  it("uses the auth origin, which is what makes production need no override", () => {
    expect(resolvePublicEmailBase(PROD)).toBe("https://gwth.ai")
  })

  it("prefers an explicit override over the auth origin", () => {
    expect(
      resolvePublicEmailBase({
        AUTH_EMAIL_BASE_URL: "https://preview.example.com",
        BETTER_AUTH_URL: "https://gwth.ai",
      }),
    ).toBe("https://preview.example.com")
  })

  it("skips a loopback auth origin and takes the public site instead", () => {
    expect(
      resolvePublicEmailBase({
        BETTER_AUTH_URL: "http://localhost:3000",
        NEXT_PUBLIC_SITE_URL: "https://gwth.ai",
      }),
    ).toBe("https://gwth.ai")
  })

  it("falls back to the live site when every candidate is loopback or junk", () => {
    expect(resolvePublicEmailBase(DEV)).toBe("https://gwth.ai")
    expect(
      resolvePublicEmailBase({ BETTER_AUTH_URL: "not a url" }),
    ).toBe("https://gwth.ai")
    expect(resolvePublicEmailBase({})).toBe("https://gwth.ai")
  })
})

describe("toPublicEmailLink", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("rewrites the localhost link David was actually sent, token intact", () => {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImZhbWlseXVjY2VsbGkifQ.sig"
    expect(
      toPublicEmailLink(
        `http://localhost:3000/api/auth/verify-email?token=${token}`,
        DEV,
      ),
    ).toBe(`https://gwth.ai/api/auth/verify-email?token=${token}`)
  })

  it("keeps query and fragment, including a callbackURL", () => {
    expect(
      toPublicEmailLink(
        "http://localhost:3000/api/auth/verify-email?token=t&callbackURL=%2Fdashboard#top",
        DEV,
      ),
    ).toBe(
      "https://gwth.ai/api/auth/verify-email?token=t&callbackURL=%2Fdashboard#top",
    )
  })

  it("leaves a production link byte-identical", () => {
    const url = "https://gwth.ai/api/auth/verify-email?token=t"
    expect(toPublicEmailLink(url, PROD)).toBe(url)
  })

  it("leaves the tailnet preview alone — it owns the token it issued", () => {
    const url = "https://hlab.taila51191.ts.net:9458/api/auth/verify-email?token=t"
    expect(
      toPublicEmailLink(url, {
        BETTER_AUTH_URL: "https://hlab.taila51191.ts.net:9458",
      }),
    ).toBe(url)
  })

  it("logs the original so a local-database signup can still be finished", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    toPublicEmailLink("http://localhost:3000/api/auth/verify-email?token=t", DEV)
    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      "http://localhost:3000/api/auth/verify-email?token=t",
    )
  })

  it("returns junk untouched rather than throwing inside a send callback", () => {
    expect(toPublicEmailLink("not a url", DEV)).toBe("not a url")
  })
})
