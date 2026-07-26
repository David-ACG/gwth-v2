import { chromium } from "playwright"
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
await p.goto("http://localhost:3000/", {waitUntil:"load", timeout:90000})
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}})
await p.waitForTimeout(2500)
const info = await p.evaluate(() => {
  const sec = document.querySelector('[data-section="curriculum"]')
  const img = sec?.querySelector("img")
  return img ? {src: img.currentSrc?.slice(0,120), natural: img.naturalWidth, complete: img.complete,
                rect: img.getBoundingClientRect().width, loading: img.loading} : {err:"no img"}
})
console.log(JSON.stringify(info)); await b.close()
