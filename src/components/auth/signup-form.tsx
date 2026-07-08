"use client"

import { useState, type ReactNode } from "react"
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
 * Invite-only beta signup surface in the FDE journal register. Renders the
 * real registration form under invite-only framing: an invited tester creates
 * their account here with the email address GWTH approved, and the Better
 * Auth create hook applies the pre-registered beta grant automatically.
 * Un-invited visitors can still register but get free labs only (W8), so the
 * open form does not open the beta.
 */
export function SignupForm({ oauthProviders = [] }: PostBetaSignupFormProps) {
  return (
    <PostBetaSignupForm
      oauthProviders={oauthProviders}
      title="Invite-only beta"
      subtitle="The beta is closed to public signup. Access is granted manually by the GWTH team."
      notice={
        <>
          If you have been invited, create your account below with the exact
          email address GWTH approved; your beta access is applied
          automatically at signup. Not invited yet?{" "}
          <Link href="/waitlist" className={styles.link}>
            Join the waitlist
          </Link>{" "}
          and we will contact you when more beta places open.
        </>
      }
    />
  )
}

/** Props for {@link PostBetaSignupForm}. */
interface PostBetaSignupFormProps {
  /**
   * Social providers with a registered app (see `getEnabledOAuthProviders()`).
   * The OAuth block is hidden while this is empty (W15 guard).
   */
  oauthProviders?: readonly OAuthProviderId[]
  /** Panel headline; defaults to the public post-beta copy. */
  title?: string
  /** Panel sub-headline; defaults to the public post-beta copy. */
  subtitle?: string
  /** Optional notice paragraph rendered between the head and the form. */
  notice?: ReactNode
}

/**
 * Post-beta public registration form (name, email, password) in the FDE
 * register. Dormant during the invite-only beta; kept wired to the authClient
 * sign-up so it can be re-enabled without a rebuild.
 */
export function PostBetaSignupForm({
  oauthProviders = [],
  title = "Create your account",
  subtitle = "Sign up to start learning. We'll send you a confirmation email.",
  notice,
}: PostBetaSignupFormProps) {
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
        <p className={styles.panelKicker}>Create account</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      {notice && <p className={styles.notice}>{notice}</p>}

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
