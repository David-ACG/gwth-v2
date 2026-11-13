// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

const plunk = vi.fn(async () => true)
vi.mock("@/lib/email/plunk", () => ({ sendPlunkEmail: plunk }))

const ALERT = {
  flagId: 14,
  email: "copier@example.com",
  heldMonth: 2,
  reasons: ["23 new lessons in 10 minutes (the line is 20)"],
  summary: "23 new lessons in 24 hours; about 2 s on each",
}
const KEYS = ["FLAG_ALERT_SLACK_WEBHOOK", "FLAG_ALERT_EMAIL", "FLAG_ALERT_TELEGRAM_TOKEN", "FLAG_ALERT_TELEGRAM_CHAT_ID", "BETTER_AUTH_URL"]

afterEach(() => {
  for (const k of KEYS) delete process.env[k]
  vi.unstubAllGlobals()
  plunk.mockClear()
})

describe("flag alerts (bead gwth-launch-735c: Slack, email and Telegram)", () => {
  it("says who, why, that the month is held, and links to the flag", async () => {
    process.env.BETTER_AUTH_URL = "https://gwth.ai"
    const { alertText } = await import("./alerts")
    const { title, body } = alertText(ALERT)
    expect(title).toBe("GWTH: account moving too fast: copier@example.com")
    expect(body).toContain("23 new lessons in 10 minutes (the line is 20). Month 2 is held until you look.")
    expect(body).toContain("Open: https://gwth.ai/admin/flagged#flag-14")
  })

  it("sends nothing when no channel is set", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const { sendFlagAlert } = await import("./alerts")
    expect(await sendFlagAlert(ALERT)).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(plunk).not.toHaveBeenCalled()
  })

  it("sends on all three when all three are set", async () => {
    process.env.FLAG_ALERT_SLACK_WEBHOOK = "https://hooks.slack.com/services/T/B/x"
    process.env.FLAG_ALERT_EMAIL = "owner@example.com"
    process.env.FLAG_ALERT_TELEGRAM_TOKEN = "123:abc"
    process.env.FLAG_ALERT_TELEGRAM_CHAT_ID = "42"
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const { sendFlagAlert } = await import("./alerts")
    expect((await sendFlagAlert(ALERT)).sort()).toEqual(["email", "slack", "telegram"])
    const urls = fetchMock.mock.calls.map((c) => String(c[0]))
    expect(urls).toContain("https://hooks.slack.com/services/T/B/x")
    expect(urls).toContain("https://api.telegram.org/bot123:abc/sendMessage")
    const tg = fetchMock.mock.calls.find((c) => String(c[0]).includes("telegram"))
    expect(JSON.parse(String(tg?.[1]?.body))).toMatchObject({ chat_id: "42" })
    expect(plunk).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@example.com", subject: expect.stringContaining("moving too fast") }))
  })

  it("one channel failing never stops the others", async () => {
    process.env.FLAG_ALERT_SLACK_WEBHOOK = "https://hooks.slack.com/services/T/B/x"
    process.env.FLAG_ALERT_TELEGRAM_TOKEN = "123:abc"
    process.env.FLAG_ALERT_TELEGRAM_CHAT_ID = "42"
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("slack")) throw new Error("network down")
      return new Response("ok", { status: 200 })
    }))
    const { sendFlagAlert } = await import("./alerts")
    expect(await sendFlagAlert(ALERT)).toEqual(["telegram"])
  })

  it("needs both the Telegram token and the chat id", async () => {
    const { enabledChannels } = await import("./alerts")
    expect(enabledChannels({ FLAG_ALERT_TELEGRAM_TOKEN: "x" } as unknown as NodeJS.ProcessEnv)).toEqual([])
    expect(enabledChannels({ FLAG_ALERT_TELEGRAM_TOKEN: "x", FLAG_ALERT_TELEGRAM_CHAT_ID: "1" } as unknown as NodeJS.ProcessEnv)).toEqual(["telegram"])
  })
})
