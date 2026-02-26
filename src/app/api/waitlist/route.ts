/**
 * Waitlist signup API route.
 * Validates name + email, then sends a confirmation email to the user
 * and a notification to the admin via MailerSend.
 */

import { z } from "zod"
import { subscribeToWaitlist } from "@/lib/data/email"

const waitlistBodySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = waitlistBodySchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid form data.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const result = await subscribeToWaitlist(parsed.data)

    return Response.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch {
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
