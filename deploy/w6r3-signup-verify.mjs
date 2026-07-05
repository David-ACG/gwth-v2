// W6 r3: verify FIXED invited-tester signup flow on staging :3001.
// Steps 2-3: assert invite framing + real form, screenshots, submit via UI.
import { chromium } from "playwright"

const BASE = "http://192.168.178.50:3001"
const EMAIL = process.env.FRESH_EMAIL
const PW = process.env.FRESH_PW
const OUT = "/home/david/projects/GWTH_V2/completion/W6"

const browser = await chromium.launch()
const errors = []

async function newPage(scheme, viewport) {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme })
  const page = await ctx.newPage()
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("favicon")) errors.push(`[${scheme} ${viewport.width}] ${m.text().slice(0, 300)}`)
  })
  page.on("pageerror", (e) => errors.push(`[${scheme} ${viewport.width}] pageerror: ${String(e).slice(0, 300)}`))
  return { ctx, page }
}

// --- Step 2: light 1280 — assertions + screenshot ---
{
  const { ctx, page } = await newPage("light", { width: 1280, height: 800 })
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })

  const title = await page.locator("h1, h2").allTextContents()
  const bodyText = await page.locator("body").innerText()
  const inviteFraming = /invite-only beta/i.test(bodyText)
  const nameField = await page.locator('input[name="name"], input#name, input[autocomplete="name"]').count()
  const emailField = await page.locator('input[type="email"]').count()
  const pwFields = await page.locator('input[type="password"]').count()
  const createBtn = await page.getByRole("button", { name: /create account/i }).count()
  const oauthBtns = await page.locator("button, a").filter({ hasText: /google|github|oauth|continue with/i }).count()

  console.log("headings:", JSON.stringify(title))
  console.log("invite-only framing present:", inviteFraming)
  console.log("name inputs:", nameField, "| email inputs:", emailField, "| password inputs:", pwFields, "| create-account buttons:", createBtn)
  console.log("oauth buttons:", oauthBtns)
  await page.screenshot({ path: `${OUT}/signup-fixed-light-1280.png`, fullPage: true })
  await ctx.close()
}

// --- Step 2b: dark 1280 ---
{
  const { ctx, page } = await newPage("dark", { width: 1280, height: 800 })
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
  await page.screenshot({ path: `${OUT}/signup-fixed-dark-1280.png`, fullPage: true })
  await ctx.close()
}

// --- Step 2c: light 412x915 ---
{
  const { ctx, page } = await newPage("light", { width: 412, height: 915 })
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
  await page.screenshot({ path: `${OUT}/signup-fixed-light-412.png`, fullPage: true })
  await ctx.close()
}

// --- Step 3: fill + submit via real UI ---
{
  const { ctx, page } = await newPage("light", { width: 1280, height: 800 })
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })

  await page.locator('input[name="name"], input#name, input[autocomplete="name"]').first().fill("W6 Invitee")
  await page.locator('input[type="email"]').first().fill(EMAIL)
  const pws = page.locator('input[type="password"]')
  await pws.nth(0).fill(PW)
  if (await pws.count() > 1) await pws.nth(1).fill(PW)
  await page.getByRole("button", { name: /create account/i }).click()

  // success surface: "Check your email..."
  try {
    await page.getByText(/check your email/i).waitFor({ timeout: 20000 })
    console.log("SUCCESS surface: 'Check your email' shown")
  } catch {
    console.log("SUCCESS surface NOT found. Body snippet:", (await page.locator("body").innerText()).slice(0, 600))
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/signup-fixed-success-1280.png`, fullPage: true })
  console.log("post-submit url:", page.url())
  await ctx.close()
}

console.log("console errors:", errors.length ? JSON.stringify(errors, null, 2) : "none")
await browser.close()
