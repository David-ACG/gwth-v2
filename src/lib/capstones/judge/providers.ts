/**
 * The two judges, called through the APIs that come with a data processing
 * agreement (decision 7a): the latest Luna through the OpenAI API at its
 * highest reasoning effort, and the latest Haiku through the Anthropic API.
 * Real student work never goes through David's subscription.
 *
 * Neither model is named in code. Each call asks the provider's model list
 * which Luna or Haiku is newest (cached for 12 hours) and records the id it
 * used on the judge run, so a new release is used the day it appears.
 *
 * Keys: OPENAI_API_KEY and ANTHROPIC_API_KEY (spend caps are set on the keys
 * themselves, bead 9289.11). Prices for the cost log come from
 * CAPSTONE_JUDGE_PRICES_USD, e.g. {"luna":{"in":0.2,"out":1.6},"haiku":{"in":1,"out":5}}
 * in US dollars per million tokens; without it the cost is logged as unknown.
 */
import "server-only"

import type { JudgeRequest } from "./prompt"

/** Which judge. */
export type JudgeName = "luna" | "haiku"

/** One judge call's raw outcome. */
export interface JudgeReply {
  judge: JudgeName
  modelId: string
  text: string
  inputTokens: number | null
  outputTokens: number | null
  costUsd: number | null
}

/** A judge: takes a request and a JSON Schema, returns the raw reply text. */
export type Judge = (request: JudgeRequest, schema: Record<string, unknown>) => Promise<JudgeReply>

const MODEL_CACHE_MS = 12 * 60 * 60 * 1000
const modelCache = new Map<JudgeName, { at: number; id: string }>()

/** The newest Luna id in an OpenAI model list (highest version number). */
export function newestLuna(ids: string[]): string | null {
  let best: { id: string; version: number } | null = null
  for (const id of ids) {
    const m = id.match(/^gpt-(\d+(?:\.\d+)?)-luna$/)
    if (!m) continue
    const version = Number(m[1])
    if (!best || version > best.version) best = { id, version }
  }
  return best?.id ?? null
}

/** The newest Haiku in an Anthropic model list (latest created_at). */
export function newestHaiku(models: { id: string; created_at?: string }[]): string | null {
  const haikus = models.filter((m) => /haiku/i.test(m.id))
  haikus.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
  return haikus[0]?.id ?? null
}

/** Cost in US dollars from the configured price list, or null when unknown. */
export function costOf(judge: JudgeName, inputTokens: number | null, outputTokens: number | null): number | null {
  let prices: Record<string, { in?: number; out?: number }>
  try {
    prices = JSON.parse(process.env.CAPSTONE_JUDGE_PRICES_USD ?? "")
  } catch {
    return null
  }
  const p = prices?.[judge]
  if (!p || typeof p.in !== "number" || typeof p.out !== "number" || inputTokens === null || outputTokens === null) return null
  return Math.round(((inputTokens * p.in + outputTokens * p.out) / 1_000_000) * 1e6) / 1e6
}

function key(name: "OPENAI_API_KEY" | "ANTHROPIC_API_KEY"): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

async function json(response: Response, what: string): Promise<Record<string, unknown>> {
  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`${what} answered ${response.status}: ${body.slice(0, 300)}`)
  }
  return (await response.json()) as Record<string, unknown>
}

async function resolveModel(judge: JudgeName, fetchImpl: typeof fetch): Promise<string> {
  const cached = modelCache.get(judge)
  if (cached && Date.now() - cached.at < MODEL_CACHE_MS) return cached.id
  let id: string | null
  if (judge === "luna") {
    const body = await json(
      await fetchImpl("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${key("OPENAI_API_KEY")}` } }),
      "OpenAI model list",
    )
    id = newestLuna(((body.data as { id: string }[]) ?? []).map((m) => m.id))
  } else {
    const body = await json(
      await fetchImpl("https://api.anthropic.com/v1/models?limit=100", {
        headers: { "x-api-key": key("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01" },
      }),
      "Anthropic model list",
    )
    id = newestHaiku((body.data as { id: string; created_at?: string }[]) ?? [])
  }
  if (!id) throw new Error(`no ${judge === "luna" ? "Luna" : "Haiku"} model in the provider's list`)
  modelCache.set(judge, { at: Date.now(), id })
  return id
}

/** The latest Luna through the OpenAI Responses API, at maximum reasoning, nothing stored. */
export function openAiLuna(fetchImpl: typeof fetch = fetch): Judge {
  return async (request, schema) => {
    const model = await resolveModel("luna", fetchImpl)
    const content: Record<string, unknown>[] = [{ type: "input_text", text: request.text }]
    for (const image of request.images) {
      content.push({ type: "input_image", image_url: `data:${image.mediaType};base64,${image.base64}` })
    }
    const body = await json(
      await fetchImpl("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { authorization: `Bearer ${key("OPENAI_API_KEY")}`, "content-type": "application/json" },
        body: JSON.stringify({
          model,
          store: false,
          reasoning: { effort: "max" },
          instructions: request.system,
          input: [{ role: "user", content }],
          text: { format: { type: "json_schema", name: "capstone_mark", schema, strict: true } },
        }),
        signal: AbortSignal.timeout(10 * 60_000),
      }),
      "OpenAI",
    )
    const output = (body.output as { type: string; content?: { type: string; text?: string }[] }[]) ?? []
    const text = output
      .flatMap((o) => (o.type === "message" ? (o.content ?? []) : []))
      .filter((c) => c.type === "output_text")
      .map((c) => c.text ?? "")
      .join("")
    const usage = body.usage as { input_tokens?: number; output_tokens?: number } | undefined
    const inputTokens = usage?.input_tokens ?? null
    const outputTokens = usage?.output_tokens ?? null
    return { judge: "luna", modelId: model, text, inputTokens, outputTokens, costUsd: costOf("luna", inputTokens, outputTokens) }
  }
}

/** The latest Haiku through the Anthropic Messages API. */
export function anthropicHaiku(fetchImpl: typeof fetch = fetch): Judge {
  return async (request) => {
    const model = await resolveModel("haiku", fetchImpl)
    const content: Record<string, unknown>[] = request.images.map((image) => ({
      type: "image",
      source: { type: "base64", media_type: image.mediaType, data: image.base64 },
    }))
    content.push({ type: "text", text: request.text })
    const body = await json(
      await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key("ANTHROPIC_API_KEY"),
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({ model, max_tokens: 8000, system: request.system, messages: [{ role: "user", content }] }),
        signal: AbortSignal.timeout(10 * 60_000),
      }),
      "Anthropic",
    )
    const text = ((body.content as { type: string; text?: string }[]) ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("")
    const usage = body.usage as { input_tokens?: number; output_tokens?: number } | undefined
    const inputTokens = usage?.input_tokens ?? null
    const outputTokens = usage?.output_tokens ?? null
    return { judge: "haiku", modelId: model, text, inputTokens, outputTokens, costUsd: costOf("haiku", inputTokens, outputTokens) }
  }
}

/** Forgets the resolved model ids (tests). */
export function clearModelCache(): void {
  modelCache.clear()
}
