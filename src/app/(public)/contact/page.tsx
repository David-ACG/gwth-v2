import type { Metadata } from "next"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have a question about the course, team pricing, or anything else? Send us a message and we will get back to you.",
}

/**
 * Contact page with a form for enquiries.
 * No published email addresses — all contact goes through the form.
 */
export default function ContactPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question about the course, team pricing, or anything else?
            Send us a message and we will get back to you.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  )
}
