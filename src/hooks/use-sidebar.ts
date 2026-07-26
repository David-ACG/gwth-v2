"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { MOBILE_BREAKPOINT } from "@/lib/config"

const STORAGE_KEY = "gwth-sidebar-open"

// External store for sidebar open state backed by localStorage
let sidebarOpen = true
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((l) => l())
}

function subscribeSidebar(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSidebarSnapshot(): boolean {
  return sidebarOpen
}

function getServerSidebarSnapshot(): boolean {
  return true
}

// Initialize from localStorage on module load (client only)
if (typeof window !== "undefined") {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    sidebarOpen = stored === "true"
  }
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    sidebarOpen = false
  }
}

// Mobile detection store
function subscribeMobile(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener("resize", handler)
  return () => window.removeEventListener("resize", handler)
}

function getMobileSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerMobileSnapshot(): boolean {
  return false
}

/**
 * Manages sidebar open/close state with localStorage persistence.
 * Automatically collapses on mobile viewports.
 */
export function useSidebar() {
  const isOpen = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  )

  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot
  )

  // Auto-close on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      sidebarOpen = false
      notifyListeners()
    }
  }, [isMobile])

  const toggle = useCallback(() => {
    sidebarOpen = !sidebarOpen
    localStorage.setItem(STORAGE_KEY, String(sidebarOpen))
    notifyListeners()
  }, [])

  const open = useCallback(() => {
    sidebarOpen = true
    localStorage.setItem(STORAGE_KEY, "true")
    notifyListeners()
  }, [])

  const close = useCallback(() => {
    sidebarOpen = false
    localStorage.setItem(STORAGE_KEY, "false")
    notifyListeners()
  }, [])

  return { isOpen, isMobile, toggle, open, close }
}

/**
 * Collapse the app rail while a reading surface is open, and put it back on the
 * way out.
 *
 * David picked option C in the 2026-07-26 demo-path audit: a lesson page was
 * spending 528px of a 1440px screen on navigation before a word of the lesson
 * appeared. Collapsing the rail is the sidebar's own existing state, so this is
 * a default rather than a new mode.
 *
 * It deliberately does NOT write STORAGE_KEY: reading is a per-surface default,
 * and persisting it would silently collapse the dashboard too. A collapse the
 * reader makes by hand still persists, through toggle/close as before, and is
 * respected here - the rail is only auto-collapsed when it was open on entry,
 * and only that auto-collapse is undone on exit.
 */
export function useReadingMode(active: boolean): void {
  useEffect(() => {
    if (!active) return
    if (!sidebarOpen) return // already collapsed: leave the reader's choice alone
    sidebarOpen = false
    notifyListeners()
    return () => {
      const stored =
        typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY)
      sidebarOpen = stored === null ? true : stored === "true"
      notifyListeners()
    }
  }, [active])
}
