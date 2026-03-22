import { describe, it, expect } from "vitest"
import robots from "./robots"

describe("robots.txt", () => {
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
})
