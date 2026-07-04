// W4 — verify the /admin dashboard on the live :3001 staging deploy and
// capture the completion-packet / sign-off screenshots.
//
// Checks: an admin sees the overview, roster, funnel and feedback panels
// (light + dark, 1440 desktop + 412 mobile, full page, zero console errors);
// a signed-in NON-admin is redirected off /admin; anonymous traffic is
// bounced to /login; the grant form round-trips a test email into the
// roster without a manual refresh; the /api/admin/* routes deny non-admins.
//
// Cookies come from Netscape jars written by the curl sign-ins (env:
// ADMIN_JAR, TESTER_JAR — same pattern as shot-w7.mjs). OUT defaults to
// completion/W4.
import { chromium } from "playwright"
import { mkdirSync, readFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const OUT = process.env.OUT || "completion/W4"
const ADMIN_JAR = process.env.ADMIN_JAR
const TESTER_JAR = process.env.TESTER_JAR
const FEEDBACK_ID = process.env.FEEDBACK_ID || ""
mkdirSync(OUT, { recursive: true })

let pass = 0
let fail = 0
const ok = (m) => { console.log(`  PASS: ${m}`); pass++ }
const bad = (m) => { console.log(`  FAIL: ${m}`); fail++ }

/** Parse a Netscape cookie jar into Playwright cookie objects. */
function jarCookies(path) {
  const txt = readFileSync(path, "utf8")
  const cookies = []
  for (const line of txt.split("\n")) {
    if (!line || line.startsWith("#")) {
      if (!line.startsWith("#HttpOnly_")) continue
    }
    const clean = line.replace(/^#HttpOnly_/, "")
    const f = clean.split("\t")
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

/** Cookie header string for raw fetch() API checks. */
function jarHeader(path) {
  return jarCookies(path).map((c) => `${c.name}=${c.value}`).join("; ")
}

const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 412, height: 915 }],
]
const PAGES = [
  ["overview", "/admin"],
  ["roster", "/admin/roster"],
  ["funnel", "/admin/funnel"],
  ["feedback", "/admin/feedback"],
]

const browser = await chromium.launch()

// ── 1. Admin sees all four panels; screenshots light+dark × desktop+mobile ──
for (const [mode, dark] of [["light", false], ["dark", true]]) {
  for (const [vp, viewport] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport, baseURL: BASE })
    await ctx.addCookies(jarCookies(ADMIN_JAR))
    if (dark) await ctx.addInitScript(() => localStorage.setItem("theme", "dark"))
    const page = await ctx.newPage()
    const consoleErrors = []
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text())
    })
    for (const [name, path] of PAGES) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
      if (!page.url().includes("/admin")) {
        bad(`admin was bounced off ${path} (${mode}/${vp}) -> ${page.url()}`)
        continue
      }
      await page.screenshot({ path: `${OUT}/admin-${name}-${vp}-${mode}.png`, fullPage: true })
    }
    if (consoleErrors.length === 0) ok(`no console errors (${mode}/${vp}, 4 pages)`)
    else bad(`console errors (${mode}/${vp}): ${consoleErrors.slice(0, 3).join(" | ")}`)
    await ctx.close()
  }
}

// Panel content sanity (desktop light, admin)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addCookies(jarCookies(ADMIN_JAR))
  const page = await ctx.newPage()

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  const cards = await page.locator('[data-section="cohort-health"] a').count()
  if (cards === 4) ok("overview: 4 metric cards")
  else bad(`overview: ${cards} metric cards`)

  await page.goto(`${BASE}/admin/roster`, { waitUntil: "networkidle" })
  const rosterRows = await page.locator('[data-section="roster"] tbody tr').count()
  if (rosterRows >= 5) ok(`roster: ${rosterRows} rows`)
  else bad(`roster: only ${rosterRows} rows`)
  const granted = await page.locator("text=✓ granted").count()
  if (granted >= 4) ok(`roster: ${granted} granted labels`)
  else bad(`roster: ${granted} granted labels`)

  await page.goto(`${BASE}/admin/funnel`, { waitUntil: "networkidle" })
  const funnelRows = await page.locator('[data-section="funnel"] tbody tr').count()
  if (funnelRows >= 3) ok(`funnel: ${funnelRows} granted testers`)
  else bad(`funnel: ${funnelRows} rows`)
  if ((await page.locator("text=● stalled").count()) >= 1)
    ok("funnel: stalled tester surfaced")
  else bad("funnel: no stalled label found")

  await page.goto(`${BASE}/admin/feedback`, { waitUntil: "networkidle" })
  const items = await page.locator('[data-section="inbox-list"] li').count()
  if (items >= 2) ok(`feedback: ${items} inbox items`)
  else bad(`feedback: ${items} items`)

  // ── 2. Grant round-trip: form → toast → roster shows the new state ──
  await page.goto(`${BASE}/admin/roster`, { waitUntil: "networkidle" })
  await page.fill("#grant-email", "w4-grant-target@example.com")
  await page.uncheck("#grant-invite")
  await page.click('[data-section="grant-form"] button[type="submit"]')
  try {
    await page.waitForSelector("text=Granted month", { timeout: 15000 })
    ok("grant: success toast shown")
  } catch {
    bad("grant: no success toast")
  }
  try {
    await page.waitForSelector("text=w4-grant-target@example.com", { timeout: 15000 })
    ok("grant: roster shows the new grant without manual refresh")
  } catch {
    bad("grant: roster did not update")
  }
  await page.screenshot({ path: `${OUT}/admin-grant-roundtrip.png`, fullPage: true })
  await ctx.close()
}

// ── 3. Signed-in NON-admin is redirected off /admin ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addCookies(jarCookies(TESTER_JAR))
  const page = await ctx.newPage()
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  if (page.url().includes("/dashboard"))
    ok(`non-admin redirected to ${new URL(page.url()).pathname}`)
  else bad(`non-admin NOT redirected (at ${page.url()})`)
  await page.screenshot({ path: `${OUT}/admin-nonadmin-redirect.png`, fullPage: false })
  await ctx.close()
}

// ── 4. Anonymous traffic bounced to /login ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
  if (page.url().includes("/login")) ok("anonymous /admin -> /login")
  else bad(`anonymous /admin NOT bounced (at ${page.url()})`)
  await ctx.close()
}

// ── 5. API gate parity (a UI gate alone is not security) ──
{
  const anon = await fetch(`${BASE}/api/admin/feedback`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: FEEDBACK_ID, read: true }),
  })
  if (anon.status === 401) ok("API: anonymous PATCH feedback -> 401")
  else bad(`API: anon -> ${anon.status}`)

  const tester = await fetch(`${BASE}/api/admin/feedback`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: jarHeader(TESTER_JAR) },
    body: JSON.stringify({ id: FEEDBACK_ID, read: true }),
  })
  if (tester.status === 401) ok("API: non-admin PATCH feedback -> 401")
  else bad(`API: tester -> ${tester.status}`)

  const anonGrant = await fetch(`${BASE}/api/admin/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "x@y.com", months: 3, sendInvite: false }),
  })
  if (anonGrant.status === 401) ok("API: anonymous POST grant -> 401")
  else bad(`API: anon grant -> ${anonGrant.status}`)

  if (FEEDBACK_ID) {
    const admin = await fetch(`${BASE}/api/admin/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: jarHeader(ADMIN_JAR) },
      body: JSON.stringify({ id: FEEDBACK_ID, read: true }),
    })
    if (admin.status === 200) ok("API: admin PATCH feedback -> 200")
    else bad(`API: admin -> ${admin.status}`)
  }
}

await browser.close()
console.log(`\nW4 verify: ${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
