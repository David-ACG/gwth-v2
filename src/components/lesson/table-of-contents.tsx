"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/** A single heading entry in the TOC */
export interface TocHeading {
  /** The heading's id attribute for scrolling */
  id: string
  /** Display text */
  text: string
  /** Heading level (2 or 3) */
  level: 2 | 3
}

interface TableOfContentsProps {
  /** Array of headings extracted from lesson content */
  headings: TocHeading[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Right-side sticky table of contents with scroll-spy.
 * Extracts H2/H3 headings and highlights the active one using
 * Intersection Observer. Hidden below 1024px.
 * Smooth-scrolls on click without adding anchors to the URL.
 */
export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting from the top
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  function handleClick(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <nav
      className={cn("hidden lg:block w-[200px] shrink-0", className)}
      aria-label="Table of contents"
    >
      <div className="sticky top-24">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-1.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => handleClick(heading.id)}
                className={cn(
                  "block w-full text-left text-sm transition-colors hover:text-foreground",
                  heading.level === 3 && "pl-3",
                  activeId === heading.id
                    ? "font-medium text-primary"
                    : "text-muted-foreground",
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
