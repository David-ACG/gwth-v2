import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { HomeNext } from "@/components/marketing/home-next/home-next"
import { isSelling } from "@/lib/launch"

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s | GWTH.ai" template. This
  // title already carries the brand, so the template was stacking a second
  // one (W26).
  //
  // Launch readiness, 2026-10-20: the title and description start from the
  // approved general line in the public writing skill ("GWTH is a practical
  // AI course for work and everyday life in the UK.") and no longer describe
  // the audience as professionals or promise a "verified record".
  title: { absolute: "GWTH.ai | A practical AI course for work and everyday life" },
  description:
    "GWTH is a practical AI course for work and everyday life in the UK. Three monthly parts at about five hours a week, with a project in every lesson and work you keep.",
  alternates: {
    canonical: "/",
  },
}

/**
 * Marketing home page in the paper-first register. Since 19 Nov 2026 it is the
 * new version first drafted at /home-new (David: "I like
 * https://hlab.taila51191.ts.net:9509/home-new more. please replace the main
 * homepage with" it). Source module: `marketing/home-next/`, which reuses the
 * film and data from `marketing/home-fde/` (the previous page, kept so it can
 * come back). Shared recipes: `marketing/paper/`.
 *
 * The 90-second explainer embed David placed after the hero on 2026-07-04
 * (W12) is not on the approved artboard and is not rendered here; the
 * component survives at `marketing/home-fde/explainer-video.tsx` and the
 * audio defect on it is bead gwth-launch-ps5.
 */
export default function HomePage() {
  // Read at request time: the (public) layout is force-dynamic, so the
  // buttons switch from the waitlist to buying on 1 December by themselves.
  //
  // The score section is always shown (David, 19 Nov 2026: "show the public
  // pages with what we will have in December, so that CIPD and the people
  // testing it ... can see exactly what will be available when we go live").
  // It describes the course at launch, and so does project marking, in the
  // present tense (David, same day: "Please override the style Bible, as we
  // want to show exactly what will be available when we launch. We don't want
  // to show what is available now because we're not ready now."). The
  // product's own score screens stay behind GWTH_SCORE_ENABLED, and hand-ins
  // behind CAPSTONE_HAND_IN_ENABLED, until they work.
  return (
    <>
      <CourseJsonLd />
      <HomeNext selling={isSelling()} showScore markingLive />
    </>
  )
}
