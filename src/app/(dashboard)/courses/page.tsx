import { redirect } from "next/navigation"

/**
 * Courses catalog page — redirects to the single course.
 * GWTH is a single-course platform (Applied AI Skills delivered over 3 months).
 * This redirect ensures any old /courses links or nav items land correctly.
 */
export default function CoursesPage() {
  redirect("/course/applied-ai-skills")
}
