// W20 verification: log in on a target origin and screenshot the four fixes.
// Usage: node verify-w20.mjs <baseURL> <email> <password> <outdir> <tag>
import pkg from "/home/david/projects/GWTH_V2/node_modules/@playwright/test/index.js"
const { chromium } = pkg

const [, , BASE, EMAIL, PASS, OUTDIR, TAG] = process.argv
if (!BASE || !EMAIL || !PASS || !OUTDIR || !TAG) {
  console.error("args: <baseURL> <email> <password> <outdir> <tag>")
  process.exit(1)
}

const WELCOME = "welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const EFFICIENCY = "ai-efficiency-better-results-for-less-cost"
const COURSE = "applied-ai-skills"

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }

async function shot(page, name) {
  const path = `${OUTDIR}/${TAG}_${name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log("shot:", path)
}

async function login(context) {
  const page = await context.newPage()
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASS)
  await Promise.all([
    page.waitForURL(/\/dashboard|\/$/, { timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await page.waitForTimeout(2500)
  await page.close()
}

async function outlineTitles(page) {
  // The desktop outline rail: read the list of page titles.
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll("[data-section='lesson-viewer'] nav a, [data-section='lesson-viewer'] aside a, [data-section='lesson-viewer'] ol li, [data-section='lesson-viewer'] ul li")
    )
    const texts = nodes.map((n) => n.textContent.trim()).filter(Boolean)
    return texts.slice(0, 40)
  })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: DESKTOP, ignoreHTTPSErrors: true })
await login(context)

// ---- Dashboard (26b) desktop + mobile ----
const dash = await context.newPage()
await dash.setViewportSize(DESKTOP)
await dash.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" })
await dash.waitForTimeout(1500)
await shot(dash, "dashboard_desktop")
const dashText = await dash.evaluate(() => document.body.innerText)
console.log("DASH month3?:", /MONTH 3 OF 3|Month 3 of 3/.test(dashText))
console.log("DASH month1?:", /MONTH 1 OF 3|Month 1 of 3/.test(dashText))
await dash.setViewportSize(MOBILE)
await dash.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" })
await dash.waitForTimeout(1200)
await shot(dash, "dashboard_mobile")
await dash.close()

// ---- Welcome lesson: blockquote body + outline (5vh + qar) ----
const l1 = await context.newPage()
await l1.setViewportSize(DESKTOP)
await l1.goto(`${BASE}/course/${COURSE}/lesson/${WELCOME}?surface=prose&page=3`, { waitUntil: "networkidle" })
await l1.waitForTimeout(1500)
// Page to a section containing a blockquote (walk CONTINUE up to a few times).
let foundQuote = false
for (let i = 0; i < 12; i++) {
  const has = await l1.evaluate(() => !!document.querySelector("[data-section='lesson-viewer'] blockquote"))
  if (has) { foundQuote = true; break }
  const cont = l1.locator("text=CONTINUE").first()
  if (await cont.count()) { await cont.click(); await l1.waitForTimeout(700) } else break
}
console.log("WELCOME blockquote rendered:", foundQuote)
const rawGt = await l1.evaluate(() => document.body.innerText.includes("> **") || document.body.innerText.includes("&gt;"))
console.log("WELCOME raw '>' leak:", rawGt)
await shot(l1, "welcome_blockquote_desktop")
const l1outline = await outlineTitles(l1)
console.log("WELCOME outline:", JSON.stringify(l1outline.slice(0, 12)))
// mobile blockquote
await l1.setViewportSize(MOBILE)
await l1.waitForTimeout(800)
await shot(l1, "welcome_blockquote_mobile")
await l1.close()

// ---- Efficiency lesson outline (qar: must differ) ----
const l2 = await context.newPage()
await l2.setViewportSize(DESKTOP)
await l2.goto(`${BASE}/course/${COURSE}/lesson/${EFFICIENCY}?surface=prose&page=2`, { waitUntil: "networkidle" })
await l2.waitForTimeout(1500)
await shot(l2, "efficiency_outline_desktop")
const l2outline = await outlineTitles(l2)
console.log("EFFICIENCY outline:", JSON.stringify(l2outline.slice(0, 12)))
console.log("OUTLINES DIFFER:", JSON.stringify(l1outline) !== JSON.stringify(l2outline))
await l2.close()

// ---- Feedback rail / launcher overlap (a0k) ----
const l3 = await context.newPage()
await l3.setViewportSize(DESKTOP)
await l3.goto(`${BASE}/course/${COURSE}/lesson/${WELCOME}?surface=prose&page=3`, { waitUntil: "networkidle" })
await l3.waitForTimeout(1500)
const launcherCount = await l3.evaluate(() => {
  return Array.from(document.querySelectorAll("button")).filter((b) => /report a problem/i.test(b.textContent)).length
})
console.log("A0K global launcher present on lesson (should be 0):", launcherCount)
await shot(l3, "lesson_rail_desktop")
await l3.setViewportSize(MOBILE)
await l3.goto(`${BASE}/course/${COURSE}/lesson/${WELCOME}?surface=prose&page=3&widget=feedback`, { waitUntil: "networkidle" })
await l3.waitForTimeout(1200)
await shot(l3, "lesson_rail_mobile")
await l3.close()

// ---- Quiz bold (5vh part 2) ----
const q = await context.newPage()
await q.setViewportSize(DESKTOP)
await q.goto(`${BASE}/course/${COURSE}/lesson/${WELCOME}?surface=qa`, { waitUntil: "networkidle" })
await q.waitForTimeout(1500)
const quizRaw = await q.evaluate(() => {
  const t = document.querySelector("[data-section='lesson-viewer']")?.innerText || ""
  return { hasStars: /\*\*/.test(t) }
})
console.log("QUIZ raw '**' leak (should be false):", quizRaw.hasStars)
await shot(q, "quiz_bold_desktop")
await q.close()

await browser.close()
console.log("DONE", TAG)
