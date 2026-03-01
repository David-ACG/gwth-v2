"use server"

/**
 * Server Actions for authentication (signup, login, logout, password reset).
 * These are called from Client Components and run on the server.
 * Uses the cookie-based Supabase client so session cookies are set automatically.
 */

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Signs up a new user with email and password.
 * Sends a confirmation email — user must click the link to activate their account.
 * Returns an error message on failure, or null on success.
 */
export async function signUp(formData: {
  name: string
  email: string
  password: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Signs in a user with email and password.
 * Returns an error message on failure, or null on success.
 */
export async function signIn(formData: {
  email: string
  password: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    // Provide user-friendly error messages
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password" }
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please check your email and confirm your account first" }
    }
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Signs out the current user and redirects to the home page.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

/**
 * Sends a password reset email.
 * Returns an error message on failure, or null on success.
 */
export async function resetPassword(
  email: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/settings`,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
