/**
 * W26 production verification: prove the CIPD demo path is sound on the live
 * site at both demo widths.
 *
 * Three things this covers that a curl matrix cannot:
 *   1. Byte-range delivery of the home explainer THROUGH Cloudflare, which is
 *      what actually broke — the origin always answered 206.
 *   2. The logged-in half of the demo (dashboard, L1 lesson, a lab, progress),
 *      screenshotted at 1440 and 390 so the packet carries live evidence.
 *   3. Horizontal overflow, which only a real layout engine can measure.
 *
 * Usage:
 *   DEMO_PASSWORD=... node deploy/verify-w26-prod.mjs
 *   DEMO_PASSWORD=... ONLY=range node deploy/verify-w26-prod.mjs
 *
 * The password is never committed. It is a temporary demo credential David
 * intends to change after the CIPD demo on 27 July.
 */
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

const BASE = process.env.BASE || "https://gwth.ai"
const EMAIL = process.env.DEMO_EMAIL || "familyuccelli@gmail.com"
const PASSWORD = process.env.DEMO_PASSWORD
const OUT = process.env.OUT || "completion/W26"
const ONLY = process.env.ONLY || "all"
const LESSON =
  "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const VIDEO = "/explainer/explainer.mp4"

if (!PASSWORD) {
  console.error("FATAL: set DEMO_PASSWORD (never commit it)")
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })

const results = []
function record(name, pass, detail) {
  results.push({ name, pass, detail })
  console.log(`${pass ? "PASS" : "FAIL"}  ${name} — ${detail}`)
}

// Cloudflare challenges the default headless UA once a run gets brisk. A real
// UA plus a pause between navigations keeps this measuring the app rather than
// the CDN's bot heuristics.
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
const PACE_MS = Number(process.env.PACE_MS || 1500)

const WIDTHS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
]

const browser = await chromium.launch()

/** Navigates with a pause, so a long run does not trip the CDN rate limit. */
async function visit(page, path) {
  const resp = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(PACE_MS)
  return resp
}

/** Lets the page settle without networkidle, which the home video never reaches. */
async function settle(page) {
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(1200)
}

/**
 * Reports horizontal overflow and, when there is any, the widest offending
 * element — a bare number is not actionable at 03:00 the night before a demo.
 */
async function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const over = doc.scrollWidth - window.innerWidth
    if (over <= 0) return { over, culprit: null }
    let worst = null
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.right > window.innerWidth + 1 && (!worst || r.right > worst.right)) {
        worst = {
          right: Math.round(r.right),
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 80),
          text: (el.textContent || "").trim().slice(0, 60),
        }
      }
    }
    return { over, culprit: worst }
  })
}

// ── 1. Byte-range delivery through Cloudflare ───────────────────────────────
// The whole point of the W26 video fix. Cloudflare used to answer a Range
// request with the full 5.87 MB body and a 200; the origin never did.
if (ONLY === "all" || ONLY === "range") {
  const ctx = await browser.newContext({ userAgent: UA })
  const ranges = ["bytes=0-999", "bytes=2000000-2000999", "bytes=5870449-5870948"]
  for (const range of ranges) {
    const resp = await ctx.request.get(`${BASE}${VIDEO}`, { headers: { Range: range } })
    const h = resp.headers()
    const body = await resp.body()
    const expected = Number(range.split("-")[1]) - Number(range.split("=")[1].split("-")[0]) + 1
    const ok =
      resp.status() === 206 &&
      h["accept-ranges"] === "bytes" &&
      Boolean(h["content-range"]) &&
      body.length === Math.min(expected, 5870949)
    record(`explainer ${range}`, ok,
      `http ${resp.status()} ${h["content-range"] || "no content-range"} ${body.length} B ` +
        `cf-cache-status=${h["cf-cache-status"]}`)
  }
  await ctx.close()
}

// ── 2. The home explainer actually plays, with poster and captions ──────────
if (ONLY === "all" || ONLY === "video") {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA })
  const page = await ctx.newPage()
  await visit(page, "/")
  await settle(page)

  // The embed is click-to-play by design (no autoplay, so it respects
  // reduced-motion and metered data), so the <video> does not exist until the
  // poster button is pressed. Prove the poster first, then mount the player.
  const posterButton = page.getByRole("button", { name: /play the 90-second tour/i })
  await posterButton.scrollIntoViewIfNeeded()
  const posterOk = await page.evaluate(() => {
    const img = document.querySelector('img[alt*="explainer poster"]')
    return img ? { src: img.currentSrc || img.src, w: img.naturalWidth } : null
  })
  record("poster frame renders before play", Boolean(posterOk && posterOk.w > 0),
    posterOk ? `${posterOk.src} naturalWidth ${posterOk.w}` : "no poster image")
  await posterButton.click()
  await page.waitForSelector("video", { timeout: 15000 })
  await page.waitForTimeout(1500)

  const meta = await page.evaluate(() => {
    const v = document.querySelector("video")
    if (!v) return null
    const track = v.querySelector("track")
    return {
      src: v.currentSrc || v.getAttribute("src"),
      poster: v.getAttribute("poster"),
      track: track ? { src: track.getAttribute("src"), kind: track.getAttribute("kind") } : null,
    }
  })
  record("home page has a video with poster and captions",
    Boolean(meta && meta.poster && meta.track),
    meta ? `src=${meta.src} poster=${meta.poster} track=${meta.track?.src}` : "no <video> element")

  const captions = await page.evaluate(async () => {
    const v = document.querySelector("video")
    const t = v.textTracks[0]
    if (!t) return null
    t.mode = "showing"
    await new Promise((r) => setTimeout(r, 2500))
    return { kind: t.kind, label: t.label, cues: t.cues ? t.cues.length : 0 }
  })
  record("captions track loads real cues", Boolean(captions && captions.cues > 0),
    captions ? `${captions.kind}/${captions.label}, ${captions.cues} cues` : "no textTrack")

  await page.screenshot({ path: `${OUT}/prod-home-video-playing.png` })

  // Play the whole thing. "It starts" is not the bar for a screen share: a
  // stall at 70 seconds in front of CIPD is the failure mode that matters.
  const play = await page.evaluate(async () => {
    const v = document.querySelector("video")
    v.muted = true
    const events = []
    for (const e of ["stalled", "waiting", "error", "ended", "suspend"]) {
      v.addEventListener(e, () => events.push(`${e}@${v.currentTime.toFixed(1)}`))
    }
    v.currentTime = 0
    await v.play().catch(() => {})
    const samples = []
    let last = -1
    let stalls = 0
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      samples.push(Number(v.currentTime.toFixed(1)))
      if (v.currentTime <= last + 0.05 && !v.ended) stalls++
      last = v.currentTime
      if (v.ended || v.currentTime >= v.duration - 0.35) break
    }
    return {
      duration: v.duration,
      final: v.currentTime,
      ended: v.ended,
      stalls,
      samples,
      readyState: v.readyState,
      buffered: v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0,
      error: v.error ? v.error.code : null,
      events,
    }
  })
  record("video plays end to end without stalling",
    play.ended || play.final >= play.duration - 0.5,
    `reached ${play.final.toFixed(1)}s of ${play.duration.toFixed(1)}s, ended=${play.ended}, ` +
      `stalls=${play.stalls}, error=${play.error}, events=[${play.events.join(" ")}]`)

  // Seeking is the behaviour byte ranges unlock; before the W26 fix Cloudflare
  // returned the whole body for a Range request and scrubbing misbehaved.
  const seek = await page.evaluate(async () => {
    const v = document.querySelector("video")
    v.currentTime = 45
    await v.play().catch(() => {})
    await new Promise((r) => setTimeout(r, 4000))
    return { at: v.currentTime, readyState: v.readyState, error: v.error ? v.error.code : null }
  })
  record("video scrubs to mid-video and resumes",
    seek.at > 45 && seek.readyState >= 3 && seek.error === null,
    `currentTime ${seek.at.toFixed(1)}s after seeking to 45s, readyState ${seek.readyState}`)
  await ctx.close()
}

// ── 3. Logged-in demo path, both widths ─────────────────────────────────────
if (ONLY === "all" || ONLY === "student") {
  const walk = [
    { path: "/dashboard", shot: "dashboard" },
    { path: LESSON, shot: "lesson-l1" },
    { path: "/labs", shot: "labs" },
    { path: "/labs/job-advert-claude-vs-chatgpt", shot: "lab-detail" },
    { path: "/progress", shot: "progress" },
    { path: "/course/applied-ai-skills", shot: "course" },
    { path: "/", shot: "home" },
    { path: "/pricing", shot: "pricing" },
    { path: "/about", shot: "about" },
    { path: "/for-teams", shot: "for-teams" },
  ]

  for (const w of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width: w.width, height: w.height },
      userAgent: UA,
    })
    const page = await ctx.newPage()

    await visit(page, "/login")
    const emailField = page.locator('input[type="email"]')
    try {
      await emailField.waitFor({ state: "visible", timeout: 30000 })
    } catch {
      throw new Error(
        `login form never appeared at ${page.url()} (title: "${await page.title()}") ` +
          `— if this says "Just a moment", Cloudflare is challenging the headless browser`
      )
    }
    await emailField.fill(EMAIL)
    await page.locator('input[type="password"]').fill(PASSWORD)
    await page.getByRole("button", { name: /log in/i }).click()
    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 })
    await settle(page)
    await page.screenshot({ path: `${OUT}/prod-login-${w.name}.png`, fullPage: true })
    record(`sign-in at ${w.name}`, !page.url().includes("/login"), `landed on ${page.url()}`)

    for (const step of walk) {
      const resp = await visit(page, step.path)
      await settle(page)
      const { over, culprit } = await overflow(page)
      record(`${step.path} @${w.name} no horizontal overflow`, over <= 0,
        over <= 0
          ? `scrollWidth fits ${w.width}px`
          : `overflows by ${over}px — ${culprit?.tag}.${culprit?.cls} "${culprit?.text}"`)
      record(`${step.path} @${w.name} loads`, resp.status() === 200 && !page.url().includes("/login"),
        `http ${resp.status()} at ${page.url()}`)
      await page.screenshot({ path: `${OUT}/prod-${step.shot}-${w.name}.png`, fullPage: true })

      // ── Per-surface assertions for the specific defects W26 closed ────────
      if (step.path === LESSON) {
        // The blocker: a skeleton that never came down sat over the intro
        // video, hiding it and swallowing the click that would start it.
        const intro = await page.evaluate(async () => {
          const v = document.querySelector("video")
          if (!v) return { present: false }
          const skeletons = [...document.querySelectorAll('[data-slot="skeleton"]')]
          const covering = skeletons.filter((s) => {
            const r = s.getBoundingClientRect()
            const vr = v.getBoundingClientRect()
            return r.width > 0 && r.right > vr.left && r.left < vr.right &&
              r.bottom > vr.top && r.top < vr.bottom
          })
          v.muted = true
          await v.play().catch(() => {})
          await new Promise((r) => setTimeout(r, 3500))
          return {
            present: true,
            covering: covering.length,
            readyState: v.readyState,
            currentTime: v.currentTime,
            duration: v.duration,
          }
        })
        record(`lesson intro video is not covered by a skeleton @${w.name}`,
          intro.present && intro.covering === 0,
          intro.present
            ? `${intro.covering} covering skeleton(s), readyState ${intro.readyState}`
            : "no <video> element")
        record(`lesson intro video plays @${w.name}`,
          Boolean(intro.present && intro.currentTime > 0.5),
          `currentTime ${(intro.currentTime ?? 0).toFixed(2)}s of ${(intro.duration ?? 0).toFixed(1)}s`)

        const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim()
        record(`lesson H1 punctuation restored @${w.name}`,
          h1.includes("Welcome to GWTH:"),
          `H1 reads "${h1}"`)
        record(`lesson H1 carries no em dash @${w.name}`, !h1.includes("—"), `H1 "${h1}"`)
      }

      if (step.path === "/course/applied-ai-skills") {
        const dead = await page.locator('a[href="/course"]').count()
        record(`no breadcrumb link to the 404 route /course @${w.name}`, dead === 0,
          `${dead} anchors with href="/course"`)
        const meta = await page.locator("body").innerText()
        record(`course header names what each number measures @${w.name}`,
          /lessons available now/i.test(meta) && /across 3 months/i.test(meta),
          meta.match(/\d+ LESSONS[^\n]*/i)?.[0] ?? "meta row not found")
      }

      if (step.path === "/labs" || step.path === "/labs/job-advert-claude-vs-chatgpt") {
        const text = await page.locator("body").innerText()
        const promises = ["no account", "free to read", "no account needed"].filter((s) =>
          text.toLowerCase().includes(s)
        )
        record(`${step.path} no longer promises anonymous access @${w.name}`,
          promises.length === 0,
          promises.length ? `still says: ${promises.join(", ")}` : "no anonymous-access promise")
      }

      if (step.path === "/pricing") {
        const bad = await page.locator('a[href="/signup"]').count()
        record(`no waitlist CTA pointing at closed signup @${w.name}`, bad === 0,
          `${bad} anchors with href="/signup"`)
      }

      if (step.path === "/") {
        record(`home title carries the brand once @${w.name}`,
          (await page.title()).split("GWTH.ai").length === 2,
          `title "${await page.title()}"`)
      }

      if (step.path === "/progress" || step.path === "/dashboard") {
        // The launcher used to sit 5px past the viewport and 2px from
        // right-aligned stat meta, so the meta read as truncated.
        const tab = await page.evaluate(() => {
          const el = [...document.querySelectorAll("button")].find((b) =>
            /report a problem/i.test(b.textContent || "")
          )
          if (!el) return null
          const r = el.getBoundingClientRect()
          return { right: Math.round(r.right), width: Math.round(r.width) }
        })
        record(`report-a-problem tab stays inside the viewport @${w.name}`,
          Boolean(tab && tab.right <= w.width),
          tab ? `right edge ${tab.right} against ${w.width}px` : "launcher not found")
      }
    }

    await ctx.close()
  }
}

// ── 4. robots.txt names the search crawlers ─────────────────────────────────
if (ONLY === "all" || ONLY === "robots") {
  const ctx = await browser.newContext({ userAgent: UA })
  const body = await (await ctx.request.get(`${BASE}/robots.txt`)).text()
  for (const bot of ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot"]) {
    const named = new RegExp(`^User-Agent: ${bot}$\\nDisallow: /$`, "mi").test(body)
    record(`robots.txt blocks ${bot} by name`, named,
      named ? "named group present with Disallow: /" : "no named group")
  }
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) {
  console.log("FAILURES:")
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`)
  process.exit(1)
}
