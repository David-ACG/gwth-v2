"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { authClient } from "@/lib/auth-client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons"
import type { OAuthProviderId } from "@/lib/oauth-providers"
import styles from "@/components/auth/auth-fde.module.css"

/** Props for {@link LoginForm}. */
interface LoginFormProps {
  /**
   * Social providers with a registered app, computed server-side by the login
   * page via `getEnabledOAuthProviders()`. The whole OAuth block (buttons +
   * divider) is hidden while this is empty (W15 guard).
   */
  oauthProviders?: readonly OAuthProviderId[]
}

/**
 * Login form with OAuth social buttons and email/password validation, in the
 * FDE journal register (paper panel, square hairline inputs, mono labels).
 * Calls the authClient sign-in and redirects to dashboard on success.
 */
export function LoginForm({ oauthProviders = [] }: LoginFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })

    if (error) {
      // Friendly messages for the common cases Better Auth surfaces.
      const message = error.message ?? "Unable to log in"
      if (error.status === 401 || /invalid/i.test(message)) {
        setServerError("Invalid email or password")
      } else if (/verif/i.test(message)) {
        setServerError("Please check your email and confirm your account first")
      } else {
        setServerError(message)
      }
      return
    }

    // Beta access is enforced by the getCurrentUser() gate: an ungranted account
    // keeps its valid session but resolves to null there, so it lands on the
    // invite-required FreeDashboard view (no ?error param is emitted; the proxy
    // guard only bounces anonymous no-cookie traffic to the bare /login).
    toast.success("Welcome back!")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Log in to your account to continue learning.
        </p>
      </div>

      {oauthProviders.length > 0 && (
        <>
          <OAuthButtons providers={oauthProviders} />
          <OAuthDivider />
        </>
      )}

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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <div className={styles.labelRow}>
                  <FormLabel className={styles.label}>Password</FormLabel>
                  <Link href="/forgot-password" className={styles.inlineLink}>
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
            {form.formState.isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      </Form>

      <p className={styles.altPrompt}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={styles.link}>
          Sign up
        </Link>
      </p>
    </div>
  )
}
