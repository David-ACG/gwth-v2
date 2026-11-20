"use client"

import { useEffect } from "react"

/**
 * Two small conveniences on top of a choice that already works without any
 * script (it is two radio buttons and CSS):
 *
 * 1. **The address follows the choice.** A visitor who picks "I run a team"
 *    and forwards the link sends a page that opens on the same choice
 *    (`?for=team`). The address is rewritten in place: no history entry, no
 *    reload.
 * 2. **Links to the other choice switch it in place.** A link carrying
 *    `data-audience` (for example "the choice for institutions") ticks that
 *    radio button and scrolls back to the choice, instead of loading the page
 *    again. Without script the same link is an ordinary address that opens
 *    the page on that choice.
 */
export function AudienceSync() {
  useEffect(() => {
    function setAddress(audience: string, hash = "") {
      const url = new URL(window.location.href)
      url.searchParams.set("for", audience)
      url.hash = hash
      window.history.replaceState(window.history.state, "", url)
    }

    function onChange(event: Event) {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || input.name !== "audience") return
      if (input.checked) setAddress(input.value)
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>("a[data-audience]")
      const audience = link?.dataset.audience
      if (!audience) return
      const input = document.querySelector<HTMLInputElement>(
        `input[name="audience"][value="${audience}"]`
      )
      const choose = document.getElementById("choose")
      if (!input || !choose) return
      // Handled here, so the link does not navigate.
      event.preventDefault()
      input.checked = true
      setAddress(audience, "choose")
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      choose.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" })
      input.focus({ preventScroll: true })
    }

    document.addEventListener("change", onChange)
    // Capture, so this runs before the router's own click handling.
    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("change", onChange)
      document.removeEventListener("click", onClick, true)
    }
  }, [])
  return null
}
