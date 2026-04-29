#!/usr/bin/env node
// Snag review screenshot capture — full-page across desktop+mobile, light+dark.
// Output: .snagging/<run-id>/before/<combo>.png

import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const STAGING_URL = process.env.STAGING_URL ?? "http://192.168.178.50:3001"
const OUT = join(process.cwd(), ".snagging", "2026-04-28-1140", "before")

const COMBOS = [
  { name: "desktop-light", viewport: { width: 1440, height: 900 }, colorScheme: "light" },
  { name: "desktop-dark", viewport: { width: 1440, height: 900 }, colorScheme: "dark" },
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

await mkdir(OUT, { recursive: true })

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
    await page.waitForTimeout(1500)
    const out = join(OUT, `${combo.name}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`captured ${combo.name} -> ${out}`)
    await context.close()
  }
} finally {
  await browser.close()
}
