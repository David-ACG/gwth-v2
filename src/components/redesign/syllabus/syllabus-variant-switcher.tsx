"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, ArrowUpRight } from "lucide-react"

const OPTIONS = [
  { slug: "syllabus-0", label: "0 · Current" },
  { slug: "syllabus-a", label: "A · Colour spine" },
  { slug: "syllabus-b", label: "B · Chapter blocks" },
  { slug: "syllabus-c", label: "C · Tinted fields" },
] as const

/**
 * Fixed-bottom switcher for the syllabus design comparison (W27). Kept
 * separate from the homepage VariantSwitcher so the two lists never mix.
 * Marked with data-syllabus-switcher so the screenshot script can hide it.
 */
export function SyllabusVariantSwitcher({
  current,
}: {
  current: "0" | "a" | "b" | "c"
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const currentTheme = mounted ? resolvedTheme : "light"

  return (
    <div
      data-syllabus-switcher=""
      role="navigation"
      aria-label="Syllabus design option switcher"
      className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 sm:bottom-5"
    >
      <div className="flex max-w-full items-center gap-1 overflow-x-auto border border-neutral-300 bg-white/95 p-1 text-[12px] font-medium shadow-lg backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-100">
        {OPTIONS.map((option) => {
          const isActive = option.slug === `syllabus-${current}`
          return (
            <Link
              key={option.slug}
              href={`/redesign/${option.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={
                "whitespace-nowrap px-2.5 py-1 transition-colors lg:px-3 lg:py-1.5 " +
                (isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800")
              }
            >
              {option.label}
            </Link>
          )
        })}
        <span className="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
        <button
          type="button"
          aria-label={
            currentTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          className="p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {currentTheme === "dark" ? (
            <Sun className="size-3.5" aria-hidden="true" />
          ) : (
            <Moon className="size-3.5" aria-hidden="true" />
          )}
        </button>
        <Link
          href="/course/applied-ai-skills"
          className="ml-1 hidden items-center gap-1 whitespace-nowrap px-3 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 sm:inline-flex"
        >
          Live page
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
