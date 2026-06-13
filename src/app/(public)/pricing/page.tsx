import type { Metadata } from "next"
import { PricingFde } from "@/components/marketing/pricing-fde/pricing-fde"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start with free GWTH labs, join the applied AI course when ready, or bring GWTH to a UK team with progress reporting and practical AI training.",
}

/**
 * Public pricing page in the FDE journal register.
 * Three tiers (Free, Member, Teams), comparison table, and teams detail.
 */
export default function PricingPage() {
  return <PricingFde />
}
