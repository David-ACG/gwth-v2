import type { Metadata } from "next"
import { PricingFde } from "@/components/marketing/pricing-fde/pricing-fde"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { formatPence, PASS_PRICES_PENCE } from "@/lib/billing/passes"

/**
 * The description states the prices directly (Sol copy check, launch
 * readiness 2026-10-20), read from config and the billing module.
 */
export const metadata: Metadata = {
  title: "Pricing",
  description: `GWTH course prices: ${formatPence(
    PASS_PRICES_PENCE.courseSale
  )} for the whole three-month course if bought from 1 December 2026 to 6 January 2027, or £${COURSE_MONTHLY_PRICE} a month. After your first three months, you can keep your lessons up to date for £${ONGOING_MONTHLY_PRICE.toFixed(2)} a month if you want to. The free labs cost nothing.`,
}

/**
 * Public pricing page in the FDE journal register.
 * Three tiers (Free, Member, Teams), comparison table, and teams detail.
 */
export default function PricingPage() {
  return <PricingFde />
}
