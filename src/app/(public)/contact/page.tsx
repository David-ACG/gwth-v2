import type { Metadata } from "next"
import { ContactNext } from "@/components/marketing/contact-next/contact-next"

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Have a question about the course, a gift, team pricing or anything else? Send a message to the GWTH team in the United Kingdom and we'll reply by email.",
}

/**
 * Contact page with a form for enquiries, in the family look of the home page
 * (contact-next/; contact-fde/ is the page it replaced, kept as the backup).
 * No published email addresses: all contact goes through the form.
 */
export default function ContactPage() {
  return <ContactNext />
}
