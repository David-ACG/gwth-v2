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

export const metadata: Metadata = {
  title: "GWTH.ai | Learn to Build with AI",
  description:
    "Learn to build apps, automate workflows, and solve real problems using AI — all in plain English. No coding required. 94 hands-on projects across 3 months.",
  alternates: {
    canonical: "/",
  },
}

/**
 * Marketing homepage — Phase 1b composition.
 *
 * 12 sections in order: Hero → ResearchStrip → JourneyGrid →
 * ProductPillars (mounts CurriculumVis, ScoreVis, PromptVis as row
 * children) → ResearchStats → PricingCards → FinalCTA → MarketingFooter.
 * The CourseJsonLd component emits the only JSON-LD script on the page.
 */
export default function HomePage() {
  return (
    <>
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
