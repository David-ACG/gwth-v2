import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { HeroDevice } from "@/components/marketing/hero/hero-device"
import {
  JOURNEYS,
  PRODUCT_PILLARS,
  PRICING,
  UK_STATS,
  RESEARCH_SOURCES,
} from "@/components/marketing/data"

/**
 * Editorial homepage — the locked E2-E "Stone & Sage" layout extracted
 * from `palette-explorer.tsx` for use as the production `/` page.
 *
 * Section order: Hero -> Research strip -> Pillars -> Journey grid ->
 * Stats (drench) -> Pricing -> Postscript. The chrome (PublicNav +
 * Footer) is supplied by `(public)/layout.tsx`, so no inline header /
 * footer is rendered here.
 *
 * The `data-variant="e2-e"` wrapper is required: variant-* utility
 * classes (`variant-drench`, `variant-panel`, `variant-warm-text`,
 * `variant-warm-panel`, `variant-serif`) read CSS custom properties
 * scoped to that selector in `globals.css`.
 */
export function EditorialHomepage() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="e2-e"
      className="bg-background font-sans text-foreground"
    >
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <div className="flex flex-col gap-3 border-b border-foreground/30 pb-5 text-[11px] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold">
              Vol I · <span className="variant-warm-text">Issue No. 01</span>
            </span>
            <span className="variant-serif italic text-muted-foreground">
              The Practitioner&rsquo;s Edition
            </span>
            <span className="font-mono tracking-[0.14em]">
              gwth.ai · Spring 2026
            </span>
          </div>

          <div className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="max-w-3xl">
              <h1 className="text-[44px] font-bold leading-[0.98] tracking-[-0.025em] sm:text-[60px] md:text-[76px]">
                Stop watching AI change the world.
              </h1>
              <p className="variant-serif mt-7 max-w-xl text-3xl italic leading-[1.05] text-primary sm:text-[40px]">
                Start building with it.
              </p>

              <div className="variant-serif mt-10 max-w-xl space-y-4 text-[18px] leading-[1.7] text-foreground/85">
                <p>
                  A 3-month AI course with plain progress and portfolio evidence.
                  Five hours a week, ninety-four hands-on projects, plain
                  English.
                </p>
                <p>
                  Every project you ship becomes portfolio evidence that UK employers
                  can inspect. No PDFs. No faked dates.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-1.5 border-2 border-primary bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Join waitlist
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#credential"
                  className="inline-flex items-center justify-center border-2 border-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Read more
                </Link>
              </div>

              <figure className="variant-warm-panel mt-14 max-w-xl px-7 py-6">
                <blockquote className="variant-serif text-[20px] italic leading-[1.45] sm:text-[22px]">
                  &ldquo;If you can describe what you want, you can build
                  it.&rdquo;
                </blockquote>
                <figcaption className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] opacity-75">
                  — From §3 Progress
                </figcaption>
              </figure>
            </div>

            <div className="flex justify-center lg:justify-end">
              {ENABLE_GWTH_SCORE ? (
                <HeroDevice />
              ) : (
                <div className="w-full max-w-md border-2 border-foreground bg-card px-7 py-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Course progress
                  </p>
                  <div className="mt-4 text-6xl font-bold tracking-[-0.03em]">
                    64/94
                  </div>
                  <p className="variant-serif mt-3 text-[15px] leading-[1.6] text-muted-foreground">
                    Plain beta progress for lessons, projects, capstones, and refresh work.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-foreground bg-foreground text-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-[12px] uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span className="font-bold">Built around UK research from</span>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 font-medium">
              {RESEARCH_SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="credential" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
                Section 01
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.022em] sm:text-5xl">
                94 projects.
                <br />
                Plain progress.
                <br />
                <span className="variant-serif italic text-primary">
                  Plain English.
                </span>
              </h2>
            </div>
            <ol className="space-y-0">
              {PRODUCT_PILLARS.map((p, i) => (
                <li
                  key={p.n}
                  className="grid gap-4 border-t-2 border-foreground py-7 sm:grid-cols-[120px_1fr] sm:gap-7"
                >
                  <div>
                    <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
                      § {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                      {p.label}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold leading-[1.25] tracking-[-0.012em] sm:text-2xl">
                      {p.title}
                    </h3>
                    <p className="variant-serif mt-3 text-[17px] leading-[1.7] text-foreground/85">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Journey grid */}
      <section id="course" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
              Section 02 — Six readers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.022em] sm:text-4xl md:text-5xl">
              Different reasons.{" "}
              <span className="variant-serif italic text-primary">
                Same course.
              </span>
            </h2>
          </div>

          <ul className="mt-14 grid gap-0 border-t-2 border-foreground sm:grid-cols-2 sm:border-l-2 lg:grid-cols-3">
            {journeys.map((j) => (
              <li
                key={j.n}
                className="border-b-2 border-foreground/15 sm:border-r-2 sm:border-b-2"
              >
                <Link
                  href={j.href}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="variant-warm-panel px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                      {j.tag}
                    </span>
                    <span className="variant-warm-text font-mono text-[11px] font-bold tracking-[0.14em]">
                      No. {j.n}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[19px] font-bold leading-[1.25] tracking-[-0.012em]">
                    {j.title}
                  </h3>
                  <p className="variant-serif mt-3 flex-1 text-[15px] leading-[1.7] text-foreground/80">
                    {j.body}
                  </p>
                  {j.stat && (
                    <p className="variant-serif mt-5 border-t border-foreground/30 pt-3 text-[13px] italic text-muted-foreground">
                      <span className="variant-warm-text font-bold not-italic">
                        {j.stat.value}
                      </span>{" "}
                      — {j.stat.label}.
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
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

      {/* Stats — drench */}
      <section id="stats" className="variant-drench">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
                Section 03 — The UK gap
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.022em] sm:text-4xl md:text-5xl">
                UK workers and businesses are falling behind on AI.
              </h2>
              <p className="variant-serif mt-5 max-w-md text-[17px] italic leading-[1.6] opacity-90">
                Three figures from named UK research bodies. Citation
                attached to every number.
              </p>
            </div>
            <div className="space-y-0">
              {UK_STATS.map((stat, i) => (
                <article
                  key={stat.value}
                  className="grid gap-5 border-t-2 border-current/30 py-7 first:border-t-0 sm:grid-cols-[160px_1fr]"
                >
                  <div
                    className="variant-warm-text text-6xl font-bold tracking-[-0.025em] sm:text-7xl"
                    style={{ fontFeatureSettings: "'tnum'" }}
                  >
                    {stat.value}
                  </div>
                  <div>
                    <p className="variant-serif text-[17px] leading-[1.55]">
                      {stat.label}.
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
                      Source: DSIT, Jan 2026 · Citation no.{" "}
                      {String(i + 1).padStart(2, "0")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-3xl">
            <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
              Section 04 — Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.022em] sm:text-4xl md:text-5xl">
              Less than the cost of one hour with an{" "}
              <span className="variant-serif italic text-primary">
                AI consultant.
              </span>
            </h2>
          </div>

          <div className="mt-14 grid gap-0 border-2 border-foreground sm:grid-cols-3">
            {PRICING.map((tier, i) => {
              const featured = Boolean(tier.flag)
              const isStay = tier.id === "stay"
              return (
                <article
                  key={tier.id}
                  className={
                    "relative flex flex-col p-7 " +
                    (i < PRICING.length - 1
                      ? "sm:border-r-2 sm:border-foreground "
                      : "") +
                    (featured
                      ? "bg-primary text-primary-foreground"
                      : isStay
                        ? "variant-warm-panel"
                        : "bg-card")
                  }
                >
                  <span
                    className={
                      "text-[11px] font-bold uppercase tracking-[0.2em] " +
                      (featured || isStay
                        ? "opacity-80"
                        : "text-muted-foreground")
                    }
                  >
                    {tier.badge}
                  </span>
                  {tier.flag && (
                    <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] opacity-90">
                      ★ {tier.flag}
                    </span>
                  )}
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-[-0.025em]">
                      {tier.price}
                    </span>
                    <span
                      className={
                        "variant-serif text-[14px] italic " +
                        (featured || isStay
                          ? "opacity-85"
                          : "text-muted-foreground")
                      }
                    >
                      {tier.per}
                    </span>
                  </div>
                  <ul className="variant-serif mt-7 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[15px] leading-[1.55]"
                      >
                        <Check
                          className="mt-1 size-3.5 shrink-0"
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
                      className="mt-7 w-full cursor-not-allowed border-2 border-current/30 px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] opacity-70"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={
                        "mt-7 inline-flex w-full items-center justify-center px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors " +
                        (featured
                          ? "border-2 border-primary-foreground bg-primary-foreground text-primary hover:bg-transparent hover:text-primary-foreground"
                          : "border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground")
                      }
                    >
                      {tier.cta.label}
                    </Link>
                  )}
                </article>
              )
            })}
          </div>

          <p className="variant-serif mt-8 text-[13px] italic text-muted-foreground">
            <span className="variant-warm-text font-bold not-italic">
              Stay Current
            </span>{" "}
            opens after the course — keeps your knowledge current and
            knowledge updated.
          </p>
        </div>
      </section>

      {/* Postscript */}
      <section className="variant-panel">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-75">
              Postscript
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-[1.0] tracking-[-0.025em] sm:text-5xl md:text-6xl">
              Progress pauses
              <br />
              <span className="variant-serif italic">if you stop.</span>
              <br />
              So does the gap.
            </h2>
            <p className="variant-serif mt-7 max-w-xl text-[19px] leading-[1.6] opacity-90">
              Five hours a week. Ninety-four projects. Start free, decide
              later.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 border-2 border-primary-foreground bg-primary-foreground px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-transparent hover:text-primary-foreground"
              >
                Join waitlist
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center justify-center border-2 border-current px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-current hover:text-primary"
              >
                Try a free lab
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
