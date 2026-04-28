#!/usr/bin/env node
// Capture verification screenshots of the homepage on P520 staging.
// Output: kanban/2_testing/screenshots/2026-04-27_phase-1b-homepage/{combo}.png
//
// Hits the password-gated staging URL by pre-setting the site_access cookie.
// Usage: node scripts/capture-staging-screenshots.mjs

import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const STAGING_URL = process.env.STAGING_URL ?? "http://192.168.178.50:3001"
const OUTPUT_DIR = join(
  process.cwd(),
  "kanban",
  "2_testing",
  "screenshots",
  "2026-04-27_phase-1b-homepage"
)

const COMBOS = [
  { name: "desktop-light", viewport: { width: 1280, height: 800 }, colorScheme: "light" },
  { name: "desktop-dark", viewport: { width: 1280, height: 800 }, colorScheme: "dark" },
  { name: "mobile-light", viewport: { width: 412, height: 823 }, colorScheme: "light" },
  { name: "mobile-dark", viewport: { width: 412, height: 823 }, colorScheme: "dark" },
]

const url = new URL(STAGING_URL)
const cookie = {
  name: "site_access",
  value: "granted",
  domain: url.hostname,
  path: "/",
}

await mkdir(OUTPUT_DIR, { recursive: true })

const browser = await chromium.launch()
try {
  for (const combo of COMBOS) {
    const context = await browser.newContext({
      viewport: combo.viewport,
      colorScheme: combo.colorScheme,
      reducedMotion: "reduce",
    })
    await context.addCookies([cookie])
    const page = await context.newPage()
    await page.addInitScript((theme) => {
      try {
        localStorage.setItem("theme", theme)
      } catch {
        /* ignore */
      }
    }, combo.colorScheme)
    await page.goto(STAGING_URL, { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForFunction(() => document.fonts.ready)
    // Settle Motion + scroll-reveal
    await page.waitForTimeout(1500)
    const out = join(OUTPUT_DIR, `${combo.name}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`captured ${combo.name} → ${out}`)
    await context.close()
  }
} finally {
  await browser.close()
}
