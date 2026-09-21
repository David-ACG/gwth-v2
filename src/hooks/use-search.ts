"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Shared open/close state for the Cmd+K search palette.
 *
 * WHY A MODULE-LEVEL STORE AND NOT `useState` (gwth-launch-4fg):
 * this hook used to hold the open flag in a plain `useState`, so every caller
 * got its OWN copy. `DashboardHeader` called `open()` on its private copy and
 * `SearchPalette` kept reading its own, which never changed - the header's
 * Search button was wired to nothing. David, recording the live site on
 * 2026-07-27: "what does search do - nothing - so there's no way of using this
 * search button at the top, it's just there for show". Cmd+K happened to work
 * because the palette registered its own key listener, which hid the defect.
 *
 * The external-store shape follows `use-sidebar.ts`, the convention already in
 * this codebase for chrome state shared across the dashboard frame: one store,
 * no provider to thread through the layout, and `useSyncExternalStore` for a
 * tearing-free read during concurrent rendering.
 */
let searchOpen = false
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function setSearchOpen(next: boolean) {
  if (searchOpen === next) return
  searchOpen = next
  notifyListeners()
}

/**
 * Cmd+K / Ctrl+K toggles the palette; Escape closes it.
 *
 * Bound ONCE, when the first component subscribes, rather than once per hook
 * instance: with a single shared store, two instances would each toggle it and
 * the two toggles would cancel out, so the shortcut would do nothing at all.
 * Escape is left to the dialog itself where one is mounted, but handled here
 * too so the store cannot be left open by a caller that renders no dialog.
 */
function handleKeyDown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault()
    setSearchOpen(!searchOpen)
    return
  }
  if (event.key === "Escape") {
    setSearchOpen(false)
  }
}

function subscribe(callback: () => void): () => void {
  if (listeners.size === 0 && typeof document !== "undefined") {
    document.addEventListener("keydown", handleKeyDown)
  }
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && typeof document !== "undefined") {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }
}

function getSnapshot(): boolean {
  return searchOpen
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Reads and controls the Cmd+K search palette. Every caller sees the same
 * state, so the header's Search button and the palette itself agree.
 */
export function useSearch() {
  const isOpen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const open = useCallback(() => setSearchOpen(true), [])
  const close = useCallback(() => setSearchOpen(false), [])
  const toggle = useCallback(() => setSearchOpen(!searchOpen), [])

  return { isOpen, open, close, toggle }
}
