import { chromium } from "playwright"
const OUT = "/tmp/claude-1000/-home-david-projects-GWTH-launch-plan/7f6e0ac1-d9ae-4001-a19f-3bf5a0f1d05d/scratchpad/after"
import { mkdir } from "node:fs/promises"
await mkdir(OUT, { recursive: true })
const b = await chromium.launch()
async function settle(p){ await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}window.scrollTo(0,0)}); await p.waitForTimeout(1800) }
for (const slug of ["lessons","for-teams","pricing","labs"]) {
  const p = await b.newPage({ viewport:{width:1440,height:900} })
  await p.goto(`http://localhost:3000/${slug}`, {waitUntil:"load", timeout:90000})
  await p.waitForTimeout(1500)
  await p.screenshot({path:`${OUT}/${slug}-1440.png`})
  await p.close()
}
const p = await b.newPage({ viewport:{width:1440,height:900} })
await p.goto("http://localhost:3000/", {waitUntil:"load", timeout:90000})
await settle(p)
await p.evaluate(() => document.querySelector('[data-section="curriculum"]').scrollIntoView({block:"start"}))
await p.waitForTimeout(2500)
const sec = await p.$('[data-section="curriculum"]')
await sec.screenshot({path:`${OUT}/home-curriculum.png`})
await p.close(); await b.close(); console.log("shots done")
