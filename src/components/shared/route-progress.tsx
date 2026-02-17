"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Spinner } from "./spinner"

/**
 * Route transition progress indicator.
 * Shows a top progress bar and small spinner during client-side navigation.
 * Detects route changes via render-time state comparison (React recommended pattern),
 * then auto-dismisses after 500ms.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)
  const [isNavigating, setIsNavigating] = useState(false)

  // Render-time state derivation: detect when pathname prop changes.
  // This is the React-recommended pattern for synchronizing derived state
  // with props, avoiding the need for effects. See:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsNavigating(true)
  }

  // Auto-dismiss the indicator after 500ms.
  // The setTimeout callback is asynchronous, so this is not a synchronous
  // setState inside an effect.
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
