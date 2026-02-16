"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { waitlistSchema, type WaitlistFormData } from "@/lib/validations"
import { subscribeToWaitlist } from "@/lib/data/email"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

/**
 * Waitlist signup form with email validation.
 * Uses react-hook-form + zod for validation, Sonner for feedback.
 */
export function WaitlistForm() {
  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "", name: "" },
  })

  async function onSubmit(data: WaitlistFormData) {
    const result = await subscribeToWaitlist(data)
    if (result.success) {
      toast.success(result.message)
      form.reset()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>
    </Form>
  )
}
