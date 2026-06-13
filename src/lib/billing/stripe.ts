import Stripe from "stripe"

let stripe: Stripe | null = null

export type StripePlan = "course" | "stay-current"

export const BILLING_DISABLED_FOR_BETA_MESSAGE = "Billing disabled for beta"

export function billingDisabledForBetaBody() {
  return {
    error: BILLING_DISABLED_FOR_BETA_MESSAGE,
    code: "billing_disabled_for_beta",
  }
}


export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }

  stripe ??= new Stripe(secretKey, {
    appInfo: {
      name: "GWTH.ai",
      version: "0.1.0",
    },
  })

  return stripe
}

export function getStripePriceId(plan: StripePlan): string {
  const envName =
    plan === "course" ? "STRIPE_COURSE_PRICE_ID" : "STRIPE_STAY_CURRENT_PRICE_ID"
  const priceId = process.env[envName]
  if (!priceId) {
    throw new Error(`${envName} is not configured`)
  }
  return priceId
}

export function getPlanForPriceId(priceId: string | null | undefined): StripePlan {
  if (priceId && priceId === process.env.STRIPE_STAY_CURRENT_PRICE_ID) {
    return "stay-current"
  }
  return "course"
}
