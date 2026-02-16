/**
 * Auth abstraction layer.
 * Currently returns mock data for development. The real auth provider
 * (e.g., Better Auth, Clerk, NextAuth) will be wired in later.
 * All components should import from this file, never from the auth provider directly.
 */

import type { User } from "@/lib/types"

/** Mock user for development */
const MOCK_USER: User = {
  id: "user_mock_001",
  name: "David",
  email: "david@agilecommercegroup.com",
  avatarUrl: null,
  bio: "Building with AI, one lesson at a time.",
  plan: "pro",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2026-02-15"),
}

/**
 * Returns the currently authenticated user, or null if not logged in.
 * In development, always returns the mock user.
 */
export async function getCurrentUser(): Promise<User | null> {
  return MOCK_USER
}

/**
 * Returns the current user or throws a redirect to the login page.
 * Use in server components/actions that require authentication.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    // In production, this would redirect to /login
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Checks whether a user is currently authenticated.
 * Useful for conditionally rendering auth-dependent UI.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}
