import type { Metadata } from "next"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"

export const metadata: Metadata = {
  title: "Lessons",
  // The mandatory figure is derived from the month configs rather than typed
  // out: the old literal 64 went stale as soon as Month 1 grew from 24 lessons
  // to 26 (W26). The OPTIONAL total was removed on 2026-09-17 for the reason
  // /for-teams already refuses to print one: config says 30, the canonical
  // syllabus register says 44 over the three live months, and no register owns
  // the split (bead gwth-launch-88z.32.35).
  description:
    `A three-month applied AI syllabus with ${TOTAL_MANDATORY_LESSONS} core lessons, ` +
    `optional lessons for going deeper by profession, practical projects, and a score you can show.`,
}

/**
 * Public lessons landing page in the FDE journal register.
 * Showcases the 3-month course structure, features, and CTAs.
 */
export default function LessonsPage() {
  return <LessonsFde />
}
