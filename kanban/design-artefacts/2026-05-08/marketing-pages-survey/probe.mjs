/** Debug probe: is .dark applied on /pricing and does the nav respond? */
import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addCookies([{ name: "site_access", value: "granted", domain: "localhost", path: "/" }])
const page = await ctx.newPage()
for (const route of ["/pricing", "/about", "/for-teams"]) {
  await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" })
  await page.evaluate(() => {
    localStorage.setItem("theme", "dark")
    document.documentElement.classList.add("dark")
  })
  await page.waitForTimeout(800)
  const info = await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    nav: document.querySelector("header, nav")
      ? getComputedStyle(document.querySelector("header, nav")).backgroundColor
      : "none",
    main: document.querySelector("main")
      ? getComputedStyle(document.querySelector("main")).backgroundColor
      : "none",
  }))
  console.log(route, JSON.stringify(info))
}
await browser.close()
