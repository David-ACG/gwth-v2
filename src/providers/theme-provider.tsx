"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Theme provider wrapper using next-themes.
 * Enables light/dark mode switching with system preference detection.
 * Uses class-based strategy for Tailwind CSS v4 compatibility.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
