// W23 — variation previews for W24 (build, do NOT apply). Renders three-up
// options per design direction question as REAL screenshots of the same pages
// (home hero + journeys grid, lesson viewer) with each treatment applied at
// runtime. Treatments are pure CSS-var / font overrides (equivalent to a
// throwaway-branch diff); nothing here touches app source, master or prod.
// Option A is ALWAYS the current UI (no override).
//
// Usage: JAR=/tmp/w23-jar.txt node deploy/shot-w23-variations.mjs
import { chromium } from "playwright"
import { mkdirSync, writeFileSync, readFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const JAR = process.env.JAR || "/tmp/w23-jar.txt"
const OUT = process.env.OUT || "completion/W23/variations"
mkdirSync(OUT, { recursive: true })

function jarCookies(path) {
  const cookies = []
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line || (line.startsWith("#") && !line.startsWith("#HttpOnly_"))) continue
    const f = line.replace(/^#HttpOnly_/, "").split("\t")
    if (f.length < 7) continue
    const [domain, , cookiePath, secure, expires, name, value] = f
    cookies.push({
      name, value, domain: domain.replace(/^\./, ""), path: cookiePath || "/",
      expires: Number(expires) || -1, httpOnly: false, secure: secure === "TRUE", sameSite: "Lax",
    })
  }
  return cookies
}

// Pages to render each treatment against.
const PAGES = [
  { id: "home", path: "/", vh: 4620 },
  { id: "lesson", path: "/course/applied-ai-skills/lesson/welcome-to-gwth", vh: 1750 },
]

// Clip region per direction question so each three-up frames its own evidence:
// typeface -> hero + body copy; palette -> the teal/moss/rust journey card grid;
// imagery -> the full image run. {y, h} in page pixels; x=0, width=1440.
const REGION = {
  typeface: { home: { y: 0, h: 1560 }, lesson: { y: 0, h: 1700 } },
  palette:  { home: { y: 2380, h: 2180 }, lesson: { y: 0, h: 1700 } },
  imagery:  { home: { y: 0, h: 4560 }, lesson: { y: 0, h: 1700 } },
}

// Treatments. group = the direction question; A is always current (empty spec).
// vars: inline --v-* overrides on every FDE shell. bodyFont: sans stack applied
// to shell (headings forced back to serif). font: {family, href} google webfont.
const TREATMENTS = [
  // Q1 — body / non-heading typeface (headings stay Source Serif 4)
  { group: "typeface", id: "typ-a", label: "A · Current (serif body + serif headings)", spec: {} },
  { group: "typeface", id: "typ-b", label: "B · Sans body (Inter) + serif headings",
    spec: { bodyFont: "'InterVar','Inter',ui-sans-serif,system-ui,sans-serif",
      font: { family: "Inter:wght@400;500;600", css: "Inter" } } },
  { group: "typeface", id: "typ-c", label: "C · Source Sans 3 body + serif headings",
    spec: { bodyFont: "'Source Sans 3',ui-sans-serif,system-ui,sans-serif",
      font: { family: "Source+Sans+3:wght@400;500;600", css: "Source Sans 3" } } },

  // Q2 — palette: separate the too-alike dark teal and moss
  { group: "palette", id: "pal-a", label: "A · Current (teal #2c4a47 + moss #2a4530)", spec: {} },
  { group: "palette", id: "pal-b", label: "B · Hue-shift (bluer teal + leaf-green moss)",
    spec: { vars: { "--v-teal": "#1f4c55", "--v-teal-deep": "#153a41", "--v-action": "#1f4c55", "--v-dash-active": "#1f4c55", "--v-moss": "#3c6b41" } } },
  { group: "palette", id: "pal-c", label: "C · Replacement accent (teal kept, moss to indigo)",
    spec: { vars: { "--v-moss": "#39406a" } } },

  // Q3 (from audit) — homepage imagery density
  { group: "imagery", id: "img-a", label: "A · Current (five cutout plates)", spec: {} },
  { group: "imagery", id: "img-b", label: "B · One lead image, rest typographic", spec: { hideFigures: "allButFirst" } },
  { group: "imagery", id: "img-c", label: "C · Image-light (typography + hairlines only)", spec: { hideFigures: "all" } },
]

function applySpec(spec) {
  // runs in the page. Finds every element that DECLARES --v-teal (an FDE shell)
  // and applies inline overrides so it beats the hashed CSS-module rule.
  const shells = []
  for (const el of document.querySelectorAll("*")) {
    const v = getComputedStyle(el).getPropertyValue("--v-teal").trim()
    if (!v) continue
    const pv = el.parentElement ? getComputedStyle(el.parentElement).getPropertyValue("--v-teal").trim() : ""
    if (v !== pv) shells.push(el)
  }
  for (const el of shells) {
    if (spec.vars) for (const [k, val] of Object.entries(spec.vars)) el.style.setProperty(k, val)
    if (spec.bodyFont) el.style.fontFamily = spec.bodyFont
  }
  if (spec.bodyFont) {
    const st = document.createElement("style")
    // keep every heading + display + quote element in the serif voice
    st.textContent = "h1,h2,h3,h4,h5,blockquote,summary{font-family:var(--font-source-serif),Georgia,serif !important;}"
    document.head.appendChild(st)
  }
  if (spec.hideFigures) {
    const figs = Array.from(document.querySelectorAll("figure"))
    figs.forEach((f, i) => {
      if (spec.hideFigures === "all" || (spec.hideFigures === "allButFirst" && i > 0)) f.style.display = "none"
    })
  }
  return shells.length
}

const report = []
const browser = await chromium.launch()
for (const t of TREATMENTS) {
  for (const pg of PAGES) {
    // bypassCSP so the preview can pull a Google webfont (allowed for the
    // throwaway variation render only; never shipped). Tall viewport makes all
    // next/image lazy plates load (no empty-box artefact).
    const ctx = await browser.newContext({ viewport: { width: 1440, height: pg.vh }, colorScheme: "light", bypassCSP: true })
    await ctx.addCookies(jarCookies(JAR))
    await ctx.addInitScript(() => { try { localStorage.setItem("theme", "light") } catch {} })
    const page = await ctx.newPage()
    await page.goto(BASE + pg.path, { waitUntil: "networkidle", timeout: 45000 })
    if (t.spec.font) {
      try {
        await page.addStyleTag({ url: `https://fonts.googleapis.com/css2?family=${t.spec.font.family}&display=swap` })
        await page.evaluate((fam) => document.fonts.load(`600 1rem '${fam}'`).then(() => document.fonts.ready), t.spec.font.css)
        await page.waitForTimeout(500)
      } catch (e) { console.log(`  font load failed for ${t.id}: ${e.message}`) }
    }
    const n = await page.evaluate(applySpec, t.spec)
    // wait for every in-viewport image to finish decoding
    await page.evaluate(() => Promise.all(Array.from(document.images).map((im) => im.complete ? null : im.decode().catch(() => {}))))
    await page.waitForTimeout(600)
    const region = REGION[t.group][pg.id]
    const file = `${OUT}/${t.id}-${pg.id}.png`
    await page.screenshot({ path: file, clip: { x: 0, y: region.y, width: 1440, height: region.h } })
    report.push({ group: t.group, id: t.id, page: pg.id, file, shells: n })
    console.log(`${t.id} ${pg.id} shells=${n} -> ${file}`)
    await ctx.close()
  }
}
await browser.close()
writeFileSync(`${OUT}/variations-report.json`, JSON.stringify(report, null, 2))
console.log(`\n=== ${report.length} variation shots ===`)
