"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { Spinner } from "./spinner"

/**
 * Route transition progress indicator.
 * Shows a top progress bar and small spinner during client-side navigation.
 * Visible in the top-right corner during page transitions.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [prevPathname, setPrevPathname] = useState(pathname)

  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname)
      setIsNavigating(true)
      const timeout = setTimeout(() => setIsNavigating(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [pathname, prevPathname])

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
