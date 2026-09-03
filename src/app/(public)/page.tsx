import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { HomeFde } from "@/components/marketing/home-fde/home-fde"

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s | GWTH.ai" template. This
  // title already carries the brand, so the template was stacking a second
  // one (W26).
  title: { absolute: "GWTH.ai | The applied AI foundation for UK professions" },
  description:
    "A three-month applied AI foundation for UK professionals and the institutions that serve them: build, automate, research and analyse in plain English, assessed throughout, with a verified record at the end.",
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
  return (
    <>
      <CourseJsonLd />
      <HomeFde />
    </>
  )
}
