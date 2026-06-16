"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

/**
 * Password reset landing page (MEDIUM #7).
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset link invalid</CardTitle>
          <p className="text-sm text-muted-foreground">
            This reset link is missing its token or has expired.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter a new password for your GWTH.ai account
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
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
