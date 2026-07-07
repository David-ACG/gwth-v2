#!/usr/bin/env node
// W16 staging verification (adversarial). Logs into staging with the tester
// account, opens one authored-figures lesson (l01) and one section-injected
// lesson, walks every outline page, and asserts that every .lesson-prose <img>
// is a media.gwth.ai URL that actually loaded (naturalWidth > 0) with ZERO
// broken images. Captures desktop + mobile screenshots into completion/W16/.
// Usage: BASE_URL=http://hlab.taila51191.ts.net:3001 node scripts/w16-verify-staging.mjs

import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const BASE = process.env.BASE_URL ?? "http://hlab.taila51191.ts.net:3001"
const EMAIL = process.env.TEST_EMAIL ?? "w13-fresh@gwth.ai"
const PASSWORD = process.env.TEST_PASSWORD ?? "W13-fresh-pass-2026!"
const OUT = join(process.cwd(), "completion", "W16")

const LESSONS = [
  {
    slug: "welcome-to-gwth-six-ways-ai-can-give-you-superpowers",
    label: "l01-authored-figures",
    minImages: 5,
  },
  {
    slug: "research-superpower-find-compare-and-verify-anything",
    label: "research-injected-sections",
    minImages: 3,
  },
]

const DEVICES = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
let failures = 0
const report = []

try {
  for (const device of DEVICES) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      reducedMotion: "reduce",
    })
    await context.addCookies([
      { name: "site_access", value: "granted", domain: new URL(BASE).hostname, path: "/" },
    ])
    const page = await context.newPage()
    // Track any image request that returns a non-2xx from the CDN.
    const badResponses = []
    page.on("response", (r) => {
      const u = r.url()
      if (u.includes("media.gwth.ai") && r.status() >= 400) {
        badResponses.push(`${r.status()} ${u}`)
      }
    })

    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 })
    console.log(`[${device.name}] logged in as ${EMAIL} -> ${page.url()}`)

    for (const lesson of LESSONS) {
      const url = `${BASE}/course/applied-ai-skills/lesson/${lesson.slug}`
      await page.goto(url, { waitUntil: "domcontentloaded" })
      await page.waitForLoadState("networkidle").catch(() => {})
      await page.waitForTimeout(1500)

      const outline = page.locator('button:has-text("P0"), button:has-text("P1")')
      const pages = Math.max(1, Math.min(await outline.count(), 14))
      const seen = new Set()
      let loaded = 0
      let broken = 0
      let bestCount = 0
      for (let i = 0; i < pages; i++) {
        if (i > 0) {
          await outline.nth(i).click().catch(() => {})
          await page.waitForTimeout(1500)
        }
        const stats = await page.evaluate(() => {
          const imgs = [...document.querySelectorAll(".lesson-prose img")]
          return {
            srcs: imgs.map((i) => i.src),
            loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
            broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
          }
        })
        stats.srcs.forEach((s) => seen.add(s))
        loaded += stats.loaded
        broken += stats.broken
        if (stats.loaded > bestCount) {
          bestCount = stats.loaded
          await page.locator(".lesson-prose img").first().scrollIntoViewIfNeeded().catch(() => {})
          await page.waitForTimeout(500)
          await page.screenshot({
            path: join(OUT, `${lesson.label}-${device.name}.png`),
            fullPage: device.name === "mobile",
          })
        }
      }
      const nonCdn = [...seen].filter((s) => s && !s.includes("media.gwth.ai") && !s.startsWith("data:"))
      const line =
        `[${device.name}] ${lesson.label}: ${seen.size} figures, ${loaded} loaded, ` +
        `${broken} broken(naturalWidth0), ${badResponses.length} CDN 4xx/5xx, ` +
        `${nonCdn.length} non-CDN`
      console.log(line)
      report.push(line)
      if (nonCdn.length) console.log("  non-CDN:", nonCdn.slice(0, 3).join(" | "))

      let pass = true
      if (seen.size < lesson.minImages) { pass = false; console.error(`  FAIL: figures ${seen.size} < ${lesson.minImages}`) }
      if (broken > 0) { pass = false; console.error(`  FAIL: ${broken} broken images`) }
      if (nonCdn.length > 0) { pass = false; console.error(`  FAIL: non-CDN img srcs present`) }
      if (!pass) failures++
      else console.log(`  PASS ${lesson.label} [${device.name}]`)
    }
    if (badResponses.length) console.log(`[${device.name}] CDN error responses:`, badResponses.slice(0, 5))
    await context.close()
  }
} finally {
  await browser.close()
}
console.log("\n=== SUMMARY ===")
report.forEach((r) => console.log(r))
console.log(failures ? `RESULT: FAIL (${failures})` : "RESULT: PASS (all)")
process.exit(failures ? 1 : 0)
