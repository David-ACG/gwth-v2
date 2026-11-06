#!/usr/bin/env node
/**
 * Start Here end to end on the hlab preview (bead gwth-launch-xw6s).
 *
 * Walks the real gate the way a visitor does: home page link -> /start-here
 * (locked) -> pop-up -> sign-up -> the confirmation email (read from the
 * preview's EMAIL_OUTBOX_DIR; a reserved example.com address never reaches a
 * real inbox) -> its button -> the open lesson. Then checks the consent row
 * in the preview's local database, and screenshots every state at 1280 and
 * 390 wide in light and dark, failing on any horizontal page scroll.
 *
 *   node scripts/start-here-e2e.mjs [base url] [outbox dir] [shots dir]
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const OUTBOX = process.argv[3] ?? "/home/david/.local/state/gwth-preview-outbox"
const SHOTS = process.argv[4] ?? "/tmp/start-here-e2e"
mkdirSync(SHOTS, { recursive: true })

const failures = []
const check = (ok, what) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}`)
  if (!ok) failures.push(what)
}

async function noSideScroll(page, label) {
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  check(sw <= iw + 1, `${label}: no horizontal page scroll (${sw} <= ${iw})`)
}

function outboxEmailFor(address) {
  const files = readdirSync(OUTBOX).filter((f) => f.endsWith(".json")).sort()
  for (const f of files.reverse()) {
    const mail = JSON.parse(readFileSync(join(OUTBOX, f), "utf8"))
    if (mail.to === address) return mail
  }
  return null
}

function sql(query) {
  return execFileSync("docker", ["exec", "gwth-v2-dev-postgres", "psql", "-U", "gwth", "-d", "gwth_v2", "-At", "-c", query], {
    encoding: "utf8",
  }).trim()
}

const browser = await chromium.launch()
const stamp = Date.now()
const address = `start-here-e2e-${stamp}@example.com`
let confirmUrl = null

for (const width of [1280, 390]) {
  for (const theme of ["light", "dark"]) {
    const label = `${width} ${theme}`
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      colorScheme: theme,
      ignoreHTTPSErrors: true,
    })
    await context.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t)
      } catch {}
    }, theme)
    const page = await context.newPage()

    // 1. The home page film's line goes to /start-here.
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
    const homeLink = page.getByTestId("home-free-lesson").getByRole("link")
    check((await homeLink.getAttribute("href")) === "/start-here", `${label}: home film line links to /start-here`)
    await homeLink.click()
    await page.waitForURL(/\/start-here$/)

    // 2. Locked: title and summary only, no lesson text, no film.
    const root = page.getByTestId("start-here")
    check((await root.getAttribute("data-state")) === "locked", `${label}: /start-here is locked before sign-up`)
    check((await page.getByTestId("start-here-lesson").count()) === 0, `${label}: no lesson text before sign-up`)
    check((await page.getByTestId("start-here-film").count()) === 0, `${label}: no film before sign-up`)
    const html = await page.content()
    check(!html.includes("Use dictation in any AI tool"), `${label}: lesson body is not in the page source`)
    await noSideScroll(page, `${label} locked`)
    await page.screenshot({ path: `${SHOTS}/locked-${width}-${theme}.png`, fullPage: true })

    // 3. The pop-up with David's wording.
    await page.getByTestId("start-here-open").first().click()
    const dialog = page.getByTestId("start-here-dialog").first()
    check(await dialog.isVisible(), `${label}: pop-up opens`)
    const consent = await dialog.getByTestId("start-here-consent").textContent()
    check(
      consent.includes("By adding your email address, you agree to receive news about the GWTH course when it's available. You can opt out in any email."),
      `${label}: consent line is David's wording`
    )
    check(
      (await dialog.getByRole("button", { name: "Send me the lesson and GWTH course news" }).count()) === 1,
      `${label}: button says the deal`
    )
    await page.screenshot({ path: `${SHOTS}/popup-${width}-${theme}.png` })

    if (width === 1280 && theme === "light") {
      // 4. Sign up once, read the email, follow its button.
      await dialog.getByLabel("Email address").fill(address)
      await dialog.getByRole("button", { name: "Send me the lesson and GWTH course news" }).click()
      await dialog.getByTestId("start-here-sent").waitFor()
      check(true, `${label}: "Check your inbox" shown`)
      await page.screenshot({ path: `${SHOTS}/sent-${width}-${theme}.png` })
      check((await page.getByTestId("start-here-lesson").count()) === 0, `${label}: sending alone unlocks nothing`)

      let mail = null
      for (let i = 0; i < 20 && !mail; i++) {
        mail = outboxEmailFor(address)
        if (!mail) await page.waitForTimeout(500)
      }
      check(Boolean(mail), `${label}: confirmation email written`)
      check(mail?.subject === "Your free GWTH lesson: Start Here", `${label}: email subject`)
      check(/agreed to receive news about the GWTH course/.test(mail?.text ?? ""), `${label}: email repeats the deal`)
      check(/\/start-here\/unsubscribe\?t=/.test(mail?.html ?? ""), `${label}: email has an opt-out link`)
      confirmUrl = /https?:\/\/[^"\s]+\/api\/start-here\/confirm\?t=[^"\s]+/.exec(mail?.html ?? "")?.[0]?.replace(/&amp;/g, "&") ?? null
      check(Boolean(confirmUrl), `${label}: email has the confirm button link`)

      const row = sql(
        `select wording || ' | ' || button_label || ' | ' || wording_version || ' | ' || (confirmed_at is null) from marketing_consents where email = '${address}'`
      )
      check(
        row.startsWith(
          "By adding your email address, you agree to receive news about the GWTH course when it's available. You can opt out in any email. | Send me the lesson and GWTH course news | 2026-10-09-a | t"
        ),
        `${label}: consent stored with exact wording, unconfirmed`
      )
    }
    await context.close()
  }
}

// 5. The email's button opens the lesson, in every size and theme.
for (const width of [1280, 390]) {
  for (const theme of ["light", "dark"]) {
    const label = `${width} ${theme}`
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      colorScheme: theme,
      ignoreHTTPSErrors: true,
    })
    await context.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t)
      } catch {}
    }, theme)
    const page = await context.newPage()
    await page.goto(confirmUrl, { waitUntil: "networkidle" })
    check(/\/start-here\?welcome=1$/.test(page.url()), `${label}: email button lands on /start-here?welcome=1`)
    check((await page.getByTestId("start-here").getAttribute("data-state")) === "open", `${label}: lesson is open`)
    check((await page.getByTestId("start-here-film").count()) === 1, `${label}: film shown`)
    check((await page.locator("figure.sh-figure").count()) === 7, `${label}: seven pictures`)
    const shown = await page.locator(`figure.sh-figure img.sh-${theme === "dark" ? "dark" : "light"}`).first().isVisible()
    check(shown, `${label}: pictures follow the theme`)
    check((await page.getByTestId("start-here-project").count()) === 1, `${label}: project shown`)
    await noSideScroll(page, `${label} open`)
    await page.screenshot({ path: `${SHOTS}/open-top-${width}-${theme}.png` })
    await page.locator("#tip-6-start-small-and-start-cheap").scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${SHOTS}/open-table-${width}-${theme}.png` })
    // A reload keeps it open (the cookie), with no welcome line.
    await page.goto(`${BASE}/start-here`, { waitUntil: "networkidle" })
    check((await page.getByTestId("start-here").getAttribute("data-state")) === "open", `${label}: stays open on return`)
    await context.close()
  }
}

const confirmed = sql(`select count(*) from marketing_consents where email = '${address}' and confirmed_at is not null`)
check(confirmed === "1", "consent row confirmed after the button")
check(sql(`select count(*) from waitlist where email = '${address}'`) === "1", "confirmed address added to the waitlist")

// 6. A broken link goes back to the form.
const ctx = await browser.newContext({ ignoreHTTPSErrors: true })
const p = await ctx.newPage()
await p.goto(`${BASE}/api/start-here/confirm?t=v1.bogus`, { waitUntil: "networkidle" })
check(/link=invalid/.test(p.url()) && (await p.getByTestId("start-here").getAttribute("data-state")) === "locked", "bad link stays locked")
await browser.close()

// Tidy the test sign-up out of the preview database.
sql(`delete from marketing_consents where email = '${address}'; delete from waitlist where email = '${address}'`)

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED")
console.log(`screenshots: ${SHOTS}`)
process.exit(failures.length ? 1 : 0)
