"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { contactSchema, type ContactFormData } from "@/lib/validations"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import styles from "@/components/marketing/contact-fde/contact-fde.module.css"

/**
 * Contact form with name, email, and message fields, styled to the FDE
 * journal register (paper panel, square hairline inputs, mono labels).
 * Posts to /api/contact and shows success/error feedback.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  })

  async function onSubmit(data: ContactFormData) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitted(true)
        toast.success(result.message)
      } else {
        toast.error(result.message || "Something went wrong. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  if (submitted) {
    return (
      <div className={styles.panel}>
        <div className={styles.success} role="status">
          <p className={styles.mono}>Status · Sent</p>
          <h2 className={styles.successTitle}>Message sent!</h2>
          <p className={styles.successBody}>
            Thank you for getting in touch. We will get back to you as soon as
            possible.
          </p>
          <button
            type="button"
            className={styles.buttonOutline}
            onClick={() => {
              setSubmitted(false)
              form.reset()
            }}
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <FormLabel className={styles.label}>Name</FormLabel>
                <FormControl>
                  <input
                    className={styles.input}
                    placeholder="Your name"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage className={styles.error} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <FormLabel className={styles.label}>Email</FormLabel>
                <FormControl>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className={styles.error} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <FormLabel className={styles.label}>Message</FormLabel>
                <FormControl>
                  <textarea
                    className={styles.textarea}
                    placeholder="How can we help?"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={styles.error} />
              </FormItem>
            )}
          />
          <button
            type="submit"
            className={`${styles.buttonSolid} ${styles.buttonFull}`}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </Form>
    </div>
  )
}
