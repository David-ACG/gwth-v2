// W23 — Claude Design polish pass (pre-CIPD demo). Screenshot the demo path at
// 1440 and 390 in light + dark for the before/after packet. Auth cookies come
// from the Netscape jar written by deploy/w21-provision.sh.
// Usage: JAR=/tmp/w23-jar.txt PHASE=before node deploy/shot-w23.mjs
import { chromium } from "playwright"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const JAR = process.env.JAR || "/tmp/w23-jar.txt"
const PHASE = process.env.PHASE || "before"
const OUT = process.env.OUT || `completion/W23/${PHASE}`
mkdirSync(OUT, { recursive: true })

function jarCookies(path) {
  const cookies = []
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line || (line.startsWith("#") && !line.startsWith("#HttpOnly_"))) continue
    const f = line.replace(/^#HttpOnly_/, "").split("\t")
    if (f.length < 7) continue
    const [domain, , cookiePath, secure, expires, name, value] = f
    cookies.push({
      name, value,
      domain: domain.replace(/^\./, ""),
      path: cookiePath || "/",
      expires: Number(expires) || -1,
      httpOnly: false,
      secure: secure === "TRUE",
      sameSite: "Lax",
    })
  }
  return cookies
}

// name, path (all on the CIPD demo path)
const ROUTES = [
  ["home", "/"],
  ["login", "/login"],
  ["labs-public", "/labs"],
  ["pilot-lab", "/labs/job-advert-claude-vs-chatgpt"],
  ["dashboard", "/dashboard"],
  ["lesson", "/course/applied-ai-skills/lesson/welcome-to-gwth"],
  ["progress", "/progress"],
]

const WIDTHS = [
  ["1440", { width: 1440, height: 900 }],
  ["390", { width: 390, height: 844 }],
]

const report = []
const consoleErrors = []
const browser = await chromium.launch()

for (const scheme of ["light", "dark"]) {
  for (const [w, viewport] of WIDTHS) {
    const ctx = await browser.newContext({ viewport, colorScheme: scheme })
    await ctx.addCookies(jarCookies(JAR))
    await ctx.addInitScript((s) => {
      try { localStorage.setItem("theme", s) } catch {}
    }, scheme)
    const page = await ctx.newPage()
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[${scheme}/${w}] ${m.text()}`) })
    page.on("pageerror", (e) => consoleErrors.push(`[${scheme}/${w}] pageerror: ${e.message}`))

    for (const [name, path] of ROUTES) {
      let status = 0
      try {
        const resp = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 })
        status = resp ? resp.status() : 0
      } catch (e) {
        consoleErrors.push(`[${scheme}/${w}] goto ${path}: ${e.message}`)
      }
      await page.waitForTimeout(700)
      const file = `${OUT}/${name}-${scheme}-${w}.png`
      await page.screenshot({ path: file, fullPage: true })
      report.push({ name, path, scheme, w, status, file })
      console.log(`${name} ${scheme}/${w} [http ${status}] -> ${file}`)
    }
    await ctx.close()
  }
}
await browser.close()

writeFileSync(`${OUT}/shot-report.json`, JSON.stringify(report, null, 2))
console.log(`\n=== ${PHASE}: ${report.length} shots ===`)
console.log(`console errors: ${consoleErrors.length}`)
for (const e of consoleErrors) console.log("  " + e)
