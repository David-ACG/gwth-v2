// Dark surfaces after the card / quiet-fill / boundary step
// (bead gwth-launch-88z.32.15). Every page that shows a form box, plus the
// ordinary dark pages that inherit the lighter card, so a regression in any
// of them is visible rather than assumed.
//   node deploy/shot-dark-surfaces.mjs [base-url]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const base = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const out = "/home/david/projects/GWTH-launch-plan/walkthrough/shots/dark-form-boxes"
mkdirSync(out, { recursive: true })

const LESSON =
  "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

const publicPages = [
  { name: "contact", url: "/contact", full: false, phone: true },
  { name: "newsletter", url: "/newsletter", full: false, phone: true },
  { name: "waitlist", url: "/waitlist", full: false },
  { name: "login", url: "/login", full: false, phone: true },
  { name: "signup", url: "/signup", full: false },
  { name: "news", url: "/news", full: false },
  { name: "home", url: "/", full: false },
  { name: "pricing", url: "/pricing", full: false },
  { name: "for-institutions", url: "/for-institutions", full: false },
]

const authedPages = [
  { name: "dashboard", url: "/dashboard" },
  { name: "courses", url: "/courses" },
  { name: "lesson", url: LESSON },
]

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })

async function shoot(page, name, mode, width, full) {
  await page.evaluate((m) => {
    document.documentElement.classList.toggle("dark", m === "dark")
  }, mode)
  await page.waitForTimeout(500)
  const file = path.join(out, `${name}-${width}-${mode}.png`)
  await page.screenshot({ path: file, fullPage: full })
  console.log("wrote", file)
}

for (const mode of ["dark", "light"]) {
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
      colorScheme: mode,
      ignoreHTTPSErrors: true,
    })
    const page = await ctx.newPage()
    for (const p of publicPages) {
      if (width === 390 && !p.phone) continue
      if (width === 390 && mode === "light") continue
      await page.goto(base + p.url, { waitUntil: "networkidle", timeout: 90000 })
      await shoot(page, p.name, mode, width, p.full)
    }
    await ctx.close()
  }

  // Behind the login: the same tester account the other shooters use.
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: mode,
    ignoreHTTPSErrors: true,
  })
  const page = await ctx.newPage()
  const r = await page.request.post(`${base}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: "local-check@example.com", password: "Rafiki123" },
  })
  if (!r.ok()) {
    console.log("SKIP authed shots: sign-in returned " + r.status())
  } else {
    for (const p of authedPages) {
      await page.goto(base + p.url, { waitUntil: "load", timeout: 90000 })
      await page.waitForTimeout(2000)
      await shoot(page, p.name, mode, 1440, false)
    }
  }
  await ctx.close()
}

await browser.close()
console.log("done")
