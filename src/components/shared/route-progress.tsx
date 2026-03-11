"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Spinner } from "./spinner"

/**
 * Route transition progress indicator.
 * Shows a top progress bar and small spinner during client-side navigation.
 * Detects route changes via pathname comparison, skipping the first change
 * (which is the initial hydration, not a real navigation).
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)
  const [isNavigating, setIsNavigating] = useState(false)
  const [changeCount, setChangeCount] = useState(0)

  // Render-time state derivation: detect when pathname prop changes.
  // changeCount tracks how many pathname changes we've seen. The first
  // change (count 0 → 1) is the initial mount/hydration, so we only
  // show the indicator from the second change onwards.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    const nextCount = changeCount + 1
    setChangeCount(nextCount)
    if (nextCount > 1) {
      setIsNavigating(true)
    }
  }

  // Auto-dismiss the indicator after 500ms.
  useEffect(() => {
    if (!isNavigating) return
    const id = setTimeout(() => setIsNavigating(false), 500)
    return () => clearTimeout(id)
  }, [isNavigating])

  if (!isNavigating) return null

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed inset-x-0 top-0 z-[100] h-0.5">
        <div className="h-full animate-progress bg-gradient-to-r from-primary via-accent to-primary" />
      </div>
      {/* Corner spinner */}
      <div className="fixed right-4 top-4 z-[100]">
        <Spinner size={20} />
      </div>
    </>
  )
}
