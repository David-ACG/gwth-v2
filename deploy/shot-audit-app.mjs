/**
 * Layout-audit capture: the logged-in half of the CIPD demo path at both audit
 * widths. The lesson viewer paginates in client state rather than the URL, so
 * its later pages (prose, quiz, project) are reached by clicking CONTINUE.
 *
 *   node deploy/shot-audit-app.mjs <outDir> [baseUrl]
 */
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2] ?? "completion/audit-layout/app"
const BASE = process.argv[3] ?? "http://localhost:3000"
const EMAIL = process.env.DEMO_EMAIL ?? "local-check@example.com"
const PASSWORD = process.env.DEMO_PASSWORD ?? "Rafiki123"
const SLUG =
  process.env.LESSON_SLUG ?? "welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

const WIDTHS = [
  ["1440", 1440, 900],
  ["390", 390, 844],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

async function shoot(page, name) {
  // Lazy images below the fold never load for a fullPage screenshot unless the
  // page has actually been scrolled through first.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 100))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/${name}-fold.png` })
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  console.log(`${name}${overflow ? "  OVERFLOW" : ""}`)
}

for (const [wname, width, height] of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()

  const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: EMAIL, password: PASSWORD },
  })
  if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

  for (const [name, path] of [
    ["dashboard", "/dashboard"],
    ["syllabus", "/course/applied-ai-skills"],
    ["progress", "/progress"],
  ]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 })
    if (page.url().includes("/login")) throw new Error(`${path} bounced to /login`)
    await shoot(page, `${name}-${wname}`)
  }

  // Walk the lesson viewer forward, capturing each distinct page type. Names are
  // positional because which page is prose vs quiz vs project is content-driven.
  await page.goto(`${BASE}/course/applied-ai-skills/lesson/${SLUG}`, {
    waitUntil: "load",
    timeout: 90000,
  })
  await shoot(page, `lesson-p1-video-${wname}`)

  for (let i = 2; i <= 6; i++) {
    const next = page.getByRole("button", { name: /continue|next/i }).first()
    if (!(await next.isVisible().catch(() => false))) break
    await next.click()
    await shoot(page, `lesson-p${i}-${wname}`)
  }

  await ctx.close()
}

await browser.close()
