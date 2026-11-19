"use client"

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react"

/**
 * Marks its element once it has scrolled into view, so the stylesheet can run
 * one quiet entrance (a row settling into place, a bar drawing to its length).
 *
 * Safe by construction:
 * - The server render and a browser without JavaScript show everything as it
 *   finally looks. Nothing is hidden until this effect has run.
 * - It does nothing at all when the visitor prefers reduced motion.
 * - An element already on screen when the page loads is left alone, so nothing
 *   above the fold blinks out and back in after hydration.
 *
 * `data-armed` means "waiting to be seen"; `data-in` means "seen". The motion
 * itself lives in `why-gwth-next.module.css`, inside a
 * `prefers-reduced-motion: no-preference` block.
 */
export function InView({
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window.matchMedia !== "function") return
    if (typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return

    el.setAttribute("data-armed", "")
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.setAttribute("data-in", "")
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  )
}
