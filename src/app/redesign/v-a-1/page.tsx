import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { HeroDevice } from "@/components/marketing/hero/hero-device"
import {
  JOURNEYS,
  PRODUCT_PILLARS,
  PRICING,
  UK_STATS,
  RESEARCH_SOURCES,
} from "@/components/marketing/data"

export const metadata = {
  title: "A1 · Field Notebook · Refined · Redesign",
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"] as const

/**
 * Variant A1 — "Field Notebook · Refined Editorial"
 *
 * Direct evolution of Variant A. Keeps the calm asymmetric, type-led
 * structure but tunes typography balance, swaps numbered markers to
 * Roman numerals, refines the masthead, and tightens hero rhythm.
 * Same Albert Sans + JetBrains Mono palette.
 */
export default function VariantA1() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="a"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav — refined masthead ───────────────────────────── */}
      <header className="border-b border-border/60 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/redesign/v-a-1" className="flex items-baseline gap-3">
            <span className="text-base font-semibold tracking-tight">
              GWTH.ai
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              No. 01 · Spring 2026
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] text-muted-foreground md:flex">
            <Link href="#course" className="transition-colors hover:text-foreground">
              The course
            </Link>
            <Link href="#credential" className="transition-colors hover:text-foreground">
              The credential
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-md px-3 py-1.5 text-[14px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Hero — refined rhythm ─────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
          <div className="grid items-start gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div className="max-w-2xl pt-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Volume I — A 3-month AI course
              </p>
              <h1 className="mt-8 text-[44px] font-semibold leading-[1.04] tracking-[-0.022em] sm:text-[56px] md:text-[64px]">
                Stop watching AI change the world.{" "}
                <span className="text-gradient">Start building with it.</span>
              </h1>
              <p className="mt-8 max-w-xl text-[18px] leading-[1.7] text-muted-foreground">
                Five hours a week. Ninety-four hands-on projects. Three monthly
                modules. Plain English in, working AI tools out — we assume zero
                Python.
              </p>
              <p className="mt-4 max-w-xl text-[18px] leading-[1.7] text-muted-foreground">
                Every project you ship updates a verifiable credential UK
                employers can check on the spot.
              </p>

              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:translate-y-[-1px] hover:shadow-md"
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#credential"
                  className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  See how the score works
                </Link>
              </div>

              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Independent · UK-grounded · Made for practitioners
              </p>
            </div>

            <div className="flex justify-center lg:justify-end lg:pt-4">
              <HeroDevice />
            </div>
          </div>
        </div>

        {/* Refined research strip */}
        <div className="border-y border-border/60">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
            <div className="flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Built around UK research from
              </p>
              <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] font-medium">
                {RESEARCH_SOURCES.map((s) => (
                  <li key={s} className="flex items-center gap-1.5">
                    <span
                      className="size-1 rounded-full bg-foreground/55"
                      aria-hidden="true"
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Journey grid — Roman numerals ────────────────────────── */}
      <section id="course" className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Chapter II — Six readers
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.018em] sm:text-4xl md:text-[44px]">
              Different reasons. Same course.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-[1.7] text-muted-foreground">
              Pick the row that fits — they all end up at the same proof.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j, i) => (
              <li key={j.n}>
                <Link
                  href={j.href}
                  className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider " +
                        (j.accent === "mint"
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary")
                      }
                    >
                      {j.tag}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                      {ROMAN[i]}.
                    </span>
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold leading-[1.3] tracking-[-0.01em]">
                    {j.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.65] text-muted-foreground">
                    {j.body}
                  </p>
                  {j.stat && (
                    <div
                      className={
                        "mt-5 rounded-xl px-3.5 py-2.5 " +
                        (j.accent === "mint"
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary")
                      }
                    >
                      <div className="text-xl font-bold tracking-tight">
                        {j.stat.value}
                      </div>
                      <div className="text-[11px] opacity-80">{j.stat.label}</div>
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-6 text-[13px] font-medium text-foreground">
                    <span>{j.cta}</span>
                    <ArrowRight
                      className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Pillars — Mint DRENCH ────────────────────────────────── */}
      <section id="credential" className="variant-drench">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-75">
              Chapter III — The product
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.018em] sm:text-4xl md:text-[52px]">
              94 projects. One score. Plain English.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-[1.65] opacity-85">
              Three pillars carry the whole course. Each one is the answer to a
              question UK adults asked us first.
            </p>
          </div>

          <ol className="mt-16 grid gap-12 md:grid-cols-3">
            {PRODUCT_PILLARS.map((p, i) => (
              <li key={p.n} className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-75">
                  {ROMAN[i]}. {p.label}
                </span>
                <h3 className="mt-5 text-[24px] font-semibold leading-[1.2] tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="mt-5 text-[15px] leading-[1.7] opacity-85">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── Stats ────────────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Chapter IV — The UK gap
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.018em] sm:text-4xl">
              UK workers and businesses are falling behind on AI.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {UK_STATS.map((stat) => (
              <article
                key={stat.value}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div
                  className="text-5xl font-bold tracking-[-0.02em] text-foreground sm:text-6xl"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  {stat.value}
                </div>
                <p className="mt-4 text-[14px] leading-[1.65] text-muted-foreground">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-10 font-mono text-[11px] text-muted-foreground">
            Source: UK Government / DSIT (Jan 2026) · {RESEARCH_SOURCES.join(" · ")}
          </p>
        </div>
      </section>

      {/* ───── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Chapter V — Pricing
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.018em] sm:text-4xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-[1.7] text-muted-foreground">
              Start free. Learn everything in 3 months. Stay current for less
              than a flat white.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICING.map((tier) => {
              const featured = Boolean(tier.flag)
              return (
                <article
                  key={tier.id}
                  className={
                    "relative flex flex-col rounded-2xl border bg-card p-7 transition-all " +
                    (featured
                      ? "border-primary shadow-lg ring-1 ring-primary/20 lg:-translate-y-1"
                      : "border-border hover:shadow-md")
                  }
                >
                  {tier.flag && (
                    <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                      {tier.flag}
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {tier.badge}
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-[-0.02em]">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{tier.per}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-foreground"
                      >
                        <Check
                          className="mt-1 size-3.5 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.cta.style === "disabled" ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="mt-7 w-full cursor-not-allowed rounded-md border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={
                        "mt-7 inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors " +
                        (featured
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "border border-border text-foreground hover:bg-muted")
                      }
                    >
                      {tier.cta.label}
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── Final CTA — Ink-Deep-Teal PANEL ──────────────────────── */}
      <section className="variant-panel">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
                Postscript
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.018em] sm:text-4xl md:text-5xl">
                The credential decays if you stop. So does the gap.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-[1.65] opacity-85">
                Five hours a week. Ninety-four projects. A score employers
                verify on the spot. Start free, decide later.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:flex-col lg:items-end">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:opacity-90"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center justify-center rounded-md border border-current/30 px-6 py-3.5 text-sm font-medium transition-colors hover:bg-current/10"
              >
                Try a free lab
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <Image
                src="/logo-light-cropped.png"
                alt="GWTH.ai"
                width={120}
                height={32}
                className="block h-8 w-auto dark:hidden"
              />
              <Image
                src="/logo_dark-cropped.png"
                alt="GWTH.ai"
                width={120}
                height={32}
                className="hidden h-8 w-auto dark:block"
              />
              <p className="mt-4 text-[13px] leading-[1.65] text-muted-foreground">
                A 3-month AI course and dynamic, verifiable credential. Built
                around UK research. Independent of any vendor or government
                programme.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Course
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li><Link href="/lessons" className="hover:text-foreground">Lessons</Link></li>
                  <li><Link href="/labs" className="hover:text-foreground">Free labs</Link></li>
                  <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                  <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center">
            <span>© 2026 GWTH.ai · Made in the UK</span>
            <span>A1 · Field Notebook · Refined · Vol I</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
