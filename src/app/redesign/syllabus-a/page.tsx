import type { Metadata } from "next"
import { SyllabusVariant } from "@/components/redesign/syllabus/syllabus-variant"
import styles from "./syllabus-a.module.css"
import { requireSessionOrRedirect } from "@/lib/content-access"

/** Option A of the syllabus readability comparison (W27): colour spine. */
export const metadata: Metadata = {
  title: "Syllabus A · Colour spine · GWTH.ai",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SyllabusOptionA() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  return <SyllabusVariant styles={styles} variant="a" />
}
