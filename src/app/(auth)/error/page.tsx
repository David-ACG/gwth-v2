import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import styles from "@/components/auth/auth-fde.module.css"

export const metadata: Metadata = {
  title: "Sign-in Error",
  description: "Something went wrong while signing you in.",
}

/**
 * OAuth / auth error landing page (MEDIUM #6), in the FDE journal register.
 *
 * Better Auth routes ALL OAuth callback failures to `${baseURL}/error?error=…`.
 * Without a routable page here those failures 404 (the (auth) error.tsx files
 * are error BOUNDARIES, not a `/error` ROUTE). This is a public, logged-out
 * reachable page; the (auth) route group adds no path segment, so the route is
 * `/error`. In Next 16 `searchParams` is a Promise and must be awaited.
 */
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const { error, error_description } = await searchParams

  const description =
    error_description ??
    "We couldn't complete your sign-in. This can happen if the request expired or was cancelled. Please try again."

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <p className={styles.panelKicker}>Sign-in error</p>
        <h1 className={styles.title}>Sign-in didn&apos;t work</h1>
        <p className={styles.subtitle}>{description}</p>
      </div>

      {error && (
        <p className={styles.serverError} role="alert">
          <AlertTriangle aria-hidden="true" />
          Error: {error}
        </p>
      )}

      <div className={styles.actions}>
        <Link href="/login" className={styles.buttonSolid}>
          Back to log in
        </Link>
        <Link href="/" className={styles.buttonOutline}>
          Home
        </Link>
      </div>
    </div>
  )
}
