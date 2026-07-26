import { chromium } from "playwright"

/**
 * L26 evidence shots: the /labs landing with four live Model Arena labs, and
 * the three new head-to-head detail pages, at desktop (1440) and phone (390).
 */
const OUT = "completion/L26/shots"
const BASE = process.env.BASE ?? "http://localhost:3000"

const PAGES = [
  ["labs", "/labs"],
  ["lab-02-spreadsheet", "/labs/messy-spreadsheet-claude-vs-chatgpt"],
  ["lab-03-citations", "/labs/cite-your-sources-claude-vs-chatgpt"],
  ["lab-04-automation", "/labs/automate-a-weekly-chore-claude-vs-chatgpt"],
]

const browser = await chromium.launch()

for (const [wname, width, height] of [
  ["1440", 1440, 900],
  ["390", 390, 844],
]) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()

  // The /labs subtree sits behind the content gate while private mode is on,
  // so sign in first. With PRIVATE_CONTENT_MODE=off this is a no-op.
  const signIn = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: "local-check@example.com", password: "Rafiki123" },
  })
  if (!signIn.ok()) console.warn("sign-in returned", signIn.status())

  for (const [name, path] of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 })
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/${name}-${wname}-fold.png` })
    await page.screenshot({
      path: `${OUT}/${name}-${wname}-full.png`,
      fullPage: true,
    })
    const heading = await page.locator("h1").first().innerText()
    console.log(wname, name, page.url(), "|", heading.replace(/\n/g, " "))
  }

  await ctx.close()
}

await browser.close()
