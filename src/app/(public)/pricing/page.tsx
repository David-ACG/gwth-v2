import type { Metadata } from "next"
import { GwthRedesignPricingPage } from "@/components/marketing/gwth-redesign/pricing-page"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start with free GWTH labs, join the applied AI course when ready, or bring GWTH to a UK team with progress reporting and practical AI training.",
}

export default function PricingPage() {
  return <GwthRedesignPricingPage />
}
