import type { Metadata } from "next"
import { PricingNext } from "@/components/marketing/pricing-next/pricing-next"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { formatPence, PASS_PRICES_PENCE } from "@/lib/billing/passes"
import { COURSE_OPENS_ON } from "@/lib/launch-date"

/**
 * The description states the prices directly (Sol copy check, launch
 * readiness 2026-10-20), read from config and the billing module.
 */
export const metadata: Metadata = {
  title: "Pricing",
  description: `GWTH course prices: ${formatPence(
    PASS_PRICES_PENCE.courseSale
  )} for the whole three-month course if bought from ${COURSE_OPENS_ON} to 6 January 2027, or £${COURSE_MONTHLY_PRICE} a month. After your first three months, you can keep your lessons up to date for £${ONGOING_MONTHLY_PRICE.toFixed(2)} a month if you want to. The free labs cost nothing.`,
}

/**
 * Public pricing page in the paper-first register, rebuilt on 19 Nov 2026 to
 * sit beside the new home page (David: "Pricing looks extremely complex and
 * messy. We really need to revamp that page."). Source module:
 * `marketing/pricing-next/`. The page it replaces, `marketing/pricing-fde/`,
 * is kept untouched so it can come back.
 *
 * The component reads the sale window at request time (the (public) layout is
 * force-dynamic), so the buttons switch from the waitlist to buying on the
 * opening date by themselves.
 */
export default function PricingPage() {
  return <PricingNext />
}
