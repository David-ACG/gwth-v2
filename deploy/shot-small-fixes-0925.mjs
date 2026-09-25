// Proof shots for the five small website fixes of 2026-09-25 (ship
// website-small-fixes-0925): gwth-launch-dx6, awb, amb, jser, i6n.
//
//   REVIEW_EMAIL=... REVIEW_PASSWORD=... \
//     node deploy/shot-small-fixes-0925.mjs [outDir] [baseUrl]
//
// Defaults to the hlab preview. Credentials come from env (the local review
// fixture identities), so nothing lands in the repo.
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2] ?? "completion/small-fixes-0925"
const BASE = process.argv[3] ?? "https://hlab.taila51191.ts.net:9458"
const EMAIL = process.env.REVIEW_EMAIL
const PASSWORD = process.env.REVIEW_PASSWORD
if (!EMAIL || !PASSWORD) throw new Error("set REVIEW_EMAIL and REVIEW_PASSWORD")

const LESSON =
  "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

/** A fresh context at the given viewport and theme, optionally signed in. */
async function open({ width, theme = "light", signedIn = true }) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : 1000 },
    ignoreHTTPSErrors: true,
  })
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await ctx.newPage()
  if (signedIn) {
    const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
      headers: { "Content-Type": "application/json", Origin: BASE },
      data: { email: EMAIL, password: PASSWORD },
    })
    if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)
  }
  return { ctx, page }
}

async function shot(page, path, name, { full = false } = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 120000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
  console.log(`${name}: ${page.url()}`)
}

// dx6: the course page header, signed in.
{
  const { ctx, page } = await open({ width: 1440 })
  await shot(page, "/course/applied-ai-skills", "dx6-course-page-1440")
  console.log(`  tab title: ${await page.title()}`)
  await ctx.close()
}

// awb: auth wordmark against the home nav, 1440 and 390, light and dark.
for (const width of [1440, 390]) {
  for (const theme of ["light", "dark"]) {
    const { ctx, page } = await open({ width, theme, signedIn: false })
    await shot(page, "/login", `awb-login-${width}-${theme}`)
    await shot(page, "/", `awb-home-${width}-${theme}`)
    await ctx.close()
  }
}
{
  const { ctx, page } = await open({ width: 1440, signedIn: false })
  await shot(page, "/signup", "awb-signup-1440-light")
  await shot(page, "/reset-password", "awb-reset-password-1440-light")
  await ctx.close()
}

// amb: labs listing without the archive, 1440 and 390, full page.
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ width })
  await shot(page, "/labs", `amb-labs-${width}`, { full: true })
  await ctx.close()
}

// jser: a prose page of L1 with nothing on the right edge; i6n: its project.
{
  const { ctx, page } = await open({ width: 1440 })
  // The viewer paginates in client state, so reach a prose page by clicking
  // its rail entry rather than by URL.
  await page.goto(`${BASE}${LESSON}`, { waitUntil: "networkidle", timeout: 120000 })
  await page.getByText("Overview", { exact: true }).first().click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${OUT}/jser-lesson-prose-1440.png` })
  console.log("jser-lesson-prose-1440: Overview page")
  await page.keyboard.press("f")
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/jser-lesson-prose-after-F-1440.png` })
  const project = page.getByText("Your project", { exact: false }).first()
  await project.click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${OUT}/i6n-l01-project-1440.png`, fullPage: true })
  console.log(`i6n-l01-project-1440: ${page.url()}`)
  const text = await page.locator("body").innerText()
  console.log(`  portfolio save area on page: ${/portfolio save area/i.test(text)}`)
  console.log(`  "full GWTH course" on page: ${/full GWTH course/i.test(text)}`)
  await ctx.close()
}

await browser.close()
console.log(`wrote shots to ${OUT}`)
