import type { Metadata } from "next"
import { GwthRedesignAboutPage } from "@/components/marketing/gwth-redesign/about-page"

export const metadata: Metadata = {
  title: "About",
  description:
    "GWTH.ai is an independent UK-focused applied AI course built by practitioners, with practical projects and a verifiable score that reflects current skill.",
}

export default function AboutPage() {
  return <GwthRedesignAboutPage />
}
