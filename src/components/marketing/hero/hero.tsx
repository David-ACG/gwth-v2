import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroDevice } from "./hero-device"

/**
 * Homepage hero. Two-column on desktop (copy left, device right);
 * stacked on mobile.
 *
 * Copy is locked from BRAND_BRIEF.md §3b. No fabricated trust line —
 * no learner counts, no avatars, no fake partnerships.
 *
 * Renders synchronously so the H1 owns LCP. The HeroDevice is a client
 * island; only its ScoreVis ring fill / sparkline animate, both gated on
 * prefers-reduced-motion.
 */
export function Hero() {
  return (
    <section data-section="hero" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              From ChatGPT basics to{" "}
              <span className="text-gradient">serious applied AI skill.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Learn to research faster, automate workflows, analyse data, create
              useful content, and build practical tools with AI-assisted coding.
            </p>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Start as a beginner. Move towards top 1% applied AI capability through
              lessons, Q&A, projects, capstones, and a verifiable GWTH Score.
            </p>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Built around UK examples, UK research, and GBP pricing. Anyone can join;
              other countries are launching soon.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Join the waitlist</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/labs">Try a free lab</Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDevice />
          </div>
        </div>
      </div>
    </section>
  )
}
