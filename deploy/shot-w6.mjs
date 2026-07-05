// W6 go-live pre-flight — full adversarial sweep against the :3001 staging
// build (merged master). Produces screenshots + a JSON verdict; every claim in
// the runbook's manual section is reproduced here, in this run.
//
// Phases (env PHASE):
//   sweep    — console-error + screenshot sweep of the 7 runbook pages at
//              1280/412, light + dark, plus W8 cut checks (no checkout CTA, no
//              score widget) and honest-zero markers for the fresh account.
//   media    — the item-5 round-trip: UI login, real video plays + seek past
//              80%, real audio plays, quiz passed via UI clicks, Finish clicked,
//              UI sign-out, UI re-login, completion visible on /progress.
//
// Usage: FRESH_EMAIL=... FRESH_PW=... ADMIN_EMAIL=... ADMIN_PW=... \
//        ANSWERS='[0,2,...]' LESSON_PATH=/course/x/lesson/y LAB_PATH=/labs/z \
//        PHASE=sweep node deploy/shot-w6.mjs
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const OUT = process.env.OUT || "completion/W6"
const PHASE = process.env.PHASE || "sweep"
const FRESH_EMAIL = process.env.FRESH_EMAIL
const FRESH_PW = process.env.FRESH_PW
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PW = process.env.ADMIN_PW
const LESSON_PATH = process.env.LESSON_PATH
const LAB_PATH = process.env.LAB_PATH || "/labs/build-your-prompt-cheat-sheet"
const ANSWERS = JSON.parse(process.env.ANSWERS || "[]")
mkdirSync(OUT, { recursive: true })

const results = { phase: PHASE, base: BASE, at: new Date().toISOString(), pages: {}, checks: [], consoleErrors: {} }
let failures = 0
function check(name, ok, detail = "") {
  results.checks.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`)
  if (!ok) failures++
}

/** Ignore-list for console noise that is not an app defect. */
const IGNORE = [
  /Failed to load resource.*favicon/i,
  /Download the React DevTools/i,
]
function trackConsole(page, key) {
  results.consoleErrors[key] = results.consoleErrors[key] || []
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.some((r) => r.test(m.text())))
      results.consoleErrors[key].push(m.text().slice(0, 300))
  })
  page.on("pageerror", (e) => results.consoleErrors[key].push("pageerror: " + String(e).slice(0, 300)))
}

async function uiLogin(page, email, pw) {
  await page.goto(`${BASE}/login`, { waitUntil: "load" })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', pw)
  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ])
}

async function shoot(page, path, slug, { theme, width }) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(700)
  const file = `${OUT}/${slug}-${theme}-${width}.png`
  await page.screenshot({ path: file, fullPage: width === 1280 })
  return file
}

const browser = await chromium.launch()

if (PHASE === "sweep") {
  // ---- pages, viewports, themes -------------------------------------------
  const PAGES = [
    { path: "/", slug: "home", auth: "anon" },
    { path: "/login", slug: "login", auth: "anon" },
    { path: "/dashboard", slug: "dashboard", auth: "fresh" },
    { path: LESSON_PATH, slug: "lesson", auth: "fresh" },
    { path: LAB_PATH, slug: "lab", auth: "fresh" },
    { path: "/guide", slug: "guide", auth: "fresh" },
    { path: "/admin", slug: "admin", auth: "admin" },
    { path: "/progress", slug: "progress", auth: "fresh" },
  ]
  for (const theme of ["light", "dark"]) {
    for (const width of [1280, 412]) {
      // ISOLATED context per auth level — cookies must never bleed between the
      // anon, fresh and admin sessions (a shared context lets the second login
      // overwrite the first session's cookie).
      const vp = { viewport: { width, height: width === 412 ? 915 : 800 } }
      const ctxs = { anon: await browser.newContext(vp), fresh: await browser.newContext(vp), admin: await browser.newContext(vp) }
      for (const c of Object.values(ctxs)) await c.addInitScript((t) => localStorage.setItem("theme", t), theme)
      const pages = { anon: await ctxs.anon.newPage(), fresh: await ctxs.fresh.newPage(), admin: await ctxs.admin.newPage() }
      await uiLogin(pages.fresh, FRESH_EMAIL, FRESH_PW)
      await uiLogin(pages.admin, ADMIN_EMAIL, ADMIN_PW)
      const ctx = { close: async () => { for (const c of Object.values(ctxs)) await c.close() } }
      for (const p of PAGES) {
        const key = `${p.slug}-${theme}-${width}`
        const pg = pages[p.auth]
        trackConsole(pg, key)
        const file = await shoot(pg, p.path, p.slug, { theme, width })
        results.pages[key] = file
        const body = await pg.content()
        if (p.slug === "home" || p.slug === "dashboard" || p.slug === "lesson") {
          check(`${key}: no checkout CTA`, !/checkout|buy now|subscribe now/i.test(body.replace(/<script[\s\S]*?<\/script>/g, "")))
          check(`${key}: no GWTH Score widget`, !/GWTH Score/i.test(body.replace(/<script[\s\S]*?<\/script>/g, "")))
        }
        if (p.slug === "dashboard" && theme === "light" && width === 1280) {
          check("fresh dashboard honest zeros", /Not started yet/.test(body) && !/Held for 5 days|12 \/ 24/.test(body),
            "expects 'Not started yet', no 5-day streak, no 12/24")
          check("fresh dashboard greets the FRESH session (not mock/admin)", /W6 Fresh|Welcome, W6/i.test(body),
            "session identity must be the fresh account")
        }
        if (p.slug === "progress" && theme === "light" && width === 1280) {
          check("fresh /progress honest zeros", /0 days|No progress yet/.test(body) && !/5 day streak|12 of 24/.test(body))
        }
      }
      // signup invite copy present (light/1280 only)
      if (theme === "light" && width === 1280) {
        const s = pages.anon
        await s.goto(`${BASE}/signup`, { waitUntil: "load" })
        const sb = await s.content()
        check("signup page shows invite-only copy", /invite/i.test(sb))
        results.pages["signup-light-1280"] = `${OUT}/signup-light-1280.png`
        await s.screenshot({ path: results.pages["signup-light-1280"], fullPage: true })
        // 7c: OAuth buttons hidden when provider creds unset (staging has none)
        const oauthButtons = await s.locator('button:has-text("Google"), button:has-text("GitHub"), button:has-text("LinkedIn")').count()
        const l = pages.anon
        await l.goto(`${BASE}/login`, { waitUntil: "load" })
        const oauthLogin = await l.locator('button:has-text("Google"), button:has-text("GitHub"), button:has-text("LinkedIn")').count()
        check("7c: OAuth buttons hidden with creds unset", oauthButtons === 0 && oauthLogin === 0, `signup=${oauthButtons} login=${oauthLogin}`)
      }
      await ctx.close()
    }
  }
  // console error verdict
  const withErrors = Object.entries(results.consoleErrors).filter(([, v]) => v.length)
  check("no console errors on any swept page", withErrors.length === 0,
    withErrors.map(([k, v]) => `${k}: ${v[0]}`).join(" | ").slice(0, 500))
}

if (PHASE === "media") {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  trackConsole(page, "media-roundtrip")

  await uiLogin(page, FRESH_EMAIL, FRESH_PW)
  check("UI login reached /dashboard", page.url().includes("dashboard"))

  // ---- real video playback + 80% watch (item 5) ---------------------------
  await page.goto(`${BASE}${LESSON_PATH}?surface=video`, { waitUntil: "networkidle" })
  await page.waitForSelector("video", { timeout: 20000 })
  await page.evaluate(() => document.querySelector("video")?.play())
  await page.waitForTimeout(2500)
  let vt = await page.evaluate(() => document.querySelector("video")?.currentTime || 0)
  check("intro video PLAYS (currentTime advances)", vt > 0.5, `currentTime=${vt.toFixed(2)}s`)
  await page.screenshot({ path: `${OUT}/lesson-video-playing-1280.png` })
  // seek past the 80% completion threshold and let timeupdate fire
  await page.evaluate(() => {
    const v = document.querySelector("video")
    v.currentTime = Math.max(0, v.duration * 0.92)
    return v.play()
  })
  await page.waitForTimeout(3000)
  const prog = await page.evaluate(() => {
    const v = document.querySelector("video")
    return { t: v.currentTime, d: v.duration }
  })
  check("intro video watched past 80%", prog.t / prog.d >= 0.8, `${prog.t.toFixed(1)}/${prog.d.toFixed(1)}s`)

  // ---- real audio narration plays ------------------------------------------
  await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "networkidle" })
  await page.waitForSelector("audio", { state: "attached", timeout: 20000 })
  const playBtn = page.locator('button[aria-label*="Play" i], button[aria-label*="play" i]').first()
  if (await playBtn.count()) await playBtn.click()
  else await page.evaluate(() => document.querySelector("audio")?.play())
  await page.waitForTimeout(2500)
  const at = await page.evaluate(() => document.querySelector("audio")?.currentTime || 0)
  check("lesson audio PLAYS (currentTime advances)", at > 0.5, `currentTime=${at.toFixed(2)}s`)
  await page.screenshot({ path: `${OUT}/lesson-audio-playing-1280.png` })

  // ---- pass the Q&A through real clicks ------------------------------------
  await page.goto(`${BASE}${LESSON_PATH}?surface=qa`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  // Each answer row is a <button aria-pressed>; questions render in order with
  // OPT_COUNT options each, so the flat index of question i's answer a is
  // i * OPT_COUNT + a.
  const OPT_COUNT = Number(process.env.OPT_COUNT || 4)
  const optionRows = page.locator("button[aria-pressed]")
  const rowCount = await optionRows.count()
  let clicked = 0
  for (let i = 0; i < ANSWERS.length; i++) {
    const idx = i * OPT_COUNT + ANSWERS[i]
    if (idx < rowCount) {
      await optionRows.nth(idx).click()
      clicked++
    }
  }
  check("qa: clicked one option per question", clicked === ANSWERS.length, `${clicked}/${ANSWERS.length} (rows=${rowCount})`)
  const submit = page.locator('button:has-text("Submit")').first()
  if (await submit.count()) await submit.click()
  await page.waitForTimeout(1200)
  const qaBody = await page.content()
  const passed = /100|passed|correct/i.test(qaBody)
  check("qa: submitted and passed", passed)
  await page.screenshot({ path: `${OUT}/lesson-qa-submitted-1280.png` })

  // ---- finish the lesson ----------------------------------------------------
  const finish = page.locator('button:has-text("Finish")').first()
  if (await finish.count()) {
    await finish.click()
    await page.waitForTimeout(1500)
  }
  const doneBody = await page.content()
  check("lesson-complete surface shown", /complete/i.test(doneBody))
  await page.screenshot({ path: `${OUT}/lesson-complete-1280.png` })

  // ---- sign out via UI ------------------------------------------------------
  let uiSignout = false
  for (const sel of ['button:has-text("Sign out")', 'text=Sign out']) {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.click().catch(() => {}); uiSignout = true; break }
  }
  if (!uiSignout) {
    // the control may hide behind the user menu
    const menu = page.locator('button[aria-label*="menu" i], button[aria-label*="account" i], header button').last()
    await menu.click().catch(() => {})
    const so = page.locator('text=Sign out').first()
    if (await so.count()) { await so.click(); uiSignout = true }
  }
  await page.waitForTimeout(1500)
  check("signed out via UI control", uiSignout)

  // ---- log back in, verify persistence --------------------------------------
  await uiLogin(page, FRESH_EMAIL, FRESH_PW)
  await page.goto(`${BASE}/progress`, { waitUntil: "networkidle" })
  await page.waitForTimeout(700)
  const pb = await page.content()
  check("after re-login /progress shows the completion", /1 (of|\/) 26|1 lesson/i.test(pb),
    "expects 1 completed lesson reflected")
  await page.screenshot({ path: `${OUT}/progress-after-relogin-1280.png`, fullPage: true })
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" })
  const db = await page.content()
  check("dashboard streak started after completion", /1 day|day streak|1 \/ 26/i.test(db))
  await page.screenshot({ path: `${OUT}/dashboard-after-relogin-1280.png`, fullPage: true })

  const errs = results.consoleErrors["media-roundtrip"] || []
  check("no console errors during round-trip", errs.length === 0, errs[0] || "")
  await ctx.close()
}

await browser.close()
writeFileSync(`${OUT}/preflight-${PHASE}.json`, JSON.stringify(results, null, 2))
console.log(`\n${PHASE}: ${results.checks.filter((c) => c.ok).length} pass / ${failures} fail`)
process.exit(failures ? 1 : 0)
