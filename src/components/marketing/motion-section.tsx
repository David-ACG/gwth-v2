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
 * Renders a plain `<section>` on the server and during the first client
 * render so the section is fully visible (no opacity:0 from Motion's
 * initial state) before any animation logic runs. After mount, if the
 * user does not prefer reduced motion, upgrades to `motion.section`
 * with the supplied (or default) scroll-reveal props.
 *
 * This SSR-first pattern avoids the hydration trap where motion.section
 * applies inline `style="opacity:0"` on the server, the user prefers
 * reduced motion, and the animate transition never runs — leaving the
 * section invisible. It's also the single enforcement point for
 * WCAG 2.3.3 in the marketing/ module.
 */
export function MotionSection({
  initial = DEFAULT_INITIAL,
  whileInView = DEFAULT_WHILE_IN_VIEW,
  viewport = DEFAULT_VIEWPORT,
  transition = DEFAULT_TRANSITION,
  children,
  ...sectionProps
}: MotionSectionProps) {
  const [mounted, setMounted] = React.useState(false)
  const prefersReduced = useReducedMotion()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || prefersReduced) {
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
