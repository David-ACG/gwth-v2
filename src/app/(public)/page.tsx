import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { GwthRedesignHomePage } from "@/components/marketing/gwth-redesign/home-page"

export const metadata: Metadata = {
  title: "GWTH.ai | Beginner-to-Advanced Applied AI",
  description:
    "A UK-focused applied AI course that takes you from ChatGPT basics to serious practical skill: building, research, coding with AI, projects, and a verifiable GWTH Score.",
  alternates: {
    canonical: "/",
  },
}

/**
 * Marketing homepage — May 2026 handoff redesign. The previous E2-E public
 * homepage remains available at `/old-design` while copy and useful patterns
 * are carried forward.
 */
export default function HomePage() {
  return (
    <>
      <CourseJsonLd />
      <GwthRedesignHomePage />
    </>
  )
}
