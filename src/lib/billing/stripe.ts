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


/**
 * STRIPE_REQUIRE_TEST_MODE=1 (set on the hlab preview) refuses any key that is
 * not a TEST key, so a live key pasted into a preview can never take money.
 */
export function assertStripeKeyAllowed(
  secretKey: string,
  env: Record<string, string | undefined> = process.env
): void {
  const requireTest = ["1", "true", "yes"].includes(
    (env.STRIPE_REQUIRE_TEST_MODE ?? "").trim().toLowerCase()
  )
  if (requireTest && !/^(sk|rk)_test_/.test(secretKey)) {
    throw new Error("STRIPE_REQUIRE_TEST_MODE is set but STRIPE_SECRET_KEY is not a test key")
  }
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  assertStripeKeyAllowed(secretKey)

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

/** The Stripe Price id for a one-off pass price (see passPrice in passes.ts). */
export function getPassPriceId(
  priceEnv:
    | "STRIPE_PASS_COURSE_SALE_PRICE_ID"
    | "STRIPE_PASS_COURSE_PRICE_ID"
    | "STRIPE_PASS_MONTH1_PRICE_ID"
): string {
  const priceId = process.env[priceEnv]
  if (!priceId) {
    throw new Error(`${priceEnv} is not configured`)
  }
  return priceId
}

/**
 * The site origin for Checkout return URLs: the first configured origin that
 * a buyer's browser can reach (AUTH_EMAIL_BASE_URL, BETTER_AUTH_URL,
 * NEXT_PUBLIC_SITE_URL), so a preview whose .env.local says localhost still
 * returns buyers to the preview. Only when every one is loopback (local dev)
 * is loopback used.
 */
export function siteOrigin(env: Record<string, string | undefined> = process.env): string {
  const candidates = [env.AUTH_EMAIL_BASE_URL, env.BETTER_AUTH_URL, env.NEXT_PUBLIC_SITE_URL]
  const parsed = candidates
    .map((c) => {
      try {
        return c ? new URL(c) : null
      } catch {
        return null
      }
    })
    .filter((u): u is URL => u !== null)
  const loopback = (u: URL) => ["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"].includes(u.hostname)
  const reachable = parsed.find((u) => !loopback(u))
  return (reachable ?? parsed[0])?.origin ?? "http://localhost:3000"
}
