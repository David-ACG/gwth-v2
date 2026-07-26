import { chromium } from "playwright"
const LOCAL="http://localhost:3000"
const LESSON="/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}}); const p=await ctx.newPage()
await p.request.post(`${LOCAL}/api/auth/sign-in/email`,{headers:{"Content-Type":"application/json"},data:{email:"local-check@example.com",password:"Rafiki123"}})
await p.goto(`${LOCAL}${LESSON}`,{waitUntil:"load",timeout:90000}); await p.waitForTimeout(2000)
await p.getByRole("button",{name:/continue|next/i}).first().click(); await p.waitForTimeout(2000)
const out = await p.evaluate(() => {
  const el = [...document.querySelectorAll('[class*="proseBody"]')][0]
  const sidebarBtn = document.querySelector('[aria-label*="sidebar" i]')?.getAttribute("aria-label")
  if (!el) return {err:"no proseBody", sidebarBtn}
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
  const p1 = el.querySelector("p")
  return { cls: el.className, x: Math.round(r.left), w: Math.round(r.width),
           maxW: cs.maxWidth, fs: cs.fontSize, pFs: p1 ? getComputedStyle(p1).fontSize : null,
           marginInline: cs.marginLeft + "/" + cs.marginRight, sidebarBtn }
})
console.log(JSON.stringify(out,null,1)); await b.close()
