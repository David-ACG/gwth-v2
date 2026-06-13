import type { Metadata } from "next"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "A three-month applied AI syllabus with 64 core lessons, 30 optional go-deeper lessons, practical projects, and progress evidence.",
}

/**
 * Public lessons landing page in the FDE journal register.
 * Showcases the 3-month course structure, features, and CTAs.
 */
export default function LessonsPage() {
  return <LessonsFde />
}
