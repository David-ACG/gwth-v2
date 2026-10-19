import { test, expect, type Page } from "@playwright/test"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import postgres from "postgres"

/**
 * Christmas gift sale, end to end on the hlab preview (bead gwth-launch-v1uj.6).
 *
 *   buy a gift -> the gift email arrives -> open it (create an account,
 *   confirm the email) -> Month 1 is open -> the "on hold" notice shows once
 *   the first month is used up and Month 2 is not open yet.
 *
 * Runs ONLY when asked, against the preview, on the preview's own machine
 * (it reads the email outbox and the database directly):
 *
 *   GIFT_E2E=1 PLAYWRIGHT_BASE_URL=https://hlab.taila51191.ts.net:9458 \
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *   EMAIL_OUTBOX_DIR=/home/david/.local/state/gwth-preview-outbox \
 *   CRON_SECRET=... npx playwright test gift-sale --project=desktop-chromium
 *
 * GIFT_E2E_PAYMENT=stripe (the default) pays on Stripe's hosted Checkout with
 * a TEST card, so the preview must hold Stripe TEST keys. GIFT_E2E_PAYMENT=
 * seeded writes the pass exactly as the webhook does, then lets the scheduler
 * send the email: everything except Stripe itself.
 */

const ENABLED = process.env.GIFT_E2E === "1"
const OUTBOX = process.env.EMAIL_OUTBOX_DIR ?? "/home/david/.local/state/gwth-preview-outbox"
const PAYMENT = process.env.GIFT_E2E_PAYMENT ?? "stripe"
const RUN = Date.now().toString(36)
const RECIPIENT = `gift-e2e-${RUN}@example.com`
const BUYER = `gift-buyer-${RUN}@example.com`
const PASSWORD = `Gift-e2e-${RUN}-pass!`

/** A valid pass code (same alphabet as generatePassCode in src/lib/billing/passes.ts). */
function randomCode(): string {
  const abc = "23456789ABCDEFGHJKMNPQRSTVWXYZ"
  const group = () => Array.from({ length: 4 }, () => abc[Math.floor(Math.random() * abc.length)]).join("")
  return `GWTH-${group()}-${group()}-${group()}`
}

type Mail = { to: string; subject: string; html: string; text: string; at: string }

async function waitForMail(to: string, subject: RegExp, timeoutMs = 90_000): Promise<Mail> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    for (const name of readdirSync(OUTBOX).filter((n) => n.endsWith(".json"))) {
      const mail = JSON.parse(readFileSync(join(OUTBOX, name), "utf8")) as Mail
      if (mail.to.toLowerCase() === to.toLowerCase() && subject.test(mail.subject)) return mail
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error(`no email to ${to} matching ${subject} within ${timeoutMs / 1000}s`)
}

function linkIn(mail: Mail, pattern: RegExp): string {
  const hrefs = [...mail.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.replace(/&amp;/g, "&"))
  const hit = hrefs.find((h) => pattern.test(h))
  if (!hit) throw new Error(`no link matching ${pattern} in "${mail.subject}"`)
  return hit
}

async function payOnStripe(page: Page) {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 })
  await page.locator("#email").fill(BUYER)
  await page.locator("#cardNumber").fill("4242 4242 4242 4242")
  await page.locator("#cardExpiry").fill("12 / 34")
  await page.locator("#cardCvc").fill("123")
  await page.locator("#billingName").fill("Gift E2E Buyer")
  const postal = page.locator("#billingPostalCode")
  if (await postal.isVisible().catch(() => false)) await postal.fill("SW1A 1AA")
  await page.locator('button[type="submit"]').first().click()
}

test.describe("Christmas gift sale on the hlab preview", () => {
  test.skip(!ENABLED, "set GIFT_E2E=1 to run against the hlab preview")
  test.describe.configure({ mode: "serial", timeout: 240_000 })

  let sql: ReturnType<typeof postgres>
  let code = ""

  test.beforeAll(() => {
    sql = postgres(process.env.DATABASE_URL ?? "postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2")
  })

  test.afterAll(async () => {
    // Leave no test accounts or passes behind on the preview.
    await sql`delete from user_access where user_id in (select id from "user" where email = ${RECIPIENT})`
    await sql`delete from prepaid_passes where recipient_email = ${RECIPIENT}`
    await sql`delete from "user" where email = ${RECIPIENT}`
    await sql.end()
  })

  test("buy a gift and the gift email arrives", async ({ page, request }) => {
    await page.goto("/gift")
    await expect(page.getByTestId("gift-form")).toBeVisible()
    await page.getByTestId("gift-product-course").click()
    await page.locator("#recipientName").fill("Sam E2E")
    await page.locator("#recipientEmail").fill(RECIPIENT)
    await page.locator("#buyerName").fill("Alex E2E")
    await page.locator("#message").fill("Happy Christmas from the end-to-end test.")
    await page.getByLabel(/straight away/i).check()

    if (PAYMENT === "stripe") {
      await page.getByTestId("gift-pay").click()
      await payOnStripe(page)
      await page.waitForURL(/\/gift\/thanks\?session_id=/, { timeout: 90_000 })
      await expect(page.getByTestId("gift-thanks")).toBeVisible()
      code = (await page.getByTestId("gift-code").innerText()).trim()
    } else {
      // Exactly the row fulfilPassCheckout writes for a paid gift.
      code = randomCode()
      await sql`insert into prepaid_passes
        (code, product, months, price_paid, buyer_email, buyer_name, is_gift, recipient_name,
         recipient_email, message, deliver_at, redeem_by, stripe_checkout_session, receipt_sent_at)
        values (${code}, 'course', 3, 6900, ${BUYER}, 'Alex E2E', true, 'Sam E2E', ${RECIPIENT},
         'Happy Christmas from the end-to-end test.', now(), now() + interval '1 year',
         ${"cs_test_e2e_" + RUN}, now())`
      const res = await request.post("/api/cron/passes", {
        headers: { "x-cron-secret": process.env.CRON_SECRET ?? "" },
      })
      expect(res.ok()).toBeTruthy()
    }

    const gift = await waitForMail(RECIPIENT, /has given you the GWTH course/)
    expect(gift.text).toContain(code)
    expect(gift.text).toContain("Happy Christmas from the end-to-end test.")
  })

  test("open the gift: create an account, confirm the email, see Month 1", async ({ page }) => {
    const gift = await waitForMail(RECIPIENT, /has given you the GWTH course/)
    const openUrl = new URL(linkIn(gift, /\/gift\/open\?code=/))
    await page.goto(openUrl.pathname + openUrl.search)
    await expect(page.getByTestId("gift-what")).toContainText(/whole/i)

    await page.getByRole("link", { name: /create an account/i }).click()
    await page.waitForURL(/\/signup/)
    await page.getByLabel("Name").fill("Sam E2E")
    await page.getByLabel("Email").fill(RECIPIENT)
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD)
    await page.getByLabel("Confirm password").fill(PASSWORD)
    await page.getByRole("button", { name: /create account/i }).click()
    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible()

    const verify = await waitForMail(RECIPIENT, /verify/i)
    const verifyUrl = new URL(linkIn(verify, /verify-email/))
    await page.goto(verifyUrl.pathname + verifyUrl.search)
    await page.waitForURL(/\/gift\/open\?code=/, { timeout: 30_000 })

    await page.getByTestId("open-gift").click()
    await page.waitForURL(/\/dashboard/)
    await expect(page.locator('[data-section="dashboard-active"]')).toBeVisible()
    await expect(page.getByText(/Month 1/).first()).toBeVisible()

    const opened = await waitForMail(RECIPIENT, /has started/)
    expect(opened.text).toMatch(/Month 1/)
  })

  test("Month 2 not ready: the on-hold notice shows and Month 1 stays open", async ({ page }) => {
    const before = await sql`select month, opens_at from course_month_release order by month`
    try {
      await sql`update course_month_release set opens_at = null`
      // As if the gift had been opened 40 days ago: the first month is used up.
      await sql`update prepaid_passes set redeemed_at = now() - interval '40 days' where recipient_email = ${RECIPIENT}`

      await page.goto("/login")
      await page.getByLabel("Email").fill(RECIPIENT)
      await page.getByLabel("Password").fill(PASSWORD)
      await page.getByRole("button", { name: /log in|sign in/i }).click()
      await page.waitForURL(/\/dashboard/)
      await expect(page.getByTestId("course-hold-notice")).toBeVisible()
      await expect(page.getByTestId("course-hold-notice")).toContainText(/Month 2/)
      await expect(page.locator('[data-section="dashboard-active"]')).toBeVisible()
    } finally {
      for (const r of before) {
        await sql`update course_month_release set opens_at = ${r.opens_at} where month = ${r.month}`
      }
    }
  })
})
