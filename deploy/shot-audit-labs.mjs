import { chromium } from "playwright"
const OUT = "completion/audit-layout/app"
const BASE = "http://localhost:3000"
const browser = await chromium.launch()
for (const [wname, width, height] of [["1440",1440,900],["390",390,844]]) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  const r = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: "local-check@example.com", password: "Rafiki123" },
  })
  if (!r.ok()) throw new Error("signin " + r.status())
  for (const [name, path] of [["labs","/labs"],["lab-detail","/labs/job-advert-claude-vs-chatgpt"]]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 })
    await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,100))}window.scrollTo(0,0)})
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `${OUT}/${name}-${wname}-fold.png` })
    await page.screenshot({ path: `${OUT}/${name}-${wname}-full.png`, fullPage: true })
    console.log(name, wname, page.url())
  }
  await ctx.close()
}
await browser.close()
