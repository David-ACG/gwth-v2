import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { HomeFde } from "@/components/marketing/home-fde/home-fde"
import { ExplainerVideo } from "@/components/marketing/home-fde/explainer-video"

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
 *
 * The explainer embed placement (after-hero) and chrome (framed) are David's
 * W12 picks, 2026-07-04, recorded in `completion/COMPLETION_W12.md` (the
 * review scaffolding they were captured in was deleted in W25); the video is
 * the final cut on VV7B fable100 take 005.
 */
export default function HomePage() {
  return (
    <>
      <CourseJsonLd />
      <HomeFde
        explainerAt="after-hero"
        explainer={
          <ExplainerVideo
            src="/explainer/explainer.mp4"
            poster="/explainer/poster.png"
            captionsSrc="/explainer/explainer.vtt"
            chrome="framed"
            kicker="The 90-second tour"
            heading="See it in ninety seconds."
            label="Play the 90-second tour"
          />
        }
      />
    </>
  )
}
