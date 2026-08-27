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
import { requireSessionOrRedirect } from "@/lib/content-access"

export const metadata = {
  title: "A2 · Field Notebook · Annotated · Redesign",
}

/**
 * Variant A2 — "Field Notebook · Practitioner Annotated"
 *
 * Heavier print-textbook feel. Marginalia notes on the left rail at
 * desktop (inline at mobile). Pull-quotes between sections. Numbered
 * sub-points inside pillars. Footnote-style citations.
 *
 * Aims to remove the "generic" risk of A by leaning hard into a
 * structured, annotated practitioner-textbook personality.
 */
export default async function VariantA2() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="a"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="border-b-2 border-foreground/15 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/redesign/v-a-2" className="flex items-baseline gap-3">
            <span className="text-base font-semibold tracking-tight">
              GWTH.ai
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              The Practitioner&rsquo;s Manual · Ed. 01
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] text-muted-foreground md:flex">
            <Link href="#course" className="transition-colors hover:text-foreground">
              §1 Course
            </Link>
            <Link href="#credential" className="transition-colors hover:text-foreground">
              §2 Credential
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              §3 Pricing
            </Link>
          </nav>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ───── Hero — annotated layout ──────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,420px)] lg:gap-12">
            {/* Margin rail */}
            <aside className="hidden border-r border-border/60 pr-8 lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                §1.1 Mission
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] text-muted-foreground">
                A practitioner&rsquo;s field manual for shipping with AI. Five
                hours a week, ninety-four projects, three months.
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                §1.2 Audience
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] text-muted-foreground">
                UK adults — defensive, transitional, upgrading, advisory.
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                §1.3 Method
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] text-muted-foreground">
                Plain English in, working AI tools out. We assume zero Python.
              </p>
            </aside>

            {/* Main hero */}
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary lg:hidden">
                §1.1 Mission
              </p>
              <h1 className="text-[44px] font-semibold leading-[1.04] tracking-[-0.022em] sm:text-[56px] md:text-[60px]">
                Stop watching AI change the world.{" "}
                <span className="text-gradient">Start building with it.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[18px] leading-[1.7] text-muted-foreground">
                A 3-month AI course and a dynamic, verifiable credential. Five
                hours a week. Ninety-four hands-on projects.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
                  See the credential
                </Link>
              </div>

              {/* Pull-quote */}
              <figure className="mt-14 max-w-xl border-y border-foreground py-7">
                <blockquote className="text-[22px] font-medium leading-[1.4] tracking-[-0.01em] text-foreground sm:text-[26px]">
                  &ldquo;If you can describe what you want, you can build it.&rdquo;
                </blockquote>
                <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  — Excerpt, §2.3 The Credential
                </figcaption>
              </figure>
            </div>

            {/* Score widget */}
            <div className="flex justify-center lg:justify-end lg:pt-2">
              <HeroDevice />
            </div>
          </div>
        </div>

        {/* Research strip */}
        <div className="border-y border-border/60">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-7 sm:px-8 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,420px)] lg:gap-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              References
            </p>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] font-medium">
              {RESEARCH_SOURCES.map((s, i) => (
                <li key={s} className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                    [{i + 1}]
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Pillars — Mint DRENCH with sub-numbered points ───────── */}
      <section id="credential" className="variant-drench">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75">
                Chapter 2
              </p>
              <p className="mt-2 text-[18px] font-semibold leading-tight">
                The product
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] opacity-85">
                Three pillars carry the whole course. Each pillar is the answer
                to a question UK adults asked us first.
              </p>
            </aside>

            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-75 lg:hidden">
                Chapter 2 · The product
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.018em] sm:text-4xl md:text-[52px]">
                94 projects. One score. Plain English.
              </h2>

              <ol className="mt-12 space-y-12">
                {PRODUCT_PILLARS.map((p, i) => (
                  <li
                    key={p.n}
                    className="grid gap-5 border-t border-current/25 pt-7 sm:grid-cols-[80px_1fr]"
                  >
                    <span className="font-mono text-[14px] tracking-[0.06em] opacity-75">
                      §2.{i + 1}
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75">
                        {p.label}
                      </p>
                      <h3 className="mt-2 text-[22px] font-semibold leading-[1.25] tracking-[-0.01em]">
                        {p.title}
                      </h3>
                      <p className="mt-4 text-[15px] leading-[1.7] opacity-90">
                        {p.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Journey grid — annotated cards ───────────────────────── */}
      <section id="course" className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Chapter 3
              </p>
              <p className="mt-2 text-[18px] font-semibold leading-tight">
                Six readers
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] text-muted-foreground">
                Each card maps to a survey segment from DSIT and CIPD &lsquo;25.
              </p>
            </aside>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary lg:hidden">
                Chapter 3 · Six readers
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.018em] sm:text-4xl md:text-[44px]">
                Different reasons. Same course.
              </h2>

              <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                          §3.{i + 1}
                        </span>
                      </div>
                      <h3 className="mt-5 text-[17px] font-semibold leading-[1.3] tracking-[-0.01em]">
                        {j.title}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.65] text-muted-foreground">
                        {j.body}
                      </p>
                      {j.stat && (
                        <p className="mt-5 border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
                          <span
                            className={
                              "font-bold " +
                              (j.accent === "mint" ? "text-accent" : "text-primary")
                            }
                          >
                            {j.stat.value}
                          </span>{" "}
                          {j.stat.label}.
                        </p>
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
          </div>
        </div>
      </section>

      {/* ───── Stats — annotated layout ─────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Chapter 4
              </p>
              <p className="mt-2 text-[18px] font-semibold leading-tight">
                The UK gap
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] text-muted-foreground">
                Source notes [1] DSIT 2024, [2] CIPD 2025, [3] ONS 2025. See
                References [1]–[6].
              </p>
            </aside>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary lg:hidden">
                Chapter 4 · The UK gap
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.018em] sm:text-4xl">
                UK workers and businesses are falling behind on AI.
              </h2>

              <div className="mt-10 space-y-4">
                {UK_STATS.map((stat, i) => (
                  <article
                    key={stat.value}
                    className="grid gap-4 rounded-2xl border border-border bg-card px-7 py-6 sm:grid-cols-[140px_1fr] sm:items-center"
                  >
                    <div
                      className="text-5xl font-bold tracking-[-0.025em] text-foreground sm:text-6xl"
                      style={{ fontFeatureSettings: "'tnum'" }}
                    >
                      {stat.value}
                    </div>
                    <div>
                      <p className="text-[15px] leading-[1.6]">{stat.label}.</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Footnote [{i + 1}] · DSIT, Jan 2026
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Chapter 5
              </p>
              <p className="mt-2 text-[18px] font-semibold leading-tight">
                Pricing
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] text-muted-foreground">
                Tier prices spelled out exactly. £87 total for the three
                months. Stay Current is opt-in only.
              </p>
            </aside>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary lg:hidden">
                Chapter 5 · Pricing
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.018em] sm:text-4xl">
                Less than the cost of one hour with an AI consultant.
              </h2>

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
                        <span className="text-sm text-muted-foreground">
                          {tier.per}
                        </span>
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
          </div>
        </div>
      </section>

      {/* ───── Final CTA — Ink-Deep-Teal PANEL ──────────────────────── */}
      <section className="variant-panel">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-75">
                Postscript
              </p>
              <p className="mt-3 text-[12px] italic leading-[1.65] opacity-90">
                Reading time so far: roughly 90 seconds. Decision time:
                less than thirty.
              </p>
            </aside>
            <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70 lg:hidden">
                  Postscript
                </p>
                <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.018em] sm:text-4xl md:text-5xl">
                  The credential decays if you stop. So does the gap.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-[1.65] opacity-85">
                  Five hours a week. Ninety-four projects. Start free, decide
                  later.
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
                The Practitioner&rsquo;s Manual to building with AI. Three
                months, ninety-four projects, one verifiable credential.
                UK-grounded. Independent.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  §1 Course
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li><Link href="/lessons" className="hover:text-foreground">Lessons</Link></li>
                  <li><Link href="/labs" className="hover:text-foreground">Free labs</Link></li>
                  <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  §2 Company
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                  <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  §3 Legal
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
            <span>A2 · Field Notebook · Annotated · Ed. 01</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
