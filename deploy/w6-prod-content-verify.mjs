// W6 content-import verification on PROD https://gwth.ai (after staging→prod content copy).
// Usage: FRESH_EMAIL=... FRESH_PW=... node deploy/w6-prod-content-verify.mjs
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const BASE = "https://gwth.ai"
const OUT = "/home/david/projects/GWTH_V2/completion/W6"
const EMAIL = process.env.FRESH_EMAIL
const PW = process.env.FRESH_PW
const LESSON_PATH = "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const LAB_PATH = "/labs/build-your-prompt-cheat-sheet"

const results = { checks: [], consoleErrors: {}, media: {} }
let failures = 0
function check(name, ok, detail = "") {
  results.checks.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`)
  if (!ok) failures++
}
const IGNORE = [/favicon/i, /Download the React DevTools/i]
function trackConsole(page, key) {
  results.consoleErrors[key] = results.consoleErrors[key] || []
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.some((r) => r.test(m.text())))
      results.consoleErrors[key].push(m.text().slice(0, 300))
  })
  page.on("pageerror", (e) => results.consoleErrors[key].push("pageerror: " + String(e).slice(0, 300)))
}

const browser = await chromium.launch()

async function loginCtx(viewport) {
  const ctx = await browser.newContext({ viewport, colorScheme: "light" })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/login`, { waitUntil: "load", timeout: 60000 })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PW)
  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ])
  return { ctx, page }
}

// ---------- desktop: dashboard + lesson ----------
{
  const { ctx, page } = await loginCtx({ width: 1280, height: 800 })
  trackConsole(page, "dashboard")
  await page.waitForTimeout(2000)
  const dashText = await page.locator("body").innerText()
  check("dashboard shows real 26-lesson scope", /26 lessons/i.test(dashText), (dashText.match(/\d+ lessons/gi) || []).join(", "))
  check("dashboard NOT 95-lesson mock catalog", !/95 lessons/i.test(dashText))
  check("dashboard honest zeros (Not started yet)", /not started yet/i.test(dashText) || /0%/.test(dashText))
  await page.screenshot({ path: `${OUT}/prod-dashboard-1280.png`, fullPage: true })

  const lp = await ctx.newPage()
  trackConsole(lp, "lesson")
  const resp = await lp.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "load", timeout: 60000 })
  await lp.waitForTimeout(3000)
  const lessonBody = await lp.locator("body").innerText()
  check("lesson HTTP 200", resp.status() === 200, `status=${resp.status()}`)
  check("lesson not 404 / not-found", !/lesson not found|404/i.test(lessonBody.slice(0, 2000)))
  check("lesson title renders", /six ways ai can give you superpowers/i.test(lessonBody))

  // media elements + srcs
  const media = await lp.evaluate(() => {
    const grab = (el) => el.currentSrc || el.src || el.querySelector("source")?.src || ""
    return {
      videos: [...document.querySelectorAll("video")].map(grab),
      audios: [...document.querySelectorAll("audio")].map(grab),
    }
  })
  results.media.lesson = media
  console.log("media srcs:", JSON.stringify(media))
  const allSrcs = [...media.videos, ...media.audios].filter(Boolean)
  check("video/audio elements present", media.videos.length + media.audios.length > 0,
    `videos=${media.videos.length} audios=${media.audios.length}`)
  check("media srcs point at https://media.gwth.ai", allSrcs.length > 0 && allSrcs.every((s) => s.startsWith("https://media.gwth.ai")),
    JSON.stringify(allSrcs))

  // play the video 2-3s and confirm currentTime advances
  const play = await lp.evaluate(async () => {
    const v = document.querySelector("video")
    if (!v) return { ok: false, why: "no <video>" }
    v.muted = true
    try { await v.play() } catch (e) { return { ok: false, why: "play() rejected: " + String(e).slice(0, 200) } }
    const t0 = v.currentTime
    await new Promise((r) => setTimeout(r, 2500))
    const t1 = v.currentTime
    v.pause()
    return { ok: t1 > t0 && t1 > 0.5, t0, t1 }
  })
  results.media.play = play
  check("video plays, currentTime advances", play.ok, JSON.stringify(play))
  await lp.screenshot({ path: `${OUT}/prod-lesson-1280.png`, fullPage: false })
  await ctx.close()
}

// ---------- mobile: lesson shot ----------
{
  const { ctx } = await loginCtx({ width: 412, height: 915 })
  const lp = await ctx.newPage()
  await lp.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "load", timeout: 60000 })
  await lp.waitForTimeout(3000)
  await lp.screenshot({ path: `${OUT}/prod-lesson-412.png`, fullPage: false })
  await ctx.close()
}

// ---------- labs (anon ok? use logged-in to be safe) ----------
{
  const { ctx } = await loginCtx({ width: 1280, height: 800 })
  const page = await ctx.newPage()
  trackConsole(page, "labs")
  await page.goto(`${BASE}/labs`, { waitUntil: "load", timeout: 60000 })
  await page.waitForTimeout(2000)
  const labsText = await page.locator("body").innerText()
  const labCards = await page.locator('a[href^="/labs/"]').count()
  check("/labs lists labs", labCards > 0, `lab links=${labCards}`)
  check("/labs mentions prompt cheat sheet lab", /prompt cheat sheet/i.test(labsText))

  const lab = await ctx.newPage()
  trackConsole(lab, "lab")
  const lr = await lab.goto(`${BASE}${LAB_PATH}`, { waitUntil: "load", timeout: 60000 })
  await lab.waitForTimeout(2000)
  const labBody = await lab.locator("body").innerText()
  check("lab detail renders", lr.status() === 200 && /prompt cheat sheet/i.test(labBody), `status=${lr.status()}`)
  await ctx.close()
}

for (const [k, v] of Object.entries(results.consoleErrors)) {
  check(`no console errors on ${k}`, v.length === 0, v.length ? JSON.stringify(v).slice(0, 500) : "")
}

writeFileSync(`${OUT}/prod-content-verify.json`, JSON.stringify(results, null, 2))
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`)
await browser.close()
process.exit(failures === 0 ? 0 : 1)
