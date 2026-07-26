import type { Metadata } from "next"
import { SyllabusVariant } from "@/components/redesign/syllabus/syllabus-variant"
import styles from "./syllabus-b.module.css"

/** Option B of the syllabus readability comparison (W27): chapter blocks. */
export const metadata: Metadata = {
  title: "Syllabus B · Chapter blocks · GWTH.ai",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function SyllabusOptionB() {
  return <SyllabusVariant styles={styles} variant="b" />
}
