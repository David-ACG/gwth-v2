import type { Metadata } from "next"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"
import {
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"

export const metadata: Metadata = {
  title: "Lessons",
  // Derived from the month configs rather than typed out: the old literal 64
  // went stale as soon as Month 1 grew from 24 lessons to 26 (W26).
  description:
    `A three-month applied AI syllabus with ${TOTAL_MANDATORY_LESSONS} core lessons, ` +
    `${TOTAL_OPTIONAL_LESSONS} optional go-deeper lessons, practical projects, and progress evidence.`,
}

/**
 * Public lessons landing page in the FDE journal register.
 * Showcases the 3-month course structure, features, and CTAs.
 */
export default function LessonsPage() {
  return <LessonsFde />
}
