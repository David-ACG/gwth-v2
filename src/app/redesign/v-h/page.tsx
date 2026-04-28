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
  title: "H · Editorial Premium · Redesign",
}

/**
 * Redesign Variant H — "Editorial Premium" · WITH gradients
 *
 * Deep emerald carrier, warm cream surface, mustard accent. Domine
 * (display serif) + Onest (sans body). Stripe Press / Linear-blog
 * premium feel. Subtle gradient mood overlays on hero and section
 * transitions, never flashy.
 */
export default function VariantH() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="h"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6 sm:px-8">
          <Link href="/redesign/v-h" className="flex items-baseline gap-3">
            <span className="variant-serif text-xl font-bold tracking-[-0.01em]">
              GWTH.ai
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
              Premium · UK
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
          <Link
            href="/signup"
            className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-all hover:translate-y-[-1px]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ───── Hero — emerald gradient mood ─────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-accent/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-20 size-[480px] rounded-full bg-accent/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 bottom-0 size-[420px] rounded-full bg-primary/30 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-start gap-14 px-6 py-20 sm:px-8 md:py-32 lg:grid-cols-[1.15fr_1fr]">
          <div className="max-w-2xl">
            <p className="variant-serif text-[12px] uppercase tracking-[0.22em] text-primary">
              Issue No. One · A practitioner&rsquo;s edition
            </p>
            <h1 className="variant-serif mt-7 text-[44px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[60px] md:text-[72px]">
              Stop watching AI change the world.{" "}
              <span className="text-primary">Start building with it.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[18px] leading-[1.65] text-muted-foreground">
              A 3-month AI course and a dynamic, verifiable credential.
              Five hours a week. Ninety-four hands-on projects. Plain
              English. We assume zero Python.
            </p>
            <p className="mt-4 max-w-xl text-[18px] leading-[1.65] text-muted-foreground">
              Every project you ship updates a credential UK employers can
              check on the spot. No PDFs, no faked completion dates.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition-all hover:translate-y-[-1px] hover:shadow-lg"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#credential"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 px-7 py-3.5 text-[15px] font-medium text-foreground backdrop-blur transition-colors hover:bg-card"
              >
                Read on
              </Link>
            </div>

            <p className="mt-8 variant-serif text-[13px] italic text-muted-foreground">
              Independent of any vendor or government programme.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDevice />
          </div>
        </div>

        {/* Research strip */}
        <div className="relative border-t border-border/60 bg-card/60 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="variant-serif text-[13px] italic text-muted-foreground">
              Built around UK research from
            </p>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] font-semibold">
              {RESEARCH_SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Pillars — long-read editorial ────────────────────────── */}
      <section id="credential" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-32">
          <div className="max-w-2xl">
            <p className="variant-serif text-[12px] uppercase tracking-[0.22em] text-primary">
              Chapter One · The product
            </p>
            <h2 className="variant-serif mt-3 text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-6xl">
              94 projects. One score.
              <br />
              <span className="text-primary">Plain English.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-muted-foreground">
              Three pillars carry the whole course. Each one is the answer
              to a question UK adults asked us first.
            </p>
          </div>

          <div className="mt-14 space-y-12">
            {PRODUCT_PILLARS.map((p, i) => (
              <article
                key={p.n}
                className="grid gap-6 border-t border-border pt-10 lg:grid-cols-[180px_1fr_auto] lg:gap-10"
              >
                <div>
                  <p className="variant-serif text-[12px] uppercase tracking-[0.22em] text-primary">
                    Chapter §{i + 1}
                  </p>
                  <p className="mt-2 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                    {p.label}
                  </p>
                </div>
                <div className="max-w-3xl">
                  <h3 className="variant-serif text-2xl font-bold leading-[1.15] tracking-[-0.01em] sm:text-3xl">
                    {p.title}
                  </h3>
                  <p className="mt-5 text-[17px] leading-[1.7] text-foreground/85">
                    {p.body}
                  </p>
                </div>
                <div className="lg:max-w-[200px]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent-foreground">
                    <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {i === 0 && "5 hrs / week"}
                    {i === 1 && "Live verify URL"}
                    {i === 2 && "Zero Python"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Stats — emerald drench with mustard accents ──────────── */}
      <section className="variant-drench relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-0 size-[500px] rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="variant-serif text-[12px] uppercase tracking-[0.22em] opacity-75">
                Chapter Two · The UK gap
              </p>
              <h2 className="variant-serif mt-3 text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl md:text-5xl">
                Why this matters now.
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-[1.6] opacity-90">
                Three figures from named UK research bodies. Citation
                attached to every number.
              </p>
            </div>
            <div className="space-y-8">
              {UK_STATS.map((stat, i) => (
                <article
                  key={stat.value}
                  className="grid gap-5 border-t border-current/25 pt-7 first:border-t-0 first:pt-0 sm:grid-cols-[140px_1fr]"
                >
                  <div
                    className="variant-serif text-6xl font-bold tracking-[-0.025em] sm:text-7xl text-accent"
                    style={{ fontFeatureSettings: "'tnum'" }}
                  >
                    {stat.value}
                  </div>
                  <div>
                    <p className="text-[17px] leading-[1.55]">{stat.label}.</p>
                    <p className="variant-serif mt-2 text-[12px] italic uppercase tracking-[0.18em] opacity-70">
                      Source no. {String(i + 1).padStart(2, "0")} · DSIT, Jan 2026
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Journey grid ─────────────────────────────────────────── */}
      <section id="course" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="variant-serif text-[12px] uppercase tracking-[0.22em] text-primary">
              Chapter Three · The reader
            </p>
            <h2 className="variant-serif mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
              Different reasons.{" "}
              <span className="text-primary">Same course.</span>
            </h2>
          </div>

          <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j) => (
              <li key={j.n}>
                <Link
                  href={j.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
                      {j.tag}
                    </span>
                    <span className="variant-serif italic text-[12px] text-muted-foreground">
                      No. {j.n}
                    </span>
                  </div>
                  <h3 className="variant-serif mt-5 text-[20px] font-bold leading-[1.25] tracking-[-0.01em]">
                    {j.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[14.5px] leading-[1.65] text-muted-foreground">
                    {j.body}
                  </p>
                  {j.stat && (
                    <p className="mt-5 border-t border-border pt-3 text-[13px] text-muted-foreground">
                      <span className="variant-serif text-[18px] font-bold text-primary">
                        {j.stat.value}
                      </span>{" "}
                      <span className="variant-serif italic">
                        — {j.stat.label}.
                      </span>
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                    {j.cta}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="variant-serif text-[12px] uppercase tracking-[0.22em] text-primary">
              Chapter Four · The price
            </p>
            <h2 className="variant-serif mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-[1.65] text-muted-foreground">
              Start free. Learn everything in three months. Stay current
              for less than a flat white.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICING.map((tier) => {
              const featured = Boolean(tier.flag)
              return (
                <article
                  key={tier.id}
                  className={
                    "relative flex flex-col rounded-2xl border bg-card p-7 " +
                    (featured
                      ? "border-primary shadow-[0_8px_30px_oklch(0.36_0.09_165_/_0.18)] lg:-translate-y-2"
                      : "border-border shadow-sm hover:shadow-md")
                  }
                >
                  {tier.flag && (
                    <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground shadow-sm">
                      {tier.flag}
                    </span>
                  )}
                  <span className="variant-serif text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                    {tier.badge}
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="variant-serif text-5xl font-bold tracking-[-0.025em]">
                      {tier.price}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {tier.per}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[14.5px] leading-[1.55] text-foreground"
                      >
                        <Check
                          className="mt-1 size-4 shrink-0 text-accent"
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
                      className="mt-7 w-full cursor-not-allowed rounded-full border border-border px-4 py-3 text-[13px] font-medium text-muted-foreground"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={
                        "mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-3 text-[13px] font-medium transition-all " +
                        (featured
                          ? "bg-primary text-primary-foreground hover:translate-y-[-1px] hover:shadow-md"
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

      {/* ───── Final CTA — mustard panel with deep gradient ──────────── */}
      <section className="variant-panel relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-current/0 via-current/0 to-current/20"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 md:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="variant-serif text-[12px] uppercase tracking-[0.22em] opacity-75">
                Postscript
              </p>
              <h2 className="variant-serif mt-3 text-4xl font-bold leading-[1.05] tracking-[-0.025em] sm:text-5xl md:text-6xl">
                The credential decays
                <br />
                <span className="italic">if you stop.</span>
                <br />
                So does the gap.
              </h2>
              <p className="mt-7 max-w-xl text-[18px] leading-[1.65] opacity-90">
                Five hours a week. Ninety-four projects. A score employers
                verify on the spot. Start free, decide later.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:flex-col lg:items-end">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-lg transition-all hover:translate-y-[-1px]"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center justify-center rounded-full border border-current/30 px-7 py-3.5 text-sm font-medium transition-colors hover:bg-current/10"
              >
                Try a free lab
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
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
              <p className="variant-serif mt-4 text-[14px] italic leading-[1.65] text-muted-foreground">
                A three-month AI course and verifiable credential. Built
                around UK research. Independent of any vendor or government
                programme.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="variant-serif text-[12px] uppercase tracking-[0.18em] text-primary">
                  Course
                </h3>
                <ul className="mt-4 space-y-2 text-[14px]">
                  <li>
                    <Link href="/lessons" className="hover:text-foreground">
                      Lessons
                    </Link>
                  </li>
                  <li>
                    <Link href="/labs" className="hover:text-foreground">
                      Free labs
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="variant-serif text-[12px] uppercase tracking-[0.18em] text-primary">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-[14px]">
                  <li>
                    <Link href="/about" className="hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="variant-serif text-[12px] uppercase tracking-[0.18em] text-primary">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2 text-[14px]">
                  <li>
                    <Link href="/privacy" className="hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="variant-serif mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-[12px] italic text-muted-foreground sm:flex-row sm:items-center">
            <span>© 2026 GWTH.ai · Made in the UK</span>
            <span>Variant H · Editorial Premium · Issue No. One</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
