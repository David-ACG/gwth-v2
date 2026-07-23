// W21 — pre-CIPD-demo visual polish sweep. Screenshot every student-facing
// route at 1440 and 390 in light + dark, and PROGRAMMATICALLY measure
// horizontal overflow (document.scrollWidth vs viewport) + name the widest
// offending elements. The overflow report is the sg6 reproduction/regression
// signal; the screenshots feed the before/after packet grid.
//
// Auth cookies come from the Netscape jar written by deploy/w21-provision.sh.
// Usage: JAR=/tmp/w21-jar.txt PHASE=before node deploy/shot-w21.mjs
import { chromium } from "playwright"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const JAR = process.env.JAR || "/tmp/w21-jar.txt"
const PHASE = process.env.PHASE || "before"
const OUT = process.env.OUT || `completion/W21/${PHASE}`
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

// name, path, needsAuth
const ROUTES = [
  ["home", "/", false],
  ["login", "/login", false],
  ["waitlist", "/waitlist", false],
  ["pricing", "/pricing", false],
  ["labs-public", "/labs", false],
  ["dashboard", "/dashboard", true],
  ["course", "/course/applied-ai-skills", true],
  ["lesson", "/course/applied-ai-skills/lesson/welcome-to-gwth", true],
  ["lesson-agents", "/course/applied-ai-skills/lesson/ai-agents-intro", true],
  ["progress", "/progress", true],
  ["lab-detail", "/labs/the-prompt-ladder", true],
]

const WIDTHS = [
  ["1440", { width: 1440, height: 900 }],
  ["390", { width: 390, height: 844 }],
]

/** Measure horizontal overflow + name the widest elements crossing the viewport. */
function MEASURE() {
  const de = document.documentElement
  const vw = de.clientWidth
  const scrollW = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0)
  const offenders = []
  if (scrollW > vw + 1) {
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect()
      if (r.right > vw + 1 && r.width > 8 && r.height > 4) {
        const cls = (typeof el.className === "string" ? el.className : "").slice(0, 60)
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls,
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.textContent || "").trim().slice(0, 40),
        })
      }
    }
    offenders.sort((a, b) => b.right - a.right)
  }
  return { vw, scrollW, overflow: scrollW - vw, offenders: offenders.slice(0, 6) }
}

const report = []
const consoleErrors = []
const browser = await chromium.launch()

for (const scheme of ["light", "dark"]) {
  for (const [w, viewport] of WIDTHS) {
    const ctx = await browser.newContext({ viewport, colorScheme: scheme })
    await ctx.addCookies(jarCookies(JAR))
    // next-themes: force the theme via localStorage before any script runs.
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
      const m = await page.evaluate(MEASURE)
      const file = `${OUT}/${name}-${scheme}-${w}.png`
      await page.screenshot({ path: file, fullPage: true })
      const flag = m.overflow > 1 ? `  OVERFLOW +${m.overflow}px` : ""
      report.push({ name, path, scheme, w, status, ...m, file })
      console.log(`${name} ${scheme}/${w} [http ${status}] scrollW=${m.scrollW} vw=${m.vw}${flag}`)
      if (m.overflow > 1) {
        for (const o of m.offenders) console.log(`      -> ${o.tag}.${o.cls}  right=${o.right} w=${o.width}  "${o.text}"`)
      }
    }
    await ctx.close()
  }
}
await browser.close()

writeFileSync(`${OUT}/overflow-report.json`, JSON.stringify(report, null, 2))
const overflows = report.filter((r) => r.overflow > 1)
console.log(`\n=== OVERFLOW SUMMARY (${overflows.length} route/mode/width combos) ===`)
for (const r of overflows) console.log(`  ${r.name} ${r.scheme}/${r.w}: +${r.overflow}px`)
console.log(`\nconsole errors: ${consoleErrors.length}`)
for (const e of consoleErrors) console.log("  " + e)
