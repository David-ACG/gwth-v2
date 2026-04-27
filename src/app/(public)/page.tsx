import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { Hero } from "@/components/marketing/hero/hero"
import { ResearchStrip } from "@/components/marketing/research-strip/research-strip"
import { JourneyGrid } from "@/components/marketing/journey-grid/journey-grid"

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
 * PROMPT-A ships Hero + ResearchStrip + JourneyGrid + CourseJsonLd.
 * The remaining sections render as placeholder stubs so the snapshot
 * harness has scaffolding ahead of PROMPT-B filling them in.
 */
export default function HomePage() {
  return (
    <>
      <CourseJsonLd />
      <Hero />
      <ResearchStrip />
      <JourneyGrid />
      {/* PROMPT-B placeholders */}
      <section data-section="pillars" />
      <section data-section="curriculum-vis" />
      <section data-section="score-vis" />
      <section data-section="prompt-vis" />
      <section data-section="research-stats" />
      <section data-section="pricing" />
      <section data-section="final-cta" />
      <section data-section="footer" />
    </>
  )
}
