"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ArrowRight } from "lucide-react"

/**
 * Animated hero section with cascading blurred spiral layers, gradient text, and CTAs.
 * Spirals rotate at different speeds and directions for a depth-of-field effect.
 * Respects prefers-reduced-motion.
 */
export function HeroSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Cascading spiral layers — different blur levels, speeds, and directions */}
      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {/* Layer 1 — furthest back, most blurred, slowest */}
          <div className="absolute top-[-20%] right-[-30%] w-[800px] h-[800px] animate-[spin_120s_linear_infinite]">
            <Image
              src="/logo-spiral-blur-25.svg"
              alt=""
              fill
              className="object-contain opacity-12 dark:opacity-8"
              priority
            />
          </div>
          {/* Layer 2 — reverse rotation */}
          <div className="absolute top-[-5%] right-[-15%] w-[650px] h-[650px] animate-[spin_80s_linear_infinite_reverse]">
            <Image
              src="/logo-spiral-blur-18.svg"
              alt=""
              fill
              className="object-contain opacity-18 dark:opacity-12"
            />
          </div>
          {/* Layer 3 */}
          <div className="absolute top-[10%] right-[0%] w-[500px] h-[500px] animate-[spin_55s_linear_infinite]">
            <Image
              src="/logo-spiral-blur-12.svg"
              alt=""
              fill
              className="object-contain opacity-25 dark:opacity-18"
            />
          </div>
          {/* Layer 4 — closest, sharpest, fastest */}
          <div className="absolute top-[20%] right-[10%] w-[380px] h-[380px] animate-[spin_40s_linear_infinite_reverse]">
            <Image
              src="/logo-spiral-blur-6.svg"
              alt=""
              fill
              className="object-contain opacity-30 dark:opacity-22"
            />
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 md:py-32 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Learn to Build with{" "}
              <span className="text-gradient">
                Artificial Intelligence
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Master AI development with hands-on courses, real-world labs, and
            interactive quizzes. From fundamentals to production-ready applications.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Start Learning
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid max-w-lg grid-cols-3 gap-8"
          initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {[
            { value: "15+", label: "Lessons" },
            { value: "5", label: "Hands-on Labs" },
            { value: "3", label: "Full Courses" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-primary sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
