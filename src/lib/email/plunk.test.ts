import { afterEach, describe, expect, it, vi } from "vitest"
import { LEGACY_PLUNK_SEND_URL, NEXT_PLUNK_SEND_URL, resolvePlunk, sendPlunkEmail } from "./plunk"

describe("resolvePlunk", () => {
  it("returns null when no key is set", () => {
    expect(resolvePlunk({})).toBeNull()
    expect(resolvePlunk({ PLUNK_NEXT_SECRET_KEY: "  " })).toBeNull()
  })

  it("keeps the legacy key on the legacy API", () => {
    expect(resolvePlunk({ PLUNK_SECRET_KEY: "sk_old" })).toEqual({ url: LEGACY_PLUNK_SEND_URL, key: "sk_old" })
    expect(resolvePlunk({ PLUNK_API_KEY: "sk_alias" })).toEqual({ url: LEGACY_PLUNK_SEND_URL, key: "sk_alias" })
  })

  it("prefers the new-Plunk key, and always pairs it with the new API", () => {
    expect(resolvePlunk({ PLUNK_SECRET_KEY: "sk_old", PLUNK_NEXT_SECRET_KEY: " sk_new " })).toEqual({
      url: NEXT_PLUNK_SEND_URL,
      key: "sk_new",
    })
  })
})

describe("sendPlunkEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("posts to the resolved endpoint with its key and the gwth.ai sender", async () => {
    vi.stubEnv("PLUNK_SECRET_KEY", "sk_old")
    vi.stubEnv("PLUNK_NEXT_SECRET_KEY", "sk_new")
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const ok = await sendPlunkEmail({ to: "a@learner.co.uk", subject: "Hi", body: "<p>Hi</p>", text: "Hi" })

    expect(ok).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(NEXT_PLUNK_SEND_URL)
    expect(init.headers.Authorization).toBe("Bearer sk_new")
    expect(JSON.parse(init.body)).toMatchObject({ to: "a@learner.co.uk", from: "david@gwth.ai", name: "GWTH.ai" })
  })
})

describe("reserved test addresses", () => {
  it("never sends to example.com, .test, .invalid or .example addresses", async () => {
    const { isReservedTestAddress } = await import("./plunk")
    for (const to of ["x@example.com", "x@sub.test", "x@nowhere.invalid", "x@shop.example", "X@Example.ORG"]) {
      expect(isReservedTestAddress(to)).toBe(true)
    }
    expect(isReservedTestAddress("sam@gmail.com")).toBe(false)
    expect(isReservedTestAddress("x@examples.com")).toBe(false)
  })
})
