"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, ArrowUpRight } from "lucide-react"

const VARIANTS = [
  { slug: "v-a", label: "A · Field Notebook" },
  { slug: "v-b", label: "B · Modern Technical" },
  { slug: "v-c", label: "C · Quiet Essay" },
  { slug: "v-d", label: "D · Supportive Learning" },
] as const

/**
 * Fixed-bottom variant switcher. Renders on every /redesign page so a
 * reviewer can compare variants side-by-side in the same browser tab.
 *
 * The switcher is purely a navigation aid — it has no impact on the
 * variant pages themselves and is hidden when promoted to production.
 */
export function VariantSwitcher() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const currentSlug = pathname.split("/").filter(Boolean)[1]
  const currentTheme = mounted ? resolvedTheme : "light"

  return (
    <div
      role="navigation"
      aria-label="Redesign variant switcher"
      className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 sm:bottom-5"
    >
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-neutral-200 bg-white/90 p-1 text-[12px] font-medium shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100">
        <Link
          href="/redesign"
          className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 sm:inline"
        >
          Index
        </Link>
        <span className="mx-1 hidden h-4 w-px bg-neutral-200 dark:bg-neutral-700 sm:inline-block" />
        {VARIANTS.map((v) => {
          const isActive = currentSlug === v.slug
          return (
            <Link
              key={v.slug}
              href={`/redesign/${v.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={
                "whitespace-nowrap rounded-full px-3 py-1.5 transition-colors " +
                (isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800")
              }
            >
              <span className="sm:hidden">{v.label.slice(0, 1)}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </Link>
          )
        })}
        <span className="mx-1 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
        <button
          type="button"
          aria-label={
            currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          className="rounded-full p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {currentTheme === "dark" ? (
            <Sun className="size-3.5" aria-hidden="true" />
          ) : (
            <Moon className="size-3.5" aria-hidden="true" />
          )}
        </button>
        <Link
          href="/"
          className="ml-1 hidden items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 sm:inline-flex"
        >
          Live homepage
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
