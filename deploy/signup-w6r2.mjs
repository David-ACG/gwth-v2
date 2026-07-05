// Throwaway: create the W6 r2 fresh account. The public /signup surface is
// invite-only copy with NO form (PostBetaSignupForm is dormant), so the account
// is created from inside the Playwright page at /signup via the same
// /api/auth/sign-up/email endpoint authClient.signUp.email uses (correct
// Origin), then UI login is verified after email_verified is flipped in the DB.
import { chromium } from "playwright"

const BASE = "http://192.168.178.50:3001"
const EMAIL = process.env.FRESH_EMAIL
const PW = process.env.FRESH_PW
const MODE = process.env.MODE || "signup" // signup | login

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on("console", (m) => { if (m.type() === "error") console.log("console-error:", m.text().slice(0, 200)) })

if (MODE === "signup") {
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
  const hasForm = await page.locator('input[type="email"]').count()
  console.log("signup page email inputs:", hasForm, "(0 = invite-only copy, no form)")
  await page.screenshot({ path: "completion/W6/signup-light-1280.png", fullPage: true })
  const res = await page.evaluate(async ({ email, pw }) => {
    const r = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "W6 Fresh", email, password: pw }),
    })
    return { status: r.status, body: (await r.text()).slice(0, 300) }
  }, { email: EMAIL, pw: PW })
  console.log("sign-up/email:", res.status, res.body)
} else {
  // verify UI login lands on the dashboard
  await page.goto(`${BASE}/login`, { waitUntil: "load" })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PW)
  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ])
  console.log("post-login url:", page.url())
}
await browser.close()
