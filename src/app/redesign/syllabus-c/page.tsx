import type { Metadata } from "next"
import { SyllabusVariant } from "@/components/redesign/syllabus/syllabus-variant"
import styles from "./syllabus-c.module.css"
import { requireSessionOrRedirect } from "@/lib/content-access"

/** Option C of the syllabus readability comparison (W27): tinted fields. */
export const metadata: Metadata = {
  title: "Syllabus C · Tinted fields · GWTH.ai",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SyllabusOptionC() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  return <SyllabusVariant styles={styles} variant="c" />
}
