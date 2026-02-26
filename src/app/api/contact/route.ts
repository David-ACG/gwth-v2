/**
 * Contact form API route.
 * Validates input with Zod, then delegates to the email stub.
 * In production: sends to david@agilecommercegroup.com via MailerSend.
 */

import { contactSchema } from "@/lib/validations"
import { submitContactForm } from "@/lib/data/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

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

    const result = await submitContactForm(parsed.data)

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
