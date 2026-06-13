import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { HomeFde } from "@/components/marketing/home-fde/home-fde"

export const metadata: Metadata = {
  title: "GWTH.ai | Beginner-to-Advanced Applied AI",
  description:
    "A UK-focused applied AI course that takes you from ChatGPT basics to serious practical skill: building, research, coding with AI, projects, and portfolio evidence.",
  alternates: {
    canonical: "/",
  },
}

/**
 * Marketing homepage — FDE journal register, chosen 2026-06-12 from the
 * homepage comparison round. Source module: `marketing/home-fde/`. The
 * inner public pages (/labs, /lessons, /pricing, /for-teams, /about,
 * /news) share the same register via their *-fde modules.
 */
export default function HomePage() {
  return (
    <>
      <CourseJsonLd />
      <HomeFde />
    </>
  )
}
