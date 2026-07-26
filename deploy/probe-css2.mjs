import { chromium } from "playwright"
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
await p.goto("http://localhost:3000/lessons", {waitUntil:"load", timeout:90000})
const out = await p.evaluate(() => {
  const res = []
  for (const s of document.styleSheets) {
    let rules; try { rules = s.cssRules } catch { continue }
    for (const r of rules) {
      const txt = r.cssText || ""
      if (txt.includes("1.05fr")) res.push({href: s.href, media: r.media?.mediaText, matches: r.media ? matchMedia(r.media.mediaText).matches : null, text: txt.slice(0, 220)})
    }
  }
  return {res, rootFont: getComputedStyle(document.documentElement).fontSize, width: innerWidth}
})
console.log(JSON.stringify(out, null, 1).slice(0, 1500)); await b.close()
