/**
 * Three palette treatments for the journey cards, rendered on the real home
 * page so David compares pictures (2026-07-26 audit, green-vs-green: "build the
 * three palette options").
 *
 * The problem: the cards rotate teal #2c4a47, moss #2a4530 and rust #a87528.
 * Teal and moss are both dark desaturated greens and read as one colour, so the
 * rotation carries no meaning, and a Teams share flattens them further.
 *
 * Each option is a runtime CSS override on the card tops only. Nothing here is
 * written to source: this renders the choice, it does not make it. Whichever
 * David picks becomes a small edit to the --v-* tokens in home-fde.module.css.
 *
 *   node deploy/shot-palette-options.mjs [baseUrl]
 */
import { chromium } from "playwright"
import { mkdir, writeFile } from "node:fs/promises"

const BASE = process.argv[2] || "http://localhost:3000"
const OUT = "completion/palette-options"

// The card top is the saturated block carrying "01 · ..." at the head of each
// journey card. Options recolour that block and nothing else.
const OPTIONS = [
  {
    id: "a-current",
    name: "A · Current",
    blurb:
      "Teal, moss, rust. Cards 01 and 02 are both dark green and read as one " +
      "colour at a glance, which is the finding.",
    css: "",
  },
  {
    id: "b-teal-ink-rust",
    name: "B · Drop the second green for ink",
    blurb:
      "Teal, ink, rust: three colours already in the palette, nothing new. The " +
      "middle card goes to the page's own near-black, which is the largest " +
      "possible separation from the other two and survives any projector. " +
      "Ochre was the obvious candidate for the middle card and is not offered: " +
      "it is the same family as the rust on card 03, so it would swap one pair " +
      "of look-alikes for another.",
    css: `
      [data-audit-grid] > *:nth-child(3n+2) [data-journey-top]{background:#1a1c18 !important;}
      [data-audit-grid] > *:nth-child(3n+2) [data-journey-top] *{color:#f4efdc !important;}
    `,
  },
  {
    id: "c-one-colour-three-weights",
    name: "C · One colour, three weights",
    blurb:
      "Teal at full, three-quarter and half strength. Colour stops pretending " +
      "to be a code and becomes rhythm instead: nothing to decode, and it " +
      "cannot go wrong on a projector. Quietest of the three.",
    css: `
      [data-audit-grid] > *:nth-child(3n+1) [data-journey-top]{background:#2c4a47 !important;}
      [data-audit-grid] > *:nth-child(3n+2) [data-journey-top]{background:#4a6f6a !important;}
      [data-audit-grid] > *:nth-child(3n+3) [data-journey-top]{background:#7d9c97 !important;}
      [data-audit-grid] [data-journey-top] *{color:#f4efdc !important;}
    `,
  },
  {
    id: "d-separate-the-greens",
    name: "D · Keep three families, separate them properly",
    blurb:
      "Teal stays, the second green moves to a lighter warmer olive, rust " +
      "stays. Keeps the idea that each month has its own colour, and puts real " +
      "distance between the two greens.",
    css: `
      [data-audit-grid] > *:nth-child(3n+2) [data-journey-top]{background:#5c7a3a !important;}
      [data-audit-grid] > *:nth-child(3n+2) [data-journey-top] *{color:#f4efdc !important;}
    `,
  },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 90000 })
// Below-fold images do not load for a fullPage shot unless the page is scrolled
// first - the trap that made three home sections look broken in the audit.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 90))
  }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(2200)

// Tag the grid and the card tops. The tops are the only saturated blocks inside
// the journey cards, so they are found by computed background rather than by a
// class name that a refactor could rename.
const grid = await page.evaluate(() => {
  const hits = [...document.querySelectorAll("*")].filter(
    (el) =>
      !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName) &&
      el.getBoundingClientRect().width > 0 &&
      /worried ai will take your job/i.test(el.textContent || ""),
  )
  let n = hits[hits.length - 1]
  while (n && n !== document.body && getComputedStyle(n).display !== "grid")
    n = n.parentElement
  if (!n || n === document.body) return null
  n.setAttribute("data-audit-grid", "1")
  for (const card of n.children) {
    for (const el of card.querySelectorAll("*")) {
      const bg = getComputedStyle(el).backgroundColor
      const m = bg.match(/rgba?\((\d+), (\d+), (\d+)/)
      if (!m) continue
      const [r, g, b] = [+m[1], +m[2], +m[3]]
      const dark = r + g + b < 420
      const coloured = Math.max(r, g, b) - Math.min(r, g, b) > 12
      if (dark && coloured && el.getBoundingClientRect().height > 20) {
        el.setAttribute("data-journey-top", "1")
        break
      }
    }
  }
  const r = n.getBoundingClientRect()
  return {
    top: Math.round(r.top + window.scrollY),
    h: Math.round(r.height),
    tops: n.querySelectorAll("[data-journey-top]").length,
  }
})
if (!grid) throw new Error("could not find the journeys grid")
if (grid.tops < 6) throw new Error(`only tagged ${grid.tops} card tops`)
console.log(`grid found, ${grid.tops} card tops tagged`)

const clip = { x: 120, y: grid.top - 30, width: 1200, height: grid.h + 60 }
for (const opt of OPTIONS) {
  await page.evaluate((css) => {
    document.getElementById("palette-opt")?.remove()
    if (!css) return
    const tag = document.createElement("style")
    tag.id = "palette-opt"
    tag.textContent = css
    document.head.append(tag)
  }, opt.css)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${opt.id}.png`, clip, fullPage: true })

  // Guard: the point of every option is that no two card tops read as one
  // colour. Option B was first drafted as teal/ochre/rust and just moved the
  // collision from cards 01-02 to cards 02-03, so this is checked rather than
  // eyeballed. The current palette is exempt: its collision IS the finding.
  const tops = await page.evaluate(() =>
    [...document.querySelectorAll("[data-journey-top]")]
      .slice(0, 3)
      .map((el) => getComputedStyle(el).backgroundColor),
  )
  const rgb = (c) => (c.match(/\d+/g) || []).slice(0, 3).map(Number)
  const near = []
  for (let i = 0; i < tops.length; i++)
    for (let j = i + 1; j < tops.length; j++) {
      const [a, b] = [rgb(tops[i]), rgb(tops[j])]
      const dist = a.reduce((sum, v, k) => sum + Math.abs(v - b[k]), 0)
      if (dist < 90) near.push(`card ${i + 1} vs ${j + 1} (${tops[i]} / ${tops[j]})`)
    }
  if (near.length && opt.id !== "a-current")
    throw new Error(`${opt.id}: card tops read as the same colour - ${near.join("; ")}`)
  console.log(`shot ${opt.id}${near.length ? " (collision, as expected)" : ""}`)
}

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Journey card colours: pick one</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; background:#e8e9de; color:#1a1c18;
         font-family: ui-serif, Georgia, serif; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  h1 { font-size: clamp(1.8rem,4vw,2.6rem); margin:0 0 .5rem; letter-spacing:-.02em; }
  .lede { max-width: 44rem; line-height:1.65; color:#3a3c34; }
  .opt { margin-top: 2.75rem; border-top:1px solid #c8c8b8; padding-top:1.5rem; }
  h2 { font-size:1.35rem; margin:0 0 .35rem; }
  .blurb { max-width:46rem; line-height:1.6; color:#3a3c34; margin:0 0 1rem; }
  img { display:block; width:100%; height:auto; border:1px solid #c8c8b8; background:#f1ecdc; }
  .mono { font-family: ui-monospace, monospace; font-size:.8rem; letter-spacing:.16em;
          text-transform:uppercase; color:#5a5c52; }
</style>
<div class="wrap">
  <p class="mono">GWTH · design decision</p>
  <h1>Journey card colours: pick one</h1>
  <p class="lede">You said to build the three palette options. Here they are on the
  real home page, plus the current version at the top so you are comparing like
  with like. Look at the tops of cards 01 and 02 in each: in the current one they
  are two different colours that read as the same colour. Tell me the letter and
  I will make it the palette; nothing here is applied to the site yet.</p>
${OPTIONS.map(
  (o) => `  <section class="opt">
    <h2>${o.name}</h2>
    <p class="blurb">${o.blurb}</p>
    <img src="${o.id}.png" alt="${o.name}">
  </section>`,
).join("\n")}
</div>
`
await writeFile(`${OUT}/index.html`, html)
await browser.close()
console.log(`done -> ${OUT}/index.html`)
