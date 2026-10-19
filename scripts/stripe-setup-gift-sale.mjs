#!/usr/bin/env node
/**
 * Creates (or finds) every Stripe object the gift sale needs, and prints the
 * env lines to paste (bead gwth-launch-v1uj). Idempotent: prices are found by
 * lookup key, so running it twice changes nothing.
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup-gift-sale.mjs
 *
 * Test mode on hlab now; live mode once at switch-on (after the keys are
 * rolled). Never commit the output: it goes into Coolify env (production) or
 * ~/.config/gwth/stripe-test.env (hlab).
 *
 * Creates:
 *   course monthly      £29 / month   STRIPE_COURSE_PRICE_ID
 *   stay current        £7.50 / month STRIPE_STAY_CURRENT_PRICE_ID
 *   whole course pass   £69 one-off   STRIPE_PASS_COURSE_SALE_PRICE_ID (archive on 7 Jan)
 *   whole course pass   £87 one-off   STRIPE_PASS_COURSE_PRICE_ID
 *   first month pass    £29 one-off   STRIPE_PASS_MONTH1_PRICE_ID
 *   STRIPE_PORTAL_CONFIGURATION_ID: a Customer Portal configuration where a payer can update their card,
 *   see invoices and cancel online at the end of the period (DMCC readiness).
 * No tax settings: GWTH is not VAT registered (decision 8).
 */
import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.")
  process.exit(2)
}
const live = key.startsWith("sk_live_") || key.startsWith("rk_live_")
if (live && process.env.I_MEAN_LIVE !== "yes") {
  console.error("This is a LIVE key. Re-run with I_MEAN_LIVE=yes once David has said to switch on.")
  process.exit(2)
}
const stripe = new Stripe(key, { appInfo: { name: "GWTH.ai gift sale setup" } })

const PRICES = [
  { env: "STRIPE_COURSE_PRICE_ID", lookup: "gwth_course_monthly", product: "GWTH course", amount: 2900, recurring: { interval: "month" } },
  { env: "STRIPE_STAY_CURRENT_PRICE_ID", lookup: "gwth_stay_current_monthly", product: "GWTH stay current", amount: 750, recurring: { interval: "month" } },
  { env: "STRIPE_PASS_COURSE_SALE_PRICE_ID", lookup: "gwth_pass_course_christmas_2026", product: "GWTH whole course", amount: 6900, nickname: "Christmas 2026 (1 Dec to 6 Jan)" },
  { env: "STRIPE_PASS_COURSE_PRICE_ID", lookup: "gwth_pass_course", product: "GWTH whole course", amount: 8700 },
  { env: "STRIPE_PASS_MONTH1_PRICE_ID", lookup: "gwth_pass_month1", product: "GWTH first month", amount: 2900 },
]

async function productNamed(name) {
  const found = await stripe.products.search({ query: `name:'${name}' AND active:'true'` }).catch(() => null)
  if (found?.data?.[0]) return found.data[0]
  return stripe.products.create({ name, statement_descriptor: "GWTH.AI" })
}

const lines = []
for (const p of PRICES) {
  const existing = await stripe.prices.list({ lookup_keys: [p.lookup], limit: 1 })
  let price = existing.data[0]
  if (!price) {
    const product = await productNamed(p.product)
    price = await stripe.prices.create({
      product: product.id,
      currency: "gbp",
      unit_amount: p.amount,
      lookup_key: p.lookup,
      tax_behavior: "unspecified",
      ...(p.recurring ? { recurring: p.recurring } : {}),
      ...(p.nickname ? { nickname: p.nickname } : {}),
    })
    console.error(`created ${p.lookup} ${price.id}`)
  } else {
    console.error(`found   ${p.lookup} ${price.id}`)
  }
  lines.push(`${p.env}=${price.id}`)
}

const configs = await stripe.billingPortal.configurations.list({ limit: 20 })
let portal = configs.data.find((c) => c.metadata?.gwth === "gift-sale" && c.active)
if (!portal) {
  portal = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Manage your GWTH payments" },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "name"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
    },
    metadata: { gwth: "gift-sale" },
  })
  console.error(`created portal configuration ${portal.id}`)
}
lines.push(`STRIPE_PORTAL_CONFIGURATION_ID=${portal.id}`)

console.log(lines.join("\n"))
