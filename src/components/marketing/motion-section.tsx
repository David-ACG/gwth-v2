"use client"

import * as React from "react"
import { motion, useReducedMotion, type MotionProps } from "motion/react"

type MotionSectionProps = Omit<React.ComponentPropsWithoutRef<"section">, keyof MotionProps> & {
  initial?: MotionProps["initial"]
  whileInView?: MotionProps["whileInView"]
  viewport?: MotionProps["viewport"]
  transition?: MotionProps["transition"]
  children: React.ReactNode
}

const DEFAULT_INITIAL: MotionProps["initial"] = { opacity: 0, y: 20 }
const DEFAULT_WHILE_IN_VIEW: MotionProps["whileInView"] = { opacity: 1, y: 0 }
const DEFAULT_VIEWPORT: MotionProps["viewport"] = { once: true, amount: 0.2 }
const DEFAULT_TRANSITION: MotionProps["transition"] = { duration: 0.5 }

/**
 * Reduced-motion-aware wrapper around `motion.section`.
 *
 * When the user prefers reduced motion, renders a plain `<section>` with no
 * animation props applied. Otherwise applies the supplied (or default)
 * Motion props for a subtle scroll-reveal entrance.
 *
 * This is the single enforcement point for WCAG 2.3.3 in the marketing/
 * module — section components must not import `motion.<element>` directly.
 */
export function MotionSection({
  initial = DEFAULT_INITIAL,
  whileInView = DEFAULT_WHILE_IN_VIEW,
  viewport = DEFAULT_VIEWPORT,
  transition = DEFAULT_TRANSITION,
  children,
  ...sectionProps
}: MotionSectionProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <section {...sectionProps}>{children}</section>
  }

  return (
    <motion.section
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      {...sectionProps}
    >
      {children}
    </motion.section>
  )
}
