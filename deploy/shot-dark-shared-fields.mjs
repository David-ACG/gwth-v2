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

// ---- public pages, both modes -------------------------------------------
for (const scheme of ["dark", "light"]) {
  const ctx = await ctxFor(scheme)
  const page = await ctx.newPage()

  // The home page email box: the site's front door, and a bare <Input>.
  await page.goto(base + "/", { waitUntil: "networkidle", timeout: 90000 })
  await settle(page, scheme)
  await shoot(page, `home-waitlist-1440-${scheme}.png`)

  // The news filters and the inline newsletter box.
  const news = await page.goto(base + "/news", { waitUntil: "networkidle", timeout: 90000 })
  if (news && news.ok()) {
    await settle(page, scheme)
    await shoot(page, `news-shared-1440-${scheme}.png`)
  } else {
    console.log("SKIP /news:", news && news.status())
  }

  // The access gate: one Input on an otherwise empty card.
  const acc = await page.goto(base + "/access", { waitUntil: "networkidle", timeout: 90000 })
  if (acc && acc.ok()) {
    await settle(page, scheme)
    await shoot(page, `access-1440-${scheme}.png`)
  } else {
    console.log("SKIP /access:", acc && acc.status())
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
  await page.goto(base + "/settings", { waitUntil: "networkidle", timeout: 90000 })
  await settle(page, scheme)
  await shoot(page, `settings-1440-${scheme}.png`)

  await ctx.close()
}

await browser.close()
console.log("done")
