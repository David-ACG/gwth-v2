import type { Metadata } from "next"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { isSelling } from "@/lib/launch"

export const metadata: Metadata = {
  title: "Lessons",
  // The mandatory figure is derived from the month configs rather than typed
  // out, and no optional total is printed (a-20260914-201426-ae7f0e). The old
  // description also promised "a score you can show", which is switched on in
  // no environment (launch readiness review, 2026-10-20).
  description:
    `GWTH is a practical AI course for work and everyday life in the UK: ` +
    `${TOTAL_MANDATORY_LESSONS} core lessons over three months, optional lessons ` +
    `for going deeper in your own field, and a project in every lesson.`,
}

/**
 * Public lessons landing page in the paper-first register.
 *
 * `isSelling()` is read here, per request (the (public) layout is
 * force-dynamic), and passed down, so only the buttons change on 1 December.
 */
export default function LessonsPage() {
  return <LessonsFde selling={isSelling()} />
}
