"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Props for {@link ThemeToggle}.
 */
interface ThemeToggleProps {
  /** Extra classes merged onto the button (e.g. nav-specific palette overrides). */
  className?: string
}

/**
 * Light/dark mode toggle button with animated Sun/Moon icon transition.
 * The visible icon reflects the CURRENT mode (Sun in light, Moon in dark)
 * via CSS `dark:` variants, so no mounted-state hydration dance is needed.
 * Uses next-themes for persistence and system preference detection.
 * Used in both the public nav and dashboard header.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn("size-8", className)}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
