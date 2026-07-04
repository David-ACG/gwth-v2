// Quick font probe + screenshots for /, /redesign_v2, /logo_picker
import { chromium } from "playwright"
import { mkdirSync } from "fs"
import { join } from "path"

const OUT = "C:/Projects/GWTH_V2/kanban/design-artefacts/2026-05-08/homepage-match/after-fonts"
mkdirSync(OUT, { recursive: true })

const BASE = "http://localhost:3000"
const COOKIE = {
  name: "site_access",
  value: "granted",
  domain: "localhost",
  path: "/",
  expires: Math.floor(Date.now() / 1000) + 86400,
}

async function probe(page, label) {
  const result = await page.evaluate(() => {
    const body = getComputedStyle(document.body)
    const h1 = document.querySelector("h1")
    const h1c = h1 ? getComputedStyle(h1) : null
    return {
      bodyFamily: body.fontFamily,
      bodyVarSans: getComputedStyle(document.documentElement).getPropertyValue("--font-sans"),
      bodyVarSerif: getComputedStyle(document.documentElement).getPropertyValue("--font-serif"),
      h1Text: h1 ? h1.innerText.slice(0, 80) : null,
      h1Family: h1c ? h1c.fontFamily : null,
      h1Weight: h1c ? h1c.fontWeight : null,
    }
  })
  console.log(`\n[${label}]`)
  console.log("  body font-family:", result.bodyFamily)
  console.log("  --font-sans (root):", result.bodyVarSans?.trim())
  console.log("  --font-serif (root):", result.bodyVarSerif?.trim())
  console.log("  h1 text:", JSON.stringify(result.h1Text))
  console.log("  h1 font-family:", result.h1Family)
  console.log("  h1 font-weight:", result.h1Weight)
  return result
}

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addCookies([COOKIE])

  // Light mode probes + screenshots
  async function scrollAll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0
        const step = window.innerHeight / 2
        const max = document.documentElement.scrollHeight
        const id = setInterval(() => {
          y += step
          window.scrollTo(0, y)
          if (y >= max) { clearInterval(id); resolve() }
        }, 100)
      })
    })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
  }

  for (const [route, file, label] of [
    ["/", "home-light.png", "/ (light)"],
    ["/redesign_v2", "redesign_v2-light.png", "/redesign_v2 (light)"],
    ["/logo_picker", "logo_picker-light.png", "/logo_picker (light)"],
  ]) {
    const page = await ctx.newPage()
    await page.goto(BASE + route, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    await probe(page, label)
    await scrollAll(page)
    await page.screenshot({ path: join(OUT, file), fullPage: true })
    console.log("  saved:", file)
    await page.close()
  }

  // Dark mode for / only
  const page = await ctx.newPage()
  await page.goto(BASE + "/", { waitUntil: "networkidle" })
  await page.evaluate(() => {
    document.documentElement.classList.add("dark")
    try { localStorage.setItem("theme", "dark") } catch {}
  })
  await page.waitForTimeout(400)
  await probe(page, "/ (dark)")
  await scrollAll(page)
  await page.screenshot({ path: join(OUT, "home-dark.png"), fullPage: true })
  console.log("  saved: home-dark.png")
  await page.close()
} finally {
  await browser.close()
}
