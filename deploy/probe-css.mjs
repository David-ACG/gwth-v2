import { chromium } from "playwright"
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}})
const sheets = []
p.on("response", r => { if (r.url().includes(".css")) sheets.push(r.url()) })
await p.goto("http://localhost:3000/lessons", {waitUntil:"load", timeout:90000})
let found = false
for (const u of sheets) {
  const t = await (await p.request.get(u)).text()
  if (t.includes("1.05fr")) { found = true; console.log("FOUND in", u) }
}
console.log("sheets:", sheets.length, "hasRule:", found)
await b.close()
