#!/usr/bin/env node
// Capture l01 authored figures at mobile width. The OutlineRail is hidden
// below lg (1024px) but its page buttons stay in the DOM, so we force-click
// a prose page entry to land on figures, then assert + screenshot.
import { chromium } from "@playwright/test"
import { join } from "node:path"

const BASE = process.env.BASE_URL ?? "http://hlab.taila51191.ts.net:3001"
const EMAIL = process.env.TEST_EMAIL ?? "w13-fresh@gwth.ai"
const PASSWORD = process.env.TEST_PASSWORD ?? "W13-fresh-pass-2026!"
const OUT = join(process.cwd(), "completion", "W16")
const SLUG = "welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

const browser = await chromium.launch()
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  })
  await context.addCookies([
    { name: "site_access", value: "granted", domain: new URL(BASE).hostname, path: "/" },
  ])
  const page = await context.newPage()
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 })
  await page.goto(`${BASE}/course/applied-ai-skills/lesson/${SLUG}`, { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(1500)

  const outline = page.locator('button:has-text("P0"), button:has-text("P1")')
  const total = await outline.count()
  let best = { loaded: 0 }
  for (let i = 1; i < Math.min(total, 14); i++) {
    await outline.nth(i).dispatchEvent("click").catch(() => {})
    await page.waitForTimeout(1600)
    const stats = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll(".lesson-prose img")]
      return {
        total: imgs.length,
        loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0 && i.src.includes("media.gwth.ai")).length,
        broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
        srcs: imgs.map((i) => i.src),
      }
    })
    if (stats.loaded > best.loaded) {
      best = stats
      await page.locator(".lesson-prose img").first().scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(500)
      await page.screenshot({ path: join(OUT, "l01-authored-figures-mobile.png"), fullPage: true })
    }
  }
  console.log(`l01 mobile: best loaded=${best.loaded} broken=${best.broken || 0} total=${best.total || 0}`)
  if (best.srcs) console.log((best.srcs[0] || "").slice(0, 80))
  console.log(best.loaded > 0 && !best.broken ? "PASS" : "FAIL")
} finally {
  await browser.close()
}
