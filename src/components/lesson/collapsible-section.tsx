"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
  /** Header content — can be a string or JSX */
  title: React.ReactNode
  /** Content revealed when expanded */
  children: React.ReactNode
  /** Whether the section starts open */
  defaultOpen?: boolean
  /** Additional CSS classes for the outer wrapper */
  className?: string
}

/**
 * Animated expand/collapse section using Motion.
 * Chevron rotates 90 degrees on open. Used by deep-dive callouts
 * and optional supplementary content throughout lessons.
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn(className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        aria-expanded={isOpen}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="shrink-0"
        >
          <ChevronRight className="size-4 text-muted-foreground" />
        </motion.span>
        <span className="flex-1">{title}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
