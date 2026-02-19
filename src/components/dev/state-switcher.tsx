"use client"

import { useState, useSyncExternalStore } from "react"
import type { SubscriptionState } from "@/lib/types"
import { ENABLE_DEV_TOOLBAR } from "@/lib/config"

const STORAGE_KEY = "gwth-dev-subscription-state"

const STATE_OPTIONS: { value: SubscriptionState; label: string; color: string }[] = [
  { value: "visitor", label: "Visitor", color: "bg-gray-400" },
  { value: "registered", label: "Registered", color: "bg-blue-400" },
  { value: "month1", label: "Month 1", color: "bg-emerald-400" },
  { value: "month2", label: "Month 2", color: "bg-emerald-500" },
  { value: "month3", label: "Month 3", color: "bg-emerald-600" },
  { value: "ongoing", label: "Ongoing", color: "bg-purple-500" },
  { value: "lapsed", label: "Lapsed", color: "bg-red-400" },
]

const DEFAULT_STATE: SubscriptionState = "month3"

/** Reads saved subscription state from localStorage (client-only) */
function getSnapshot(): SubscriptionState {
  const saved = localStorage.getItem(STORAGE_KEY) as SubscriptionState | null
  if (saved && STATE_OPTIONS.some((o) => o.value === saved)) return saved
  return DEFAULT_STATE
}

/** Server snapshot always returns the default */
function getServerSnapshot(): SubscriptionState {
  return DEFAULT_STATE
}

/** Subscribe is a no-op — we only read on mount and update via handleSelect */
function subscribe(): () => void {
  return () => {}
}

/**
 * Dev-only floating toolbar for switching between subscription states.
 * Persists selection to localStorage. Only renders in development.
 */
export function DevStateSwitcher() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [isOpen, setIsOpen] = useState(false)

  if (!ENABLE_DEV_TOOLBAR) return null

  const current = STATE_OPTIONS.find((o) => o.value === state)!

  function handleSelect(value: SubscriptionState) {
    localStorage.setItem(STORAGE_KEY, value)
    setIsOpen(false)
    // Reload the page so server components re-render with the new state
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {isOpen && (
        <div className="mb-2 rounded-lg border bg-card p-2 shadow-xl">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Subscription State
          </p>
          {STATE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                state === option.value ? "bg-muted font-medium" : ""
              }`}
            >
              <span
                className={`size-2.5 rounded-full ${option.color}`}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-lg transition-colors hover:bg-muted"
        title="Dev: Switch subscription state"
      >
        <span className={`size-2.5 rounded-full ${current.color}`} />
        DEV: {current.label}
      </button>
    </div>
  )
}
