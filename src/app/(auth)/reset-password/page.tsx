"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import { AlertTriangle } from "lucide-react"
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
 * Password reset landing page (MEDIUM #7), in the FDE journal register.
 *
 * The reset email links here with `?token=…`. This page is PUBLIC and reachable
 * logged-out (see /reset-password in proxy.ts AUTH_PATHS) — the previous
 * redirectTo "/settings" landed on a protected route that bounced the
 * logged-out user to /login, dropping the token. It reads the token from the
 * URL, renders a new-password form, and calls authClient.resetPassword.
 */
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError(null)
    if (!token) {
      setServerError(
        "This reset link is missing its token. Request a new link to continue."
      )
      return
    }

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    })

    if (error) {
      setServerError(
        error.message ??
          "This reset link is invalid or has expired. Request a new one."
      )
      return
    }

    toast.success("Password updated. Please log in.")
    router.push("/login?reset=success")
  }

  if (!token) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <p className={styles.panelKicker}>Reset password</p>
          <h1 className={styles.title}>Reset link invalid</h1>
          <p className={styles.subtitle}>
            This reset link is missing its token or has expired.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/forgot-password" className={styles.buttonSolid}>
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <p className={styles.panelKicker}>Reset password</p>
        <h1 className={styles.title}>Choose a new password</h1>
        <p className={styles.subtitle}>
          Enter a new password for your GWTH.ai account.
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
            name="password"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <FormLabel className={styles.label}>New password</FormLabel>
                <FormControl>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className={styles.error} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <FormLabel className={styles.label}>Confirm password</FormLabel>
                <FormControl>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
            {form.formState.isSubmitting ? "Updating..." : "Update password"}
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

export default function ResetPasswordPage() {
  // useSearchParams requires a Suspense boundary in Next App Router.
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
