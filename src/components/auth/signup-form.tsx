"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
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
import { CheckCircle2, ArrowRight, Radar } from "lucide-react"

/** Waitlist-only schema — just name and email, no password. */
const waitlistFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

type WaitlistFormData = z.infer<typeof waitlistFormSchema>

/**
 * Waitlist signup form — collects name and email, sends a confirmation email,
 * and shows a success screen. No account creation or dashboard redirect.
 */
export function SignupForm() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [submittedName, setSubmittedName] = useState("")

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: { name: "", email: "" },
  })

  async function onSubmit(data: WaitlistFormData) {
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.message ?? "Something went wrong. Please try again.")
        return
      }

      setSubmittedName(data.name.split(" ")[0] ?? data.name)
      setIsConfirmed(true)
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  if (isConfirmed) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">You&apos;re on the list, {submittedName}.</h2>
          <p className="mt-3 text-muted-foreground">
            We have sent you a confirmation email. You will be among the first to
            know when the course launches.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="gap-2" asChild>
              <Link href="/tech-radar">
                <Radar className="size-4" />
                Explore the Tech Radar
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
        <CardTitle className="text-2xl">Join the Earlybird Waitlist</CardTitle>
        <p className="text-sm text-muted-foreground">
          Be first to access the course when it launches. We will send you a
          confirmation email.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Joining waitlist..." : "Join the Waitlist"}
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
