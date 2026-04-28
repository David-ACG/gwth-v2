import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Sparkles, Calendar, GraduationCap } from "lucide-react"
import { HeroDevice } from "@/components/marketing/hero/hero-device"
import {
  JOURNEYS,
  PRODUCT_PILLARS,
  PRICING,
  UK_STATS,
  RESEARCH_SOURCES,
  CURRICULUM,
} from "@/components/marketing/data"

export const metadata = {
  title: "D · Supportive Learning · Redesign",
}

const PILLAR_ICONS = [Calendar, Sparkles, GraduationCap] as const

/**
 * Redesign Variant D — "Supportive Learning"
 *
 * Light canonical. Soft Warm Coral as primary, Ink-Deep-Teal panel near
 * close. Figtree (humanist sans) throughout, JetBrains Mono only on
 * functional callouts. Generous spacing, big readable body type, calm
 * supportive tone — closest to "wide audience, everyone likes it".
 */
export default function VariantD() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="d"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-6 px-6 sm:px-8">
          <Link href="/redesign/v-d" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">GWTH.ai</span>
            <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary">
              Course
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] text-muted-foreground md:flex">
            <Link href="#course" className="transition-colors hover:text-foreground">
              The course
            </Link>
            <Link href="#credential" className="transition-colors hover:text-foreground">
              The score
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-[14px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:shadow-md"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-start gap-14 px-6 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              <span className="size-1 rounded-full bg-primary" aria-hidden="true" />
              Now enrolling · UK independent
            </p>
            <h1 className="mt-7 text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[58px] md:text-[68px]">
              Learn to build with AI.
              <br />
              <span className="text-primary">We&rsquo;ll walk with you.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[18px] leading-[1.65] text-muted-foreground">
              Five hours a week, ninety-four hands-on projects, three monthly
              modules. Plain English in, working AI tools out — we assume zero
              Python.
            </p>
            <p className="mt-4 max-w-xl text-[18px] leading-[1.65] text-muted-foreground">
              Every project you ship updates a credential UK employers can
              verify on the spot. Start free, decide later.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                Try a free lab first
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Check className="size-4 text-accent" aria-hidden="true" />
                No credit card required
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-4 text-accent" aria-hidden="true" />
                Cancel anytime
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-4 text-accent" aria-hidden="true" />
                Async, around the day job
              </li>
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end lg:pt-2">
            <HeroDevice />
          </div>
        </div>

        {/* Research strip */}
        <div className="border-t border-border/70 bg-muted/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-[13px] text-muted-foreground">
              Built around UK research from
            </p>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] font-semibold text-foreground">
              {RESEARCH_SOURCES.map((s) => (
                <li key={s} className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Pillars in friendly cards ────────────────────────────── */}
      <section id="credential" className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl md:text-5xl">
              94 projects. One score. Plain English.
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-muted-foreground">
              Three pillars carry the whole course. Each one is the answer to a
              question UK adults asked us first.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {PRODUCT_PILLARS.map((p, i) => {
              const Icon = PILLAR_ICONS[i] ?? Sparkles
              return (
                <li
                  key={p.n}
                  className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {p.n} · {p.label}
                  </span>
                  <h3 className="mt-3 text-[19px] font-semibold leading-[1.3] tracking-[-0.01em]">
                    {p.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.65] text-muted-foreground">
                    {p.body}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ───── Curriculum month strip — Coral DRENCH ────────────────── */}
      <section className="variant-drench">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-75">
                Twelve weeks
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl md:text-5xl">
                A calm pace.
                <br />
                Exact structure.
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-[1.65] opacity-90">
                Five hours a week. Async-first, so it works around the day job.
                Each lesson ends with a step-by-step walkthrough where the
                instructor builds alongside you.
              </p>
              <Link
                href="/lessons"
                className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-all hover:translate-y-[-1px]"
              >
                See the syllabus
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <ol className="space-y-3">
              {CURRICULUM.map((m, i) => (
                <li
                  key={m.m}
                  className="grid gap-3 rounded-3xl bg-current/[0.08] p-6 sm:grid-cols-[110px_1fr] sm:items-start sm:gap-6"
                >
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-75">
                      Module 0{i + 1}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      {m.m}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold tracking-[-0.005em]">
                      {m.t}
                    </h3>
                    <p className="mt-1.5 text-[14px] opacity-85">{m.d}</p>
                    <p className="mt-3 text-[13.5px] opacity-90">
                      <span className="font-semibold">Capstone:</span>{" "}
                      {m.capstone}
                    </p>
                    <p className="mt-1 text-[12px] opacity-75">
                      {m.capstoneSub}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───── Journey grid ─────────────────────────────────────────── */}
      <section id="course" className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              Why people start
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
              Different reasons. Same course.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.65] text-muted-foreground">
              Pick the row that fits. They all end up at the same proof.
            </p>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j) => (
              <li key={j.n}>
                <Link
                  href={j.href}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        "rounded-full px-3 py-1 text-[12px] font-medium " +
                        (j.accent === "mint"
                          ? "bg-accent/12 text-accent"
                          : "bg-primary/12 text-primary")
                      }
                    >
                      {j.tag}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      {j.n}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold leading-[1.3] tracking-[-0.005em]">
                    {j.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[14.5px] leading-[1.65] text-muted-foreground">
                    {j.body}
                  </p>
                  {j.stat && (
                    <div className="mt-5 rounded-2xl bg-muted/60 px-4 py-3">
                      <div className="text-xl font-bold tracking-tight">
                        {j.stat.value}
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {j.stat.label}
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex items-center justify-between text-[13px] font-medium text-foreground">
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

      {/* ───── UK research stats ────────────────────────────────────── */}
      <section className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              The UK gap
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
              Why this matters now.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.65] text-muted-foreground">
              Three figures from named UK research bodies. We cite them next to
              every claim — no stat without a source.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {UK_STATS.map((stat) => (
              <article
                key={stat.value}
                className="rounded-3xl border border-border bg-card p-7 shadow-sm"
              >
                <div
                  className="text-5xl font-bold tracking-[-0.025em] text-primary sm:text-6xl"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  {stat.value}
                </div>
                <p className="mt-4 text-[14.5px] leading-[1.6] text-muted-foreground">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-[13px] text-muted-foreground">
            Source: UK Government / DSIT (Jan 2026) · {RESEARCH_SOURCES.join(" · ")}
          </p>
        </div>
      </section>

      {/* ───── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.65] text-muted-foreground">
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
                    "relative flex flex-col rounded-3xl border bg-card p-8 transition-all " +
                    (featured
                      ? "border-primary shadow-[0_8px_30px_oklch(0.7_0.16_25_/_0.18)] lg:-translate-y-2"
                      : "border-border shadow-sm hover:shadow-md")
                  }
                >
                  {tier.flag && (
                    <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                      {tier.flag}
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {tier.badge}
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-[-0.025em]">
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
                          ? "bg-primary text-primary-foreground shadow-sm hover:translate-y-[-1px] hover:shadow-md"
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

          <p className="mt-8 text-[13px] text-muted-foreground">
            No yearly price · Cancel anytime · No lock-in · Same per-person price
            for teams
          </p>
        </div>
      </section>

      {/* ───── Final CTA — Ink-Deep PANEL ───────────────────────────── */}
      <section className="variant-panel relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -bottom-32 size-[420px] rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 md:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
                Start the course
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl md:text-5xl">
                We&rsquo;ll walk with you. <br />
                Five hours a week. Twelve weeks.
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-[1.65] opacity-90">
                Ninety-four hands-on projects. A score employers verify on the
                spot. Start free, decide later.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:flex-col lg:items-end">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:translate-y-[-1px] hover:shadow-xl"
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
              <p className="mt-4 text-[14px] leading-[1.65] text-muted-foreground">
                A 3-month AI course and a verifiable credential. Built around UK
                research. Independent of any vendor or government programme.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  Course
                </h3>
                <ul className="mt-4 space-y-2 text-[14px] text-muted-foreground">
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
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-[14px] text-muted-foreground">
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
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2 text-[14px] text-muted-foreground">
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
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center">
            <span>© 2026 GWTH.ai · Made in the UK</span>
            <span>Variant D · Supportive Learning · v1.0</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
