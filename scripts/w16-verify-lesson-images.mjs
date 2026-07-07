#!/usr/bin/env node
// W16 verification: logged-in lesson pages render CDN-hosted figures.
// Logs in with the staging test account, opens one authored-figures lesson
// (l01) and one section-injected lesson (research superpower), asserts real
// loaded <img> elements from the media CDN, and screenshots both.
// Usage: BASE_URL=http://192.168.178.50:3001 node scripts/w16-verify-lesson-images.mjs

import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

const BASE = process.env.BASE_URL ?? "http://192.168.178.50:3001"
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

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
let failures = 0
try {
  const width = Number(process.env.VIEWPORT_WIDTH ?? 1440)
  const context = await browser.newContext({
    viewport: { width, height: width < 800 ? 844 : 900 },
    reducedMotion: "reduce",
  })
  await context.addCookies([
    { name: "site_access", value: "granted", domain: new URL(BASE).hostname, path: "/" },
  ])
  const page = await context.newPage()

  // Sign in (Better Auth email/password form on /login).
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 })
  console.log(`logged in as ${EMAIL} -> ${page.url()}`)

  for (const lesson of LESSONS) {
    const url = `${BASE}/course/applied-ai-skills/lesson/${lesson.slug}`
    await page.goto(url, { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(2000)

    // The editorial viewer pages the lesson (outline P01..Pnn, page 1 is often
    // the intro video); walk every outline entry and collect CDN figures.
    const outline = page.locator('button:has-text("P0"), button:has-text("P1")')
    const pages = Math.max(1, Math.min(await outline.count(), 12))
    const seen = new Set()
    let loaded = 0
    let bestPage = -1
    let bestCount = 0
    for (let i = 0; i < pages; i++) {
      if (i > 0) {
        await outline.nth(i).click().catch(() => {})
        await page.waitForTimeout(1800)
      }
      const stats = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll(".lesson-prose img")]
        return {
          srcs: imgs.map((i) => i.src).filter((s) => s.includes("media.gwth.ai")),
          loaded: imgs.filter(
            (i) => i.complete && i.naturalWidth > 0 && i.src.includes("media.gwth.ai"),
          ).length,
        }
      })
      stats.srcs.forEach((s) => seen.add(s))
      loaded += stats.loaded
      if (stats.loaded > bestCount) {
        bestCount = stats.loaded
        bestPage = i
        await page
          .locator(".lesson-prose img")
          .first()
          .scrollIntoViewIfNeeded()
          .catch(() => {})
        await page.waitForTimeout(800)
        await page.screenshot({
          path: join(OUT, `${lesson.label}-${width}.png`),
        })
      }
    }
    console.log(
      `${lesson.label}: ${seen.size} unique CDN figures across ${pages} page(s), ` +
        `${loaded} loaded; screenshot from page ${bestPage + 1}`,
    )
    console.log([...seen].slice(0, 3).join("\n"))

    if (seen.size < lesson.minImages) {
      console.error(`FAIL ${lesson.label}: ${seen.size} CDN figures < ${lesson.minImages}`)
      failures++
    } else {
      console.log(`PASS ${lesson.label}`)
    }
  }
} finally {
  await browser.close()
}
process.exit(failures ? 1 : 0)
