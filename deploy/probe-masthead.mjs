import { chromium } from "playwright"
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
await p.goto("http://localhost:3000/lessons", {waitUntil:"load", timeout:90000})
const info = await p.evaluate(() => {
  const sec = document.querySelector('[data-section="masthead"]')
  if (!sec) return {err:"no masthead section"}
  const inner = sec.firstElementChild
  return {
    sectionClass: sec.className,
    innerClass: inner?.className,
    innerDisplay: getComputedStyle(inner).display,
    cols: getComputedStyle(inner).gridTemplateColumns,
    kids: [...inner.children].map(c => c.className),
  }
})
console.log(JSON.stringify(info, null, 1)); await b.close()
