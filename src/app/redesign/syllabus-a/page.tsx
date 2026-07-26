import type { Metadata } from "next"
import { SyllabusVariant } from "@/components/redesign/syllabus/syllabus-variant"
import styles from "./syllabus-a.module.css"

/** Option A of the syllabus readability comparison (W27): colour spine. */
export const metadata: Metadata = {
  title: "Syllabus A · Colour spine · GWTH.ai",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function SyllabusOptionA() {
  return <SyllabusVariant styles={styles} variant="a" />
}
