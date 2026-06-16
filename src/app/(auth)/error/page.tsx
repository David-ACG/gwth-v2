import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign-in Error",
  description: "Something went wrong while signing you in.",
}

/**
 * OAuth / auth error landing page (MEDIUM #6).
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign-in didn&apos;t work</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Error: {error}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="gap-2" asChild>
            <Link href="/login">
              Back to log in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
