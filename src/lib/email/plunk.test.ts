import { afterEach, describe, expect, it, vi } from "vitest"
import { LEGACY_PLUNK_SEND_URL, plunkSendUrl, sendPlunkEmail } from "./plunk"

const NEXT_URL = "https://next-api.useplunk.com/v1/send"

describe("plunkSendUrl", () => {
  it("defaults to the legacy endpoint, so shipping the code alone changes nothing", () => {
    expect(plunkSendUrl({})).toBe(LEGACY_PLUNK_SEND_URL)
    expect(plunkSendUrl({ PLUNK_API_URL: "  " })).toBe(LEGACY_PLUNK_SEND_URL)
  })

  it("uses PLUNK_API_URL when set", () => {
    expect(plunkSendUrl({ PLUNK_API_URL: ` ${NEXT_URL} ` })).toBe(NEXT_URL)
  })
})

describe("sendPlunkEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("posts to the configured endpoint with the gwth.ai sender", async () => {
    vi.stubEnv("PLUNK_SECRET_KEY", "sk_test")
    vi.stubEnv("PLUNK_API_URL", NEXT_URL)
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const ok = await sendPlunkEmail({ to: "a@example.com", subject: "Hi", body: "<p>Hi</p>", text: "Hi" })

    expect(ok).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe(NEXT_URL)
    const payload = JSON.parse(init.body)
    expect(payload).toMatchObject({ to: "a@example.com", from: "david@gwth.ai", name: "GWTH.ai" })
  })
})
