"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import { signupSchema, type SignupFormData } from "@/lib/validations"
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

/**
 * Invite-only beta signup surface in the FDE journal register. The full
 * email/password registration form remains below as PostBetaSignupForm for
 * post-beta reactivation.
 */
export function SignupForm() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h1 className={styles.title}>Invite-only beta</h1>
        <p className={styles.subtitle}>
          The beta is closed to public signup. Access is granted manually by
          the GWTH team.
        </p>
      </div>
      <p className={styles.notice}>
        If you have been invited, sign in with a social provider (Google,
        GitHub or LinkedIn) using the email address GWTH approved. That first
        sign-in creates your account and applies your beta access. Otherwise,
        join the waitlist and we will contact you when more beta places open.
      </p>
      <div className={styles.actions}>
        <Link href="/login" className={styles.buttonSolid}>
          Log in
        </Link>
        <Link href="/" className={styles.buttonOutline}>
          Join the waitlist
        </Link>
      </div>
    </div>
  )
}

/** Props for {@link PostBetaSignupForm}. */
interface PostBetaSignupFormProps {
  /**
   * Social providers with a registered app (see `getEnabledOAuthProviders()`).
   * The OAuth block is hidden while this is empty (W15 guard).
   */
  oauthProviders?: readonly OAuthProviderId[]
}

/**
 * Post-beta public registration form (name, email, password) in the FDE
 * register. Dormant during the invite-only beta; kept wired to the authClient
 * sign-up so it can be re-enabled without a rebuild.
 */
export function PostBetaSignupForm({ oauthProviders = [] }: PostBetaSignupFormProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [submittedName, setSubmittedName] = useState("")
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: SignupFormData) {
    setServerError(null)
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    })

    if (error) {
      const message = error.message ?? "Unable to create account"
      if (/already|exists|registered/i.test(message)) {
        setServerError("This email is already registered. Try logging in instead.")
      } else {
        setServerError(message)
      }
      return
    }

    setSubmittedName(data.name.split(" ")[0] ?? data.name)
    setIsConfirmed(true)
    toast.success("Account created! Check your email.")
  }

  if (isConfirmed) {
    return (
      <div className={styles.panel}>
        <div className={styles.success} role="status">
          <div className={styles.panelHead}>
            <h1 className={styles.title}>Check your email, {submittedName}.</h1>
            <p className={styles.subtitle}>
              We&apos;ve sent you a confirmation link. Click it to activate your
              account and start learning.
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/why-gwth" className={styles.buttonSolid}>
              Why GWTH
            </Link>
            <Link href="/" className={styles.buttonOutline}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Sign up to start learning. We&apos;ll send you a confirmation email.
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
            name="password"
            render={({ field }) => (
              <FormItem className={styles.field}>
                <FormLabel className={styles.label}>Password</FormLabel>
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
            {form.formState.isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </Form>

      <p className={styles.altPrompt}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Log in
        </Link>
      </p>
    </div>
  )
}
