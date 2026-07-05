"use client"

import { useTheme } from "next-themes"
import styles from "./review.module.css"

/**
 * Minimal light/dark toggle for the W12 review scaffolding (the review pages
 * live outside the public nav, which is where the real toggle sits). The label
 * is driven by CSS `dark:` variants rather than a mounted-state hydration dance,
 * so it renders identically on the server and client (no hydration mismatch).
 */
export function ReviewThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <span className="hidden dark:inline">Light mode</span>
      <span className="inline dark:hidden">Dark mode</span>
    </button>
  )
}
