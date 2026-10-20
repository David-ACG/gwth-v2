import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { HomeFde } from "@/components/marketing/home-fde/home-fde"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
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
 * Marketing home page in the paper-first register (N12, 2026-09-03), built
 * to the N9 artboard David approved (annex 15). Source module:
 * `marketing/home-fde/`. Shared recipes: `marketing/paper/`.
 *
 * The 90-second explainer embed David placed after the hero on 2026-07-04
 * (W12) is not on the approved artboard and is not rendered here; the
 * component survives at `marketing/home-fde/explainer-video.tsx` and the
 * audio defect on it is bead gwth-launch-ps5.
 */
export default function HomePage() {
  // Read at request time: the (public) layout is force-dynamic, so the
  // buttons switch from the waitlist to buying on 1 December by themselves.
  return (
    <>
      <CourseJsonLd />
      <HomeFde selling={isSelling()} showScore={ENABLE_GWTH_SCORE} />
    </>
  )
}
