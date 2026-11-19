"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"
import styles from "./reveal.module.css"

/**
 * One quiet entrance for a block as the reader reaches it: it rises a little
 * and fades in. Used by the small public pages (free lesson, waitlist,
 * contact, gift, legal), in the same spirit as the home page's motion.
 *
 * Safe by construction:
 * - The server render, a browser without JavaScript, a visitor who prefers
 *   reduced motion and a browser driven by automation (`navigator.webdriver`:
 *   screenshot scripts and test robots) all show the block as it finally
 *   looks. Nothing is hidden until this effect has run.
 * - A block already on screen when the page loads is left alone, so nothing
 *   above the fold blinks out and back in after hydration.
 * - Only opacity and transform move, so nothing is laid out again.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode
  className?: string
  /** Milliseconds to wait once in view, to stagger a row. */
  delay?: number
  as?: "div" | "li" | "section"
  id?: string
  "data-testid"?: string
  "data-section"?: string
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window.matchMedia !== "function") return
    if (typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (navigator.webdriver) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return

    el.setAttribute("data-reveal", "armed")
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.setAttribute("data-reveal", "in")
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined
  const props = {
    ...rest,
    className: className ? `${styles.reveal} ${className}` : styles.reveal,
    style,
  }
  if (Tag === "li") return <li ref={(n) => { ref.current = n }} {...props}>{children}</li>
  if (Tag === "section") return <section ref={(n) => { ref.current = n }} {...props}>{children}</section>
  return <div ref={(n) => { ref.current = n }} {...props}>{children}</div>
}
