import type { Metadata } from "next"
import { ContactFde } from "@/components/marketing/contact-fde/contact-fde"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a question about the course, team pricing, or anything else? Send us a message and we will get back to you.",
}

/**
 * Contact page with a form for enquiries, in the FDE journal register.
 * No published email addresses — all contact goes through the form.
 */
export default function ContactPage() {
  return <ContactFde />
}
