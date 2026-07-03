import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const STAGING_URL = process.env.STAGING_URL ?? "http://192.168.178.50:3001"
const OUT = join(process.cwd(), ".snagging", "2026-04-28-1140", "after")

const COMBOS = [
  { name: "fold-desktop-light", viewport: { width: 1440, height: 900 }, colorScheme: "light" },
  { name: "fold-desktop-dark", viewport: { width: 1440, height: 900 }, colorScheme: "dark" },
  { name: "fold-mobile-light", viewport: { width: 412, height: 823 }, colorScheme: "light" },
]

const url = new URL(STAGING_URL)
const cookie = { name: "site_access", value: "granted", domain: url.hostname, path: "/" }

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
      try { localStorage.setItem("theme", theme) } catch {}
    }, combo.colorScheme)
    await page.goto(STAGING_URL, { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForFunction(() => document.fonts.ready)
    await page.waitForTimeout(1500)
    const out = join(OUT, `${combo.name}.png`)
    await page.screenshot({ path: out, fullPage: false })
    console.log(`captured ${combo.name} -> ${out}`)
    await context.close()
  }
} finally {
  await browser.close()
}
