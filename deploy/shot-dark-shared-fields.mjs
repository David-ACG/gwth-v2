// The field wells that come from the SHARED primitives, not from a CSS module
// (bead gwth-launch-88z.32.15). Two earlier passes fixed fields one file at a
// time; these pages get their boxes from components/ui/{input,textarea,select},
// so none of them were touched. Light mode matters here as much as dark,
// because the old fill was bg-transparent: in light mode the box had no fill of
// its own at all.
//   node deploy/shot-dark-shared-fields.mjs [base-url]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const base = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const out = "/home/david/projects/GWTH-launch-plan/walkthrough/shots/dark-form-boxes"
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })

async function ctxFor(scheme) {
  return browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: scheme,
    ignoreHTTPSErrors: true,
  })
}

async function settle(page, scheme) {
  await page.evaluate((s) => {
    document.documentElement.classList.toggle("dark", s === "dark")
  }, scheme)
  await page.waitForTimeout(600)
}

async function shootLocator(page, name, locator) {
  const file = path.join(out, name)
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await locator.screenshot({ path: file })
  console.log("wrote", file)
}

async function shoot(page, name, sel) {
  const file = path.join(out, name)
  if (sel) {
    const el = page.locator(sel).first()
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await el.screenshot({ path: file })
  } else {
    await page.screenshot({ path: file })
  }
  console.log("wrote", file)
}

// ---- public pages that reach the primitives --------------------------
// /news and /access are the other two routes that reach them. On the hlab
// preview /news fails its own data fetch and /access has no gate to show, so
// these are attempted and reported rather than quietly producing a shot of
// something else.
for (const scheme of ["dark", "light"]) {
  const ctx = await ctxFor(scheme)
  const page = await ctx.newPage()
  for (const [route, name] of [["/news", "news-shared"], ["/access", "access"]]) {
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 90000 })
    const landed = new URL(page.url()).pathname
    const broke = await page.getByText("We couldn't load this page").count()
    if (landed !== route || broke) {
      console.log(`SKIP ${route} (${scheme}): landed on ${landed}${broke ? ", error boundary" : ""}`)
      continue
    }
    await settle(page, scheme)
    await shoot(page, `${name}-1440-${scheme}.png`)
  }
  await ctx.close()
}

// ---- behind the login ----------------------------------------------------
for (const scheme of ["dark", "light"]) {
  const ctx = await ctxFor(scheme)
  const page = await ctx.newPage()
  const r = await page.request.post(`${base}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: "local-check@example.com", password: "Rafiki123" },
  })
  if (!r.ok()) {
    console.log("SKIP authed shots: sign-in returned " + r.status())
    await ctx.close()
    continue
  }

  // Settings: the select trigger that was filled with the card it sits on.
  // This is the one surface in this pass that is visible on a page today.
  await page.goto(base + "/settings", { waitUntil: "networkidle", timeout: 90000 })
  await settle(page, scheme)
  await shoot(page, `settings-1440-${scheme}.png`)
  // The Appearance card: climb from the select trigger to the group that
  // carries it, so the crop shows the box AGAINST the card it sits on.
  await page.locator('[data-slot="select-trigger"]').first().evaluate((el) => {
    let node = el
    while (node && !/group/i.test(String(node.className || ""))) node = node.parentElement
    if (node) node.setAttribute("data-shot", "appearance-card")
  })
  const card = page.locator('[data-shot="appearance-card"]')
  // BEFORE, rendered by putting the old fill back on the live page. Nothing is
  // written to the site; the style is injected into this one browser tab.
  await page.addStyleTag({
    content: '[data-slot="select-trigger"]{background:var(--v-surface) !important;}',
  })
  await page.waitForTimeout(300)
  await shootLocator(page, `settings-theme-before-${scheme}.png`, card)
  await page.evaluate(() => {
    document.querySelectorAll("style").forEach((s) => {
      if (s.textContent?.includes("select-trigger")) s.remove()
    })
  })
  await page.waitForTimeout(300)
  await shootLocator(page, `settings-theme-select-${scheme}.png`, card)

  await ctx.close()
}

await browser.close()
console.log("done")
