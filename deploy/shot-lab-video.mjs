// Evidence for the first lab video guide (bead gwth-launch-88z.32.23).
//
//   node deploy/shot-lab-video.mjs [outDir] [baseUrl]
//
// Shoots the two surfaces David is asked to look at, in both themes: the /labs
// index (where the card now carries a real poster frame and a running time)
// and the lab page (where the player is). It also grabs a frame of the video
// PLAYING, because a poster alone does not prove the media decodes in a
// browser; the frame is taken at 52s, on the card that shows the bad rows.
//
// Default base is the hlab preview, never production: production still runs
// the older register, so a shot from gwth.ai would not be evidence for this.
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2] ?? "completion/lab-video"
const BASE = process.argv[3] ?? "https://hlab.taila51191.ts.net:9458"
const SLUG = "messy-spreadsheet-claude-vs-chatgpt"

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })

async function setTheme(page, theme) {
  await page.evaluate((m) => {
    document.documentElement.classList.toggle("dark", m === "dark")
    document.documentElement.classList.toggle("light", m !== "dark")
  }, theme)
  await page.waitForTimeout(900)
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  const isDark = bg.replace(/[^0-9,]/g, "").split(",").slice(0, 3)
    .reduce((a, v) => a + Number(v), 0) < 300
  if (isDark !== (theme === "dark")) {
    throw new Error(`theme ${theme} did not take: body background is ${bg}`)
  }
}

for (const theme of ["light", "dark"]) {
  for (const [wname, width, height] of [["1440", 1440, 1000], ["390", 390, 844]]) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      colorScheme: theme,
      ignoreHTTPSErrors: true,
    })
    const page = await ctx.newPage()

    await page.goto(`${BASE}/labs`, { waitUntil: "load", timeout: 120000 })
    await page.waitForTimeout(2500)
    // The site theme is a class on <html>, not the OS preference, and the app
    // resets that class on hydration, so it has to be set AFTER the page has
    // settled or both passes shoot the same light page.
    await setTheme(page, theme)
    const card = page.locator('[data-testid="arena-lab-card"][href$="/labs/' + SLUG + '"]')
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/labs-${wname}-${theme}.png` })
    await card.screenshot({ path: `${OUT}/card-${wname}-${theme}.png` })

    await page.goto(`${BASE}/labs/${SLUG}`, { waitUntil: "load", timeout: 120000 })
    await page.waitForTimeout(2500)
    await setTheme(page, theme)
    await page.screenshot({ path: `${OUT}/lab-${wname}-${theme}.png` })

    // Prove the media itself plays, rather than that a poster renders.
    const state = await page.evaluate(async () => {
      const v = document.querySelector("video")
      if (!v) return { ok: false, why: "no video element" }
      v.muted = true
      v.currentTime = 52
      await new Promise((r) => {
        if (v.readyState >= 2) return r()
        v.addEventListener("loadeddata", r, { once: true })
        setTimeout(r, 15000)
      })
      await new Promise((r) => {
        if (Math.abs(v.currentTime - 52) < 0.5) return r()
        v.addEventListener("seeked", r, { once: true })
        setTimeout(r, 15000)
      })
      return {
        ok: v.readyState >= 2,
        duration: Math.round(v.duration),
        currentTime: Math.round(v.currentTime),
        tracks: v.textTracks.length,
        src: v.querySelector("source")?.getAttribute("src"),
      }
    })
    console.log(theme, wname, JSON.stringify(state))
    await page.locator("video").scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    await page.locator('[data-testid="lab-video-guide"]').screenshot({
      path: `${OUT}/player-${wname}-${theme}.png`,
    })

    await ctx.close()
  }
}
await browser.close()
