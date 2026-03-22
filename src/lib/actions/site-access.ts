"use server"

import { cookies } from "next/headers"

/** Cookie name for site access password */
const SITE_ACCESS_COOKIE = "site_access"

/** Cookie max age: 30 days */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Validates the site access password and sets a cookie on success.
 * Returns { success: true } if password matches, { success: false, error } otherwise.
 */
export async function verifySitePassword(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    // If no password is configured, allow access
    return { success: true }
  }

  if (password !== sitePassword) {
    return { success: false, error: "Incorrect password" }
  }

  const cookieStore = await cookies()
  cookieStore.set(SITE_ACCESS_COOKIE, "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return { success: true }
}
