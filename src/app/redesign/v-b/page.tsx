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
  CURRICULUM,
} from "@/components/marketing/data"

export const metadata = {
  title: "B · Modern Technical · Redesign",
}

/**
 * Redesign Variant B — "Modern Technical"
 *
 * Dark-canonical (works in light too). Aqua drench hero. Geist Sans +
 * Geist Mono throughout. Tight, dense, mono labels everywhere. Hairline
 * borders, 1px Aqua underline as a recurring motif. Linear-style
 * precision with generous breathing room — not cramped.
 */
export default function VariantB() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="b"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/redesign/v-b"
            className="flex items-center gap-2 font-mono text-[12px] tracking-tight"
          >
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-foreground">gwth.ai</span>
            <span className="text-muted-foreground">/ home</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
            <Link href="#course" className="transition-colors hover:text-foreground">
              Course
            </Link>
            <Link href="#credential" className="transition-colors hover:text-foreground">
              Credential
            </Link>
            <Link href="#stats" className="transition-colors hover:text-foreground">
              Research
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[12px]">
            <Link
              href="/login"
              className="hidden px-2 py-1 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-primary-foreground transition-opacity hover:opacity-90"
            >
              get started
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Hero — Aqua DRENCH ────────────────────────────────────── */}
      <section className="variant-drench relative overflow-hidden">
        {/* Hairline grid lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto grid max-w-[1200px] gap-14 px-5 py-24 sm:px-8 md:py-28 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="max-w-[640px]">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] opacity-75">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              v1 · UK · independent
            </div>
            <h1 className="mt-7 text-[44px] font-semibold leading-[1.04] tracking-[-0.025em] sm:text-[60px] md:text-[72px]">
              Stop watching AI change the world.
              <br />
              <span className="opacity-90">Start building with it.</span>
            </h1>
            <p className="mt-8 max-w-[540px] text-[18px] leading-[1.55] opacity-85">
              A 3-month AI course and a dynamic, verifiable credential. Five
              hours a week, ninety-four hands-on projects, plain English. Built
              for UK adults — independent of any vendor or government programme.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-all hover:translate-y-[-1px]"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#credential"
                className="inline-flex items-center justify-center rounded-md border border-current/30 bg-current/[0.04] px-5 py-3 text-sm font-medium transition-colors hover:bg-current/10"
              >
                See how the score works
              </Link>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-x-6 gap-y-3 border-t border-current/20 pt-6 font-mono text-[12px]">
              <div>
                <dt className="opacity-60">Duration</dt>
                <dd className="mt-1 text-[15px] font-semibold tracking-tight">
                  3 months
                </dd>
              </div>
              <div>
                <dt className="opacity-60">Effort</dt>
                <dd className="mt-1 text-[15px] font-semibold tracking-tight">
                  5 hrs / wk
                </dd>
              </div>
              <div>
                <dt className="opacity-60">Projects</dt>
                <dd className="mt-1 text-[15px] font-semibold tracking-tight">
                  94
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDevice />
          </div>
        </div>

        {/* Hairline rule with mono URL */}
        <div className="relative border-t border-current/20">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-5 font-mono text-[11px] uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span className="opacity-70">Sources · {RESEARCH_SOURCES.join(" · ")}</span>
            <span className="opacity-70">gwth.ai/verify/&#123;credentialId&#125;</span>
          </div>
        </div>
      </section>

      {/* ───── Course module strip ──────────────────────────────────── */}
      <section id="course" className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                01 / Curriculum
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Three modules, three capstones, ninety-four projects.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-muted-foreground">
                Async-first, so it works around the day job. Every lesson ends
                with a step-by-step walkthrough where the instructor builds the
                project alongside you.
              </p>
            </div>

            <ol className="space-y-px overflow-hidden rounded-xl border border-border">
              {CURRICULUM.map((m, i) => (
                <li
                  key={m.m}
                  className="grid gap-3 bg-card p-6 sm:grid-cols-[140px_1fr_auto] sm:items-start sm:gap-6"
                >
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                      {m.m}
                    </span>
                    <p className="mt-1 text-[12px] text-muted-foreground">{m.d}</p>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold tracking-[-0.01em]">
                      {m.t}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Capstone:{" "}
                      </span>
                      {m.capstone}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {m.capstoneSub}
                    </p>
                  </div>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───── Journey grid ─────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              02 / Audience
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Different reasons. Same course.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-muted-foreground">
              Pick the row that fits — they all end up at the same proof.
            </p>
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j) => (
              <li key={j.n} className="bg-card">
                <Link
                  href={j.href}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em]">
                    <span className="text-primary">{j.tag}</span>
                    <span className="text-muted-foreground">{j.n}</span>
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold leading-[1.3] tracking-[-0.01em]">
                    {j.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[14px] leading-[1.6] text-muted-foreground">
                    {j.body}
                  </p>
                  {j.stat && (
                    <p className="mt-5 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
                      <span className="text-primary">{j.stat.value}</span>{" "}
                      {j.stat.label}
                    </p>
                  )}
                  <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[12px] text-foreground">
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

      {/* ───── Product pillars — Ink-Deep-Teal PANEL ───────────────── */}
      <section id="credential" className="variant-panel">
        <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-65">
              03 / Pillars
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl md:text-5xl">
              94 projects. One score. Plain English.
            </h2>
          </div>

          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {PRODUCT_PILLARS.map((p) => (
              <li
                key={p.n}
                className="border-t border-current/20 pt-6"
              >
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] opacity-65">
                  <span>{p.n}</span>
                  <span>{p.label}</span>
                </div>
                <h3 className="mt-5 text-[22px] font-semibold leading-[1.2] tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="mt-4 text-[14px] leading-[1.65] opacity-85">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── UK research stats ────────────────────────────────────── */}
      <section id="stats" className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 md:py-20">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              04 / The UK gap
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              UK workers and businesses are falling behind on AI.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {UK_STATS.map((stat, i) => (
              <article key={stat.value} className="bg-card p-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Stat / {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="mt-3 text-5xl font-bold tracking-[-0.025em] text-primary sm:text-6xl"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  {stat.value}
                </div>
                <p className="mt-4 text-[13px] leading-[1.6] text-muted-foreground">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-8 font-mono text-[11px] text-muted-foreground">
            Source: UK Government / DSIT (Jan 2026)
          </p>
        </div>
      </section>

      {/* ───── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              05 / Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-3">
            {PRICING.map((tier) => {
              const featured = Boolean(tier.flag)
              return (
                <article
                  key={tier.id}
                  className={
                    "relative flex flex-col bg-card p-7 " +
                    (featured ? "ring-1 ring-primary" : "")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {tier.badge}
                    </span>
                    {tier.flag && (
                      <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
                        {tier.flag}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-[-0.025em]">
                      {tier.price}
                    </span>
                    <span className="font-mono text-[12px] text-muted-foreground">
                      {tier.per}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-foreground"
                      >
                        <Check
                          className="mt-1 size-3.5 shrink-0 text-primary"
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
                      className="mt-7 w-full cursor-not-allowed rounded-md border border-border px-4 py-2.5 font-mono text-[12px] uppercase tracking-wider text-muted-foreground"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={
                        "mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors " +
                        (featured
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "border border-border text-foreground hover:bg-muted")
                      }
                    >
                      {tier.cta.label}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </article>
              )
            })}
          </div>

          <p className="mt-8 font-mono text-[11px] text-muted-foreground">
            No yearly price · Cancel anytime · No lock-in · Same per-person price
            for teams
          </p>
        </div>
      </section>

      {/* ───── Final CTA — Aqua DRENCH ──────────────────────────────── */}
      <section className="variant-drench relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative mx-auto max-w-[1200px] px-5 py-24 sm:px-8 md:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">
                06 / Start
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-5xl md:text-6xl">
                The credential decays if you stop.
                <br />
                So does the gap.
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-[1.55] opacity-85">
                Five hours a week. Ninety-four projects. A score employers verify
                on the spot. Start free, decide later.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:flex-col lg:items-end">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-all hover:translate-y-[-1px]"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center justify-center rounded-md border border-current/30 bg-current/[0.04] px-6 py-3.5 text-sm font-medium transition-colors hover:bg-current/10"
              >
                Try a free lab
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
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
              <p className="mt-4 font-mono text-[12px] leading-[1.6] text-muted-foreground">
                gwth.ai · UK · independent · v1.0
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Course
                </h3>
                <ul className="mt-4 space-y-2 font-mono text-[12px]">
                  <li>
                    <Link href="/lessons" className="hover:text-foreground">
                      lessons
                    </Link>
                  </li>
                  <li>
                    <Link href="/labs" className="hover:text-foreground">
                      free labs
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-foreground">
                      pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 font-mono text-[12px]">
                  <li>
                    <Link href="/about" className="hover:text-foreground">
                      about
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-foreground">
                      contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2 font-mono text-[12px]">
                  <li>
                    <Link href="/privacy" className="hover:text-foreground">
                      privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-foreground">
                      terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-5 font-mono text-[11px] text-muted-foreground">
            <span>© 2026 GWTH.ai · Variant B · Modern Technical</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
