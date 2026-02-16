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
