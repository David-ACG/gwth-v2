"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { loginSchema, type LoginFormData } from "@/lib/validations"
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
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons"

/**
 * Login form with OAuth social buttons and email/password validation.
 * Calls the signIn server action and redirects to dashboard on success.
 */
export function LoginForm() {
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">
          Log in to your account to continue learning
        </p>
      </CardHeader>
      <CardContent>
        <OAuthButtons />
        <OAuthDivider />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
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
              {form.formState.isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
