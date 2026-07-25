#!/usr/bin/env node
/**
 * W5 dry-run + verification screenshots.
 *
 * Logs in as the granted+verified test account, screenshots /guide and the
 * lesson-viewer report form (light + dark, desktop + 412px), then submits real
 * feedback from a lesson page through the launcher UI. Output:
 *   completion/W5-screenshots/*.png
 *
 * Usage: TEST_EMAIL=.. TEST_PW=.. node scripts/w5-dry-run.mjs
 */
import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

// W25 deleted the /demo/lesson scratch viewer (it shipped real lesson prose
// into a public static chunk). The report-a-problem launcher this script
// exercises lives on the REAL lesson viewer, so drive that instead. It is
// gated, which is why the script already signs in and reuses storageState.
const LESSON_PATH =
  process.env.LESSON_PATH ||
  "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const BASE = process.env.STAGING_URL ?? "http://192.168.178.50:3001"
const EMAIL = process.env.TEST_EMAIL ?? "w5-dryrun@gwth.ai"
const PW = process.env.TEST_PW ?? "BetaTest2026"
const OUT = join(process.cwd(), "completion", "W5-screenshots")

const COMBOS = [
  { name: "desktop-light", viewport: { width: 1280, height: 900 }, colorScheme: "light" },
  { name: "desktop-dark", viewport: { width: 1280, height: 900 }, colorScheme: "dark" },
  { name: "mobile-light", viewport: { width: 412, height: 900 }, colorScheme: "light" },
  { name: "mobile-dark", viewport: { width: 412, height: 900 }, colorScheme: "dark" },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForFunction(() => document.fonts.ready).catch(() => {})
  await page.waitForTimeout(600)
}

try {
  // ── 1. Log in once, capture storage state ──────────────────────────────────
  const loginCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  })
  const lp = await loginCtx.newPage()
  await lp.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
  await lp.locator('input[type="email"]').first().fill(EMAIL)
  await lp.locator('input[type="password"]').first().fill(PW)
  await lp.getByRole("button", { name: /log ?in|sign ?in/i }).first().click()
  await lp.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 })
  console.log("logged in, landed on", lp.url())
  const storageState = await loginCtx.storageState()
  await loginCtx.close()

  // ── 2. Screenshot /guide + lesson report form across 4 combos ──────────────
  for (const c of COMBOS) {
    const ctx = await browser.newContext({
      viewport: c.viewport,
      colorScheme: c.colorScheme,
      reducedMotion: "reduce",
      storageState,
    })
    await ctx.addInitScript((theme) => {
      try { localStorage.setItem("theme", theme) } catch {}
    }, c.colorScheme)
    const page = await ctx.newPage()

    // /guide (contains the always-in-view report panel)
    await page.goto(`${BASE}/guide`, { waitUntil: "domcontentloaded" })
    await settle(page)
    await page.screenshot({ path: join(OUT, `guide-${c.name}.png`), fullPage: true })
    console.log(`captured guide-${c.name}`)

    // Lesson viewer + launcher overlay (the report form opened from a lesson)
    await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "domcontentloaded" })
    await settle(page)
    await page.getByRole("button", { name: /report a problem/i }).first().click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(OUT, `lesson-report-${c.name}.png`) })
    console.log(`captured lesson-report-${c.name}`)
    await ctx.close()
  }

  // ── 3. Real feedback submission from a lesson page (the dry-run row) ────────
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
    storageState,
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "domcontentloaded" })
  await settle(page)
  await page.getByRole("button", { name: /report a problem/i }).first().click()
  await page.waitForTimeout(300)
  await page.locator("#feedback-category").selectOption("bug")
  await page
    .locator("#feedback-message")
    .fill(
      "W5 dry-run: mark complete on the lesson viewer did nothing on my first tap. Reproducible from the demo lesson."
    )
  await page.screenshot({ path: join(OUT, "feedback-filled.png") })
  await page.getByRole("button", { name: /send feedback/i }).click()
  await page.getByText(/thank you/i).first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, "feedback-success.png") })
  console.log(`feedback submitted from ${LESSON_PATH}`)
  await ctx.close()
} finally {
  await browser.close()
}
