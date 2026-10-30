// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { anthropicHaiku, clearModelCache, costOf, newestHaiku, newestLuna, openAiLuna } from "./providers"

const request = { system: "sys", text: "mark it", images: [{ name: "shot.png", mediaType: "image/png", base64: "AAAA" }] }

beforeEach(() => {
  clearModelCache()
  process.env.OPENAI_API_KEY = "test-openai"
  process.env.ANTHROPIC_API_KEY = "test-anthropic"
  process.env.CAPSTONE_JUDGE_PRICES_USD = '{"luna":{"in":1,"out":2},"haiku":{"in":3,"out":4}}'
})
afterEach(() => {
  delete process.env.OPENAI_API_KEY
  delete process.env.ANTHROPIC_API_KEY
  delete process.env.CAPSTONE_JUDGE_PRICES_USD
})

describe("choosing the newest model at run time", () => {
  it("picks the highest Luna version and the newest Haiku", () => {
    expect(newestLuna(["gpt-5.6-luna", "gpt-6-luna", "gpt-6-sol", "gpt-5.10-luna"])).toBe("gpt-6-luna")
    expect(newestHaiku([{ id: "claude-haiku-a", created_at: "2026-01-01" }, { id: "claude-haiku-b", created_at: "2026-09-01" }, { id: "claude-opus-z", created_at: "2026-10-01" }])).toBe("claude-haiku-b")
  })

  it("logs cost from the price list, or unknown without one", () => {
    expect(costOf("luna", 1_000_000, 500_000)).toBe(2)
    delete process.env.CAPSTONE_JUDGE_PRICES_USD
    expect(costOf("luna", 10, 10)).toBeNull()
  })
})

describe("the OpenAI call", () => {
  it("asks for the newest Luna at max reasoning, stores nothing, and reads the reply and usage", async () => {
    const calls: { url: string; body?: Record<string, unknown> }[] = []
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined })
      if (url.endsWith("/v1/models")) return Response.json({ data: [{ id: "gpt-5.6-luna" }, { id: "gpt-6-luna" }] })
      return Response.json({
        output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: '{"ok":true}' }] }],
        usage: { input_tokens: 1000, output_tokens: 500 },
      })
    })
    const reply = await openAiLuna(fetchMock as unknown as typeof fetch)(request, { type: "object" })
    expect(reply).toMatchObject({ judge: "luna", modelId: "gpt-6-luna", text: '{"ok":true}', inputTokens: 1000, outputTokens: 500, costUsd: 0.002 })
    const body = calls[1]!.body!
    expect(body).toMatchObject({ model: "gpt-6-luna", store: false, reasoning: { effort: "max" }, instructions: "sys" })
    expect(JSON.stringify(body.input)).toContain("data:image/png;base64,AAAA")
  })

  it("refuses to run without a key", async () => {
    delete process.env.OPENAI_API_KEY
    await expect(openAiLuna(vi.fn() as unknown as typeof fetch)(request, {})).rejects.toThrow(/OPENAI_API_KEY/)
  })
})

describe("the Anthropic call", () => {
  it("asks for the newest Haiku with the image and reads the reply and usage", async () => {
    const calls: { url: string; body?: Record<string, unknown>; headers?: HeadersInit }[] = []
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined, headers: init?.headers })
      if (url.includes("/v1/models")) return Response.json({ data: [{ id: "claude-haiku-x", created_at: "2026-10-01T00:00:00Z" }] })
      return Response.json({ content: [{ type: "text", text: '{"ok":1}' }], usage: { input_tokens: 2000, output_tokens: 100 } })
    })
    const reply = await anthropicHaiku(fetchMock as unknown as typeof fetch)(request, {})
    expect(reply).toMatchObject({ judge: "haiku", modelId: "claude-haiku-x", text: '{"ok":1}', costUsd: 0.0064 })
    expect(calls[1]!.body).toMatchObject({ model: "claude-haiku-x", system: "sys" })
    expect(JSON.stringify(calls[1]!.body)).toContain('"media_type":"image/png"')
  })

  it("reports a provider error with its status", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes("/v1/models") ? Response.json({ data: [{ id: "claude-haiku-x" }] }) : new Response("overloaded", { status: 529 }),
    )
    await expect(anthropicHaiku(fetchMock as unknown as typeof fetch)(request, {})).rejects.toThrow(/529/)
  })
})
