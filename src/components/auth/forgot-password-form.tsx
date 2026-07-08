"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations"
import { authClient } from "@/lib/auth-client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import styles from "@/components/auth/auth-fde.module.css"

/**
 * Forgot password form in the FDE register — sends a password reset email via
 * Better Auth (paper panel, square hairline input, mono label).
 */
export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null)
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      // #7: the reset link must land on the public /reset-password page (which
      // reads the token and renders the new-password form). The old "/settings"
      // is a PROTECTED route that bounced the logged-out user to /login and
      // dropped the token.
      redirectTo: "/reset-password",
    })

    if (error) {
      setServerError(error.message ?? "Unable to send reset link")
      return
    }

    toast.success("Check your email for a reset link")
    form.reset()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <p className={styles.panelKicker}>Reset password</p>
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          {serverError && (
            <p className={styles.serverError} role="alert">
              <AlertTriangle aria-hidden="true" />
              {serverError}
            </p>
          )}
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
            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </Form>

      <p className={styles.altPrompt}>
        Remember your password?{" "}
        <Link href="/login" className={styles.link}>
          Log in
        </Link>
      </p>
    </div>
  )
}
