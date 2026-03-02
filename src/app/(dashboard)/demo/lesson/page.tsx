import type { Metadata } from "next"
import { DemoLessonViewer } from "./demo-lesson-viewer"

export const metadata: Metadata = {
  title: "Demo — Lesson UI Components",
  description:
    "Preview of all lesson UI foundation components in the new 5-section layout.",
}

/**
 * Demo page showcasing all new lesson UI components.
 * Uses the demo lesson data to render the full 5-section layout:
 * Intro Video → Objectives → Lesson Content → Q&A → Project
 *
 * Access at: /demo/lesson
 */
export default function DemoLessonPage() {
  return <DemoLessonViewer />
}
