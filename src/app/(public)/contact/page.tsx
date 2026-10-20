import type { Metadata } from "next"
import { ContactFde } from "@/components/marketing/contact-fde/contact-fde"

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Have a question about the course, a gift, team pricing or anything else? Send a message to the GWTH team in the United Kingdom and we'll reply by email.",
}

/**
 * Contact page with a form for enquiries, in the FDE journal register.
 * No published email addresses — all contact goes through the form.
 */
export default function ContactPage() {
  return <ContactFde />
}
