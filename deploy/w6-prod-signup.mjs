// W6 post-deploy (prod gwth.ai) step 3: signup page assertions + UI signup.
import { chromium } from "playwright"

const BASE = "https://gwth.ai"
const EMAIL = process.env.FRESH_EMAIL
const PW = process.env.FRESH_PW
const OUT = "/home/david/projects/GWTH_V2/completion/W6"

const browser = await chromium.launch()
const errors = []

async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport, colorScheme: "light" })
  const page = await ctx.newPage()
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("favicon")) errors.push(`[signup] ${m.text().slice(0, 300)}`)
  })
  page.on("pageerror", (e) => errors.push(`[signup] pageerror: ${String(e).slice(0, 300)}`))
  return { ctx, page }
}

// --- assertions + screenshot ---
if (!process.env.SKIP_ASSERT) {
  const { ctx, page } = await newPage({ width: 1280, height: 800 })
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
  console.log("landed url:", page.url())
  const bodyText = await page.locator("body").innerText()
  console.log("redirected to /access:", page.url().includes("/access"))
  console.log("invite framing present:", /invite/i.test(bodyText))
  const nameField = await page.locator('input[name="name"], input#name, input[autocomplete="name"]').count()
  const emailField = await page.locator('input[type="email"]').count()
  const pwFields = await page.locator('input[type="password"]').count()
  const createBtn = await page.getByRole("button", { name: /create account/i }).count()
  const oauthBtns = await page.locator("button, a").filter({ hasText: /google|github|linkedin|continue with/i }).count()
  console.log("name inputs:", nameField, "| email inputs:", emailField, "| password inputs:", pwFields, "| create-account buttons:", createBtn)
  console.log("oauth buttons:", oauthBtns)
  console.log("headings:", JSON.stringify(await page.locator("h1, h2").allTextContents()))
  await page.screenshot({ path: `${OUT}/prod-signup-1280.png`, fullPage: true })
  await ctx.close()
}

// --- fill + submit via real UI ---
{
  const { ctx, page } = await newPage({ width: 1280, height: 800 })
  await page.goto(`${BASE}/signup`, { waitUntil: "load", timeout: 60000 })
  await page.locator('input[type="email"]').waitFor({ timeout: 20000 })
  await page.locator('input[name="name"], input#name, input[autocomplete="name"]').first().fill("W6 Prodcheck")
  await page.locator('input[type="email"]').first().fill(EMAIL)
  const pws = page.locator('input[type="password"]')
  await pws.nth(0).fill(PW)
  if ((await pws.count()) > 1) await pws.nth(1).fill(PW)
  await page.getByRole("button", { name: /create account/i }).click()
  try {
    await page.getByText(/check your email/i).waitFor({ timeout: 20000 })
    console.log("SUCCESS surface: 'Check your email' shown")
  } catch {
    console.log("SUCCESS surface NOT found. Body snippet:", (await page.locator("body").innerText()).slice(0, 600))
  }
  console.log("post-submit url:", page.url())
  await ctx.close()
}

console.log("console errors:", errors.length ? JSON.stringify(errors, null, 2) : "none")
await browser.close()
