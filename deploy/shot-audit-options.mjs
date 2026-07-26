/**
 * Renders each layout option from the demo-path audit as a REAL screenshot, so
 * David compares pictures rather than descriptions.
 *
 * Two kinds of option are produced, and the difference matters when reading them:
 *   - DRIVEN: the option is an existing product state, reached by clicking
 *     (e.g. the sidebar's own collapse control). What you see is exactly what
 *     shipping it would look like.
 *   - OVERRIDE: the option does not exist yet, and is approximated by injecting
 *     CSS at runtime. Good enough to judge composition, NOT a promise about the
 *     final pixel. Nothing here is written to source or deployed.
 *
 *   node deploy/shot-audit-options.mjs
 */
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = "completion/audit-layout/options"
const PROD = "https://gwth.ai"
const LOCAL = "http://localhost:3000"
const LESSON =
  "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(2200)
}

async function signIn(page, base) {
  const r = await page.request.post(`${base}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: "local-check@example.com", password: "Rafiki123" },
  })
  if (!r.ok()) throw new Error(`sign-in failed ${r.status()}`)
}

// ── Q1 · inner-page hero: single column (current) vs the home two-column shape ──
const HERO_TWOCOL = `
  [class*="masthead"] [class*="__page"]{
    display:grid;
    grid-template-columns:minmax(0,1.05fr) minmax(0,.8fr);
    column-gap:72px; align-items:start;
  }
  [class*="mastheadKicker"]{grid-area:1/1/2/2;}
  [class*="mastheadTitle"]{grid-area:2/1/3/2;margin:0;}
  [class*="standfirst"]{
    grid-area:2/2/3/3;align-self:start;margin:0;
    border-top:1px solid currentColor;padding-top:26px;max-width:46ch;
  }
  [class*="mastheadActions"]{grid-area:3/2/4/3;margin-top:26px;}
  [class*="mastheadFoot"]{grid-area:4/1/5/3;margin-top:64px;}
`

for (const slug of ["lessons", "for-teams"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${PROD}/${slug}`, { waitUntil: "load", timeout: 60000 })
  await settle(page)
  await page.screenshot({ path: `${OUT}/q1-${slug}-a-current.png` })
  await page.addStyleTag({ content: HERO_TWOCOL })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/q1-${slug}-b-twocol.png` })
  console.log(`q1 ${slug}`)
  await page.close()
}

// ── Q4 · nine-journeys grid: ragged stretch vs content-height vs six cards ──
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${PROD}/`, { waitUntil: "load", timeout: 60000 })
  await settle(page)
  const grid = await page.evaluate(() => {
    // Document order puts ancestors first, so the LAST match is the deepest
    // element actually holding the text. Taking the first would return <html>.
    // Script/style must be excluded: the Next RSC payload contains the copy too,
    // and being last in the document it otherwise wins.
    const hits = [...document.querySelectorAll("*")].filter(
      (el) =>
        !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName) &&
        el.getBoundingClientRect().width > 0 &&
        /worried ai will take your job/i.test(el.textContent || ""),
    )
    let n = hits[hits.length - 1]
    while (n && n !== document.body && getComputedStyle(n).display !== "grid") n = n.parentElement
    if (!n || n === document.body) return null
    n.setAttribute("data-audit-grid", "1")
    const r = n.getBoundingClientRect()
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height) }
  })
  if (!grid) throw new Error("could not find the journeys grid")
  const clip = { x: 120, y: grid.top - 30, width: 1200, height: grid.h + 60 }
  await page.screenshot({ path: `${OUT}/q4-a-current.png`, clip, fullPage: true })

  await page.addStyleTag({
    content: `[data-audit-grid]{align-items:start !important;}`,
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/q4-b-content-height.png`, clip, fullPage: true })

  await page.addStyleTag({
    content: `[data-audit-grid] > *:nth-child(n+7){display:none !important;}`,
  })
  await page.waitForTimeout(600)
  const h2 = await page.evaluate(() =>
    Math.round(document.querySelector("[data-audit-grid]").getBoundingClientRect().height),
  )
  await page.screenshot({
    path: `${OUT}/q4-c-six-cards.png`,
    clip: { ...clip, height: h2 + 60 },
    fullPage: true,
  })
  console.log("q4 journeys")
  await page.close()
}

// ── Q2 · lesson reading column, and Q5 · reading size ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await signIn(page, LOCAL)

  async function toProse() {
    await page.goto(`${LOCAL}${LESSON}`, { waitUntil: "load", timeout: 90000 })
    await page.waitForTimeout(2000)
    await page.getByRole("button", { name: /continue|next/i }).first().click()
    await page.waitForTimeout(1800)
  }

  async function measure(tag) {
    const m = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((e) => e.textContent.trim().length > 140)
      if (!p) return null
      const r = p.getBoundingClientRect()
      const fs = parseFloat(getComputedStyle(p).fontSize)
      // Rough ch estimate: a serif lowercase average is ~0.5em.
      return { w: Math.round(r.width), x: Math.round(r.left), ch: Math.round(r.width / (fs * 0.5)) }
    })
    console.log(`  ${tag}: prose x=${m?.x} w=${m?.w} ~${m?.ch}ch`)
    return m
  }

  await toProse()
  await page.screenshot({ path: `${OUT}/q2-a-current.png` })
  await measure("q2-a current")

  // DRIVEN: the sidebar's own collapse control, not a CSS fake.
  await page.getByRole("button", { name: /collapse sidebar/i }).click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/q2-b-nav-collapsed.png` })
  await measure("q2-b nav collapsed")

  // OVERRIDE on top of the driven state: give the freed width to the measure and
  // centre the column, which collapsing alone does not do.
  await page.addStyleTag({
    content: `
      [class*="lesson-fde-module"][class*="__reader"],
      [class*="lesson-fde-module"][class*="__prose"],
      [class*="lesson-fde-module"][class*="__body"]{
        max-width:68ch !important; margin-left:auto !important; margin-right:auto !important;
      }
      main p{max-width:68ch;}
    `,
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/q2-c-collapsed-centred.png` })
  await measure("q2-c collapsed + centred")

  // Q5 reading size, judged from the current chrome so only size changes.
  await toProse()
  await page.screenshot({ path: `${OUT}/q5-a-current.png` })
  await page.addStyleTag({
    content: `
      main p, main li{font-size:1.16em !important; line-height:1.72 !important;}
      [class*="mono"], [class*="Mono"], [class*="kicker"], [class*="meta"]{font-size:.85rem !important;}
    `,
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/q5-b-larger.png` })
  console.log("q2 + q5 lesson")
  await ctx.close()
}

// ── Q3 · dashboard hierarchy ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await signIn(page, LOCAL)
  await page.goto(`${LOCAL}/dashboard`, { waitUntil: "load", timeout: 90000 })
  await settle(page)
  await page.screenshot({ path: `${OUT}/q3-a-current.png` })

  // Demote the greeting, promote the only action on the page. The band is a
  // 588px/460px grid with the greeting left and the next-lesson panel right;
  // this reverses which of the two carries the visual weight.
  await page.addStyleTag({
    content: `
      [class*="__band"]{
        grid-template-columns:minmax(0,420px) minmax(0,660px) !important;
        column-gap:72px !important; align-items:start !important;
      }
      [class*="bandTitle"]{font-size:1.85rem !important; line-height:1.2 !important;}
      [class*="bandAside"]{border-left:0 !important; padding-left:0 !important;}
      [class*="bandAside"] :is(h1,h2,h3,h4){
        font-size:2.5rem !important; line-height:1.12 !important; margin-top:.25rem !important;
      }
      [class*="bandAside"] a, [class*="bandAside"] button{font-size:.95rem !important;}
    `,
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/q3-b-action-first.png` })
  console.log("q3 dashboard")
  await ctx.close()
}

// ── R6 · the edge tabs that overlap content, evidenced at 390 ──
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await signIn(page, LOCAL)
  await page.goto(`${LOCAL}/dashboard`, { waitUntil: "load", timeout: 90000 })
  await settle(page)
  await page.screenshot({ path: `${OUT}/r6-a-current-390.png` })
  await page.addStyleTag({
    content: `[class*="report"],[class*="Report"],[class*="feedback"],[class*="Feedback"],[class*="notes"],[class*="Notes"]{
      display:none !important;
    }`,
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/r6-b-tabs-hidden-390.png` })
  console.log("r6 edge tabs")
  await ctx.close()
}

await browser.close()
console.log("done")
