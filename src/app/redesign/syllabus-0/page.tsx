import type { Metadata } from "next"
import { SyllabusVariant } from "@/components/redesign/syllabus/syllabus-variant"
import styles from "../../(dashboard)/course/[slug]/course-fde.module.css"
import { requireSessionOrRedirect } from "@/lib/content-access"

/**
 * Option 0 of the syllabus readability comparison (W27): the CURRENT design,
 * rendered by importing the production CSS module itself rather than a copy,
 * so option 0 cannot drift away from what is live. The only difference from
 * /course/applied-ai-skills is the missing dashboard chrome (sidebar +
 * header), which the redesign sandbox does not mount for any option.
 */
export const metadata: Metadata = {
  title: "Syllabus 0 · Current · GWTH.ai",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SyllabusOptionZero() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  return <SyllabusVariant styles={styles} variant="0" />
}
