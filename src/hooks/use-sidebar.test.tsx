/**
 * useReadingMode: the app rail collapses while a lesson is open and comes back
 * on the way out (David picked option C in the 2026-07-26 layout audit).
 *
 * The two things worth pinning: reading mode must not persist into
 * localStorage (or the dashboard would silently collapse too), and it must not
 * override a reader who has already collapsed the rail by hand.
 */
import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { useReadingMode, useSidebar } from "./use-sidebar"

const STORAGE_KEY = "gwth-sidebar-open"

afterEach(() => {
  localStorage.clear()
})

describe("useReadingMode", () => {
  it("collapses the rail while active and restores it on exit", () => {
    localStorage.setItem(STORAGE_KEY, "true")
    const sidebar = renderHook(() => useSidebar())
    expect(sidebar.result.current.isOpen).toBe(true)

    const reading = renderHook(() => useReadingMode(true))
    sidebar.rerender()
    expect(sidebar.result.current.isOpen).toBe(false)
    // the collapse is a per-surface default, never a stored preference
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true")

    reading.unmount()
    sidebar.rerender()
    expect(sidebar.result.current.isOpen).toBe(true)
  })

  it("leaves a rail the reader collapsed by hand alone", () => {
    localStorage.setItem(STORAGE_KEY, "false")
    const sidebar = renderHook(() => useSidebar())
    sidebar.result.current.close()
    sidebar.rerender()
    expect(sidebar.result.current.isOpen).toBe(false)

    const reading = renderHook(() => useReadingMode(true))
    reading.unmount()
    sidebar.rerender()
    // still collapsed: exiting a lesson must not open a rail he shut himself
    expect(sidebar.result.current.isOpen).toBe(false)
  })

  it("does nothing when inactive", () => {
    localStorage.setItem(STORAGE_KEY, "true")
    const sidebar = renderHook(() => useSidebar())
    sidebar.result.current.open()
    renderHook(() => useReadingMode(false))
    sidebar.rerender()
    expect(sidebar.result.current.isOpen).toBe(true)
  })
})
