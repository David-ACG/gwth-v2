// W7 — capture live :3001 /progress screenshots (desktop + mobile) for two
// real Better Auth users, proving per-user DB-backed progress renders after the
// force-dynamic fix. User A has a completed lesson (m1_l01, 90%); user B has
// none — the two shots together are the per-user isolation evidence.
//
// Cookies are loaded from the Netscape cookie jars written by the curl sign-in
// (env: A_JAR, B_JAR). OUT defaults to completion/W7.
import { chromium, devices } from "playwright"
import { mkdirSync, readFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const OUT = process.env.OUT || "completion/W7"
mkdirSync(OUT, { recursive: true })

/** Parse a Netscape cookie jar into Playwright cookie objects. */
function jarCookies(path) {
  const txt = readFileSync(path, "utf8")
  const cookies = []
  for (const line of txt.split("\n")) {
    if (!line || line.startsWith("#")) {
      // Netscape "#HttpOnly_" prefix lines are still cookies.
      if (!line.startsWith("#HttpOnly_")) continue
    }
    const clean = line.replace(/^#HttpOnly_/, "")
    const f = clean.split("\t")
    if (f.length < 7) continue
    const [domain, , cookiePath, secure, expires, name, value] = f
    cookies.push({
      name,
      value,
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

const users = [
  ["a", process.env.A_JAR],
  ["b", process.env.B_JAR],
].filter(([, jar]) => jar)

const browser = await chromium.launch()
for (const [uid, jar] of users) {
  const cookies = jarCookies(jar)
  for (const [vp, opts] of [
    ["desktop", { viewport: { width: 1280, height: 900 } }],
    ["mobile", devices["iPhone 13"]],
  ]) {
    const ctx = await browser.newContext(opts)
    await ctx.addCookies(cookies)
    const page = await ctx.newPage()
    const resp = await page.goto(BASE + "/progress", {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    await page.waitForTimeout(700)
    const file = `${OUT}/w7-progress-user${uid.toUpperCase()}-${vp}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log(`${file}  [http ${resp.status()}]`)
    await ctx.close()
  }
}
await browser.close()
