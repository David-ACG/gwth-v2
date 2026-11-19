"use client"

import { useEffect } from "react"

/**
 * Marks, in the contents list, the section the reader is in
 * (`aria-current="location"` on its link). It renders nothing and changes no
 * text. Without JavaScript the contents list is simply a list of links.
 */
export function LegalSpy() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-legal]")
    if (!root || typeof IntersectionObserver === "undefined") return
    const links = [...root.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')]
    const byId = new Map<string, HTMLAnchorElement>()
    for (const link of links) byId.set(decodeURIComponent(link.hash.slice(1)), link)
    const headings = [...byId.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!headings.length) return

    let current: string | null = null
    function mark() {
      // The section being read is the last heading that has passed the top
      // third of the window.
      const line = window.innerHeight * 0.33
      let id: string | null = null
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) id = heading.id
        else break
      }
      if (id === current) return
      if (current) byId.get(current)?.removeAttribute("aria-current")
      if (id) byId.get(id)?.setAttribute("aria-current", "location")
      current = id
    }

    const observer = new IntersectionObserver(mark, {
      rootMargin: "0px 0px -67% 0px",
      threshold: [0, 1],
    })
    for (const heading of headings) observer.observe(heading)
    window.addEventListener("scroll", mark, { passive: true })
    mark()
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", mark)
    }
  }, [])

  return null
}
