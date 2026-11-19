import type { Metadata } from "next"
import { LessonsNext } from "@/components/marketing/lessons-next/lessons-next"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { isSelling } from "@/lib/launch"

export const metadata: Metadata = {
  title: "The course",
  // The mandatory figure is derived from the month configs rather than typed
  // out, and no optional total is printed (a-20260914-201426-ae7f0e). The old
  // description also promised "a score you can show", which is switched on in
  // no environment (launch readiness review, 2026-10-20).
  description:
    `GWTH is a practical AI course for work and everyday life in the UK: ` +
    `${TOTAL_MANDATORY_LESSONS} core lessons over three months, optional lessons ` +
    `for going deeper in your own field, and practical projects.`,
}

/**
 * "The course": the full month-by-month syllabus, in the paper-first register
 * (rebuilt 19 Nov 2026; source module `marketing/lessons-next/`). The previous
 * page is kept beside it at `marketing/lessons-fde/` so it can come back.
 *
 * `isSelling()` is read here, per request (the (public) layout is
 * force-dynamic), and passed down, so only the buttons change on 14 December.
 *
 * `showScore` and `markingLive` are on for the same reason as on the home
 * page (David, 19 Nov 2026: "show the public pages with what we will have in
 * December, so that CIPD and the people testing it ... can see exactly what
 * will be available when we go live"). The product's own score screens stay
 * behind GWTH_SCORE_ENABLED, and hand-ins behind CAPSTONE_HAND_IN_ENABLED.
 */
export default function LessonsPage() {
  return <LessonsNext selling={isSelling()} showScore markingLive />
}
