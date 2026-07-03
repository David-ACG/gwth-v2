import { describe, it, expect, beforeEach, afterEach } from "vitest"
import robots from "./robots"

describe("robots.txt", () => {
  const previous = process.env.ALLOW_INDEXING
  beforeEach(() => {
    delete process.env.ALLOW_INDEXING
  })
  afterEach(() => {
    if (previous === undefined) delete process.env.ALLOW_INDEXING
    else process.env.ALLOW_INDEXING = previous
  })

  it("blocks all user agents from all paths", () => {
    const result = robots()
    expect(result.rules).toBeDefined()
    expect(Array.isArray(result.rules)).toBe(true)

    const rules = result.rules as Array<{ userAgent: string; disallow: string }>
    const wildcardRule = rules.find((r) => r.userAgent === "*")
    expect(wildcardRule).toBeDefined()
    expect(wildcardRule!.disallow).toBe("/")
  })

  it("blocks known AI scrapers explicitly", () => {
    const result = robots()
    const rules = result.rules as Array<{ userAgent: string; disallow: string }>
    const aiScrapers = ["GPTBot", "ChatGPT-User", "Google-Extended", "CCBot", "anthropic-ai", "ClaudeBot"]

    for (const scraper of aiScrapers) {
      const rule = rules.find((r) => r.userAgent === scraper)
      expect(rule, `Missing rule for ${scraper}`).toBeDefined()
      expect(rule!.disallow).toBe("/")
    }
  })

  it("does not expose a sitemap", () => {
    const result = robots()
    expect(result.sitemap).toBeUndefined()
  })

  it("allows all crawlers when ALLOW_INDEXING=1", () => {
    process.env.ALLOW_INDEXING = "1"
    const result = robots()
    const rules = result.rules as Array<{ userAgent: string; allow?: string; disallow?: string }>
    expect(rules.length).toBe(1)
    const rule = rules[0]
    expect(rule).toBeDefined()
    expect(rule!.userAgent).toBe("*")
    expect(rule!.allow).toBe("/")
    expect(rule!.disallow).toBeUndefined()
  })
})
