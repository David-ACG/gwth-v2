"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ArrowRight, Radar } from "lucide-react"

/**
 * Animated hero section with cascading blurred spiral layers, GWTH headline, and CTAs.
 * Copy from design-requirements: "Stop watching AI change the world. Start building with it."
 */
export function HeroSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Cascading spiral layers */}
      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute top-[-20%] right-[-30%] h-[800px] w-[800px] animate-[spin_120s_linear_infinite]">
            <Image src="/logo-spiral-blur-25.svg" alt="" fill className="object-contain opacity-12 dark:opacity-8" priority />
          </div>
          <div className="absolute top-[-5%] right-[-15%] h-[650px] w-[650px] animate-[spin_80s_linear_infinite_reverse]">
            <Image src="/logo-spiral-blur-18.svg" alt="" fill className="object-contain opacity-18 dark:opacity-12" />
          </div>
          <div className="absolute top-[10%] right-[0%] h-[500px] w-[500px] animate-[spin_55s_linear_infinite]">
            <Image src="/logo-spiral-blur-12.svg" alt="" fill className="object-contain opacity-25 dark:opacity-18" />
          </div>
          <div className="absolute top-[20%] right-[10%] h-[380px] w-[380px] animate-[spin_40s_linear_infinite_reverse]">
            <Image src="/logo-spiral-blur-6.svg" alt="" fill className="object-contain opacity-30 dark:opacity-22" />
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-32 lg:px-8">
        <div className="max-w-2xl">
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Built in the UK. For the world.
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Stop watching AI change the world.{" "}
              <span className="text-gradient">Start building with it.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Learn to build apps, automate workflows, research faster, create content,
              analyse data, and solve real problems using AI — all in plain English.
              Built in the UK by practitioners, not marketers. Independent of any vendor
              or government programme.
            </p>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              One course. Three months to get started. Five hours a week. Updated every day
              so your skills never go stale. Designed to be practical, enjoyable, and immediately useful.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Join the Earlybird Waitlist
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/tech-radar">
                <Radar className="size-4" />
                Explore the Tech Radar
              </Link>
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
            { value: "94", label: "Hands-on Projects" },
            { value: "60+", label: "AI Tools Tracked" },
            { value: "3", label: "Months to Get Started" },
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
