"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { signupSchema, type SignupFormData } from "@/lib/validations"
import { signUp } from "@/lib/actions/auth"
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
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react"
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons"

/**
 * Invite-only beta signup surface. The full Supabase registration form remains
 * below as PostBetaSignupForm for post-beta reactivation.
 */
export function SignupForm() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Invite-only beta</CardTitle>
        <p className="text-sm text-muted-foreground">
          The 23 June beta is closed to public signup. Access is granted
          manually by the GWTH team.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          If you have been invited, use the email address GWTH approved and
          log in once your account is ready. Otherwise, join the waitlist and
          we will contact you when more beta places open.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="gap-2" asChild>
            <Link href="/login">
              Log in
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/">Join the waitlist</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PostBetaSignupForm() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [submittedName, setSubmittedName] = useState("")
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: SignupFormData) {
    setServerError(null)
    const result = await signUp({
      name: data.name,
      email: data.email,
      password: data.password,
    })

    if (result.error) {
      if (result.error.includes("already registered")) {
        setServerError("This email is already registered. Try logging in instead.")
      } else {
        setServerError(result.error)
      }
      return
    }

    setSubmittedName(data.name.split(" ")[0] ?? data.name)
    setIsConfirmed(true)
    toast.success("Account created! Check your email.")
  }

  if (isConfirmed) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">
            Check your email, {submittedName}.
          </h2>
          <p className="mt-3 text-muted-foreground">
            We&apos;ve sent you a confirmation link. Click it to activate your
            account and start learning.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="gap-2" asChild>
              <Link href="/why-gwth">
                <ShieldCheck className="size-4" />
                Why GWTH
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/">
                Back to Home
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign up to start learning. We&apos;ll send you a confirmation email.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormLabel>Password</FormLabel>
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
                  <FormLabel>Confirm Password</FormLabel>
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
              {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
