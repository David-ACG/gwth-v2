"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { waitlistSchema, type WaitlistFormData } from "@/lib/validations"
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
 * Waitlist form (name + email) styled to the FDE journal register (paper
 * panel, square hairline inputs, mono labels). Posts to /api/waitlist,
 * which persists the signup and sends the confirmation email.
 */
export function WaitlistFdeForm() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: "", email: "" },
  })

  async function onSubmit(data: WaitlistFormData) {
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name?.trim() || "Friend",
          email: data.email,
        }),
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
          <p className={styles.mono}>Status · On the list</p>
          <h2 className={styles.successTitle}>You are on the waitlist</h2>
          <p className={styles.successBody}>
            Thank you. We will email you as soon as more beta places open.
          </p>
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
          <button
            type="submit"
            className={`${styles.buttonSolid} ${styles.buttonFull}`}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Joining..." : "Join the waitlist"}
          </button>
        </form>
      </Form>
    </div>
  )
}
