"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import styles from "./review.module.css"

/**
 * Minimal light/dark toggle for the W12 review scaffolding (the review pages
 * live outside the public nav, which is where the real toggle sits). Guarded by
 * a mounted flag so the label does not cause a hydration mismatch.
 */
export function ReviewThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"
      }
      suppressHydrationWarning
    >
      {mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}
    </button>
  )
}
