import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { Hero } from "@/components/marketing/hero/hero"
import { ResearchStrip } from "@/components/marketing/research-strip/research-strip"
import { JourneyGrid } from "@/components/marketing/journey-grid/journey-grid"
import { ProductPillars } from "@/components/marketing/product-pillars/product-pillars"
import { ResearchStats } from "@/components/marketing/research-stats/research-stats"
import { PricingCards } from "@/components/marketing/pricing-cards/pricing-cards"
import { FinalCTA } from "@/components/marketing/final-cta/final-cta"
import { MarketingFooter } from "@/components/marketing/marketing-footer/marketing-footer"
import styles from "@/components/marketing/gwth-redesign/gwth-redesign.module.css"

export const metadata: Metadata = {
  title: "Old public design",
  description:
    "Reference copy of the previous GWTH public homepage design while the 2026 handoff redesign is implemented.",
  robots: { index: false, follow: false },
}

export default function OldDesignPage() {
  return (
    <>
      <div className={styles.oldNotice}>
        Old public design reference. Keep until the useful copy and patterns have
        been carried into the new redesign.
      </div>
      <CourseJsonLd />
      <Hero />
      <ResearchStrip />
      <JourneyGrid />
      <ProductPillars />
      <ResearchStats />
      <PricingCards />
      <FinalCTA />
      <MarketingFooter />
    </>
  )
}
