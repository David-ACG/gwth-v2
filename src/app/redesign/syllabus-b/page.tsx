import type { Metadata } from "next"
import { SyllabusVariant } from "@/components/redesign/syllabus/syllabus-variant"
import styles from "./syllabus-b.module.css"
import { requireSessionOrRedirect } from "@/lib/content-access"

/** Option B of the syllabus readability comparison (W27): chapter blocks. */
export const metadata: Metadata = {
  title: "Syllabus B · Chapter blocks · GWTH.ai",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SyllabusOptionB() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  return <SyllabusVariant styles={styles} variant="b" />
}
