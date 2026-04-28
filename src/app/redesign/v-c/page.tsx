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
  title: "C · Quiet Essay · Redesign",
}

/**
 * Redesign Variant C — "Quiet Essay"
 *
 * Warm cream surface. Source Serif 4 for body lead and long-form
 * paragraphs (.variant-serif). Manrope for display, headers, UI.
 * Burnt Sienna replaces Aqua as the primary trust signal.
 *
 * Reads like a calm Aeon long-read or Granta print issue. Two-column
 * essay rhythm in the credential explainer. Citations live in margin
 * notes next to claims rather than in footers.
 */
export default function VariantC() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="c"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/redesign/v-c" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">GWTH.ai</span>
            <span className="text-[11px] italic text-muted-foreground variant-serif">
              an essay on building with AI
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
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
            className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ───── Hero ─────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-16 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.05fr_1fr]">
          <article className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
              Volume One · Issue One
            </p>
            <h1 className="mt-7 font-semibold leading-[1.04] tracking-[-0.025em]">
              <span className="block text-[44px] sm:text-[60px] md:text-[68px]">
                Stop watching AI
              </span>
              <span className="variant-serif mt-1 block text-[44px] italic sm:text-[60px] md:text-[68px]">
                change the world.
              </span>
              <span className="mt-3 block text-[44px] sm:text-[60px] md:text-[68px] text-primary">
                Start building with it.
              </span>
            </h1>

            <div className="variant-serif mt-10 space-y-5 text-[19px] leading-[1.65] text-foreground/85">
              <p>
                A 3-month AI course and a dynamic, verifiable credential. Five
                hours a week, ninety-four hands-on projects, plain English. We
                assume zero Python.
              </p>
              <p>
                Every project you ship updates a credential UK employers can
                check on the spot. No PDFs, no faked completion dates, no
                one-shot certificate that goes stale.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#credential"
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Read on
              </Link>
            </div>
          </article>

          <aside className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Margin note pinned to the device */}
              <p className="variant-serif absolute -left-4 top-0 hidden max-w-[180px] -translate-x-full pr-2 text-right text-[12px] italic leading-[1.55] text-muted-foreground lg:block">
                The score updates as you ship. It decays if you stop. Employers
                verify on the spot.
                <span className="mt-2 block text-[10px] not-italic uppercase tracking-[0.18em] text-primary">
                  margin note · §1
                </span>
              </p>
              <HeroDevice />
            </div>
          </aside>
        </div>

        {/* Hairline rule + research strip */}
        <div className="border-y border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="variant-serif text-[13px] italic text-muted-foreground">
              Built around UK research from
            </p>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] font-medium">
              {RESEARCH_SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Two-column essay — pillars as a long-read ────────────── */}
      <section id="credential" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
              Chapter One · The product
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
              94 projects. One score.
              <br />
              Plain English.
            </h2>
            <p className="variant-serif mt-5 text-[18px] italic leading-[1.6] text-muted-foreground">
              Three pillars carry the whole course. Each one is the answer to a
              question UK adults asked us first.
            </p>
          </div>

          <div className="mt-14 space-y-14">
            {PRODUCT_PILLARS.map((p, i) => (
              <article
                key={p.n}
                className="grid gap-6 border-t border-border pt-10 lg:grid-cols-[160px_1fr_auto] lg:gap-10"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-primary">
                    §{i + 1}
                  </p>
                  <p className="mt-2 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                    {p.label}
                  </p>
                </div>
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                    {p.title}
                  </h3>
                  <p className="variant-serif mt-5 text-[18px] leading-[1.7] text-foreground/85">
                    {i === 0 && (
                      <span className="float-left mr-3 mt-1 text-[56px] font-bold leading-[0.85] text-primary">
                        {p.body.charAt(0)}
                      </span>
                    )}
                    {i === 0 ? p.body.slice(1) : p.body}
                  </p>
                </div>
                <p className="variant-serif text-[12px] italic leading-[1.55] text-muted-foreground lg:max-w-[180px]">
                  {i === 0 && (
                    <>
                      Five hours a week. Async-first.
                      <span className="mt-2 block text-[10px] not-italic uppercase tracking-[0.16em] text-primary">
                        margin note
                      </span>
                    </>
                  )}
                  {i === 1 && (
                    <>
                      Verifiable on a public URL. Decays if you stop.
                      <span className="mt-2 block text-[10px] not-italic uppercase tracking-[0.16em] text-primary">
                        gwth.ai/verify/&hellip;
                      </span>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      Tools you already pay for, used the way professionals do.
                      <span className="mt-2 block text-[10px] not-italic uppercase tracking-[0.16em] text-primary">
                        Claude · ChatGPT · n8n
                      </span>
                    </>
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Journey grid — essay-card hybrid ─────────────────────── */}
      <section id="course" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
              Chapter Two · The reader
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Different reasons.{" "}
              <span className="variant-serif italic">Same course.</span>
            </h2>
            <p className="variant-serif mt-4 max-w-xl text-[17px] leading-[1.65] text-muted-foreground">
              We wrote this for the worried, the reskilling, the curious, and
              the practitioner-already.
            </p>
          </div>

          <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j) => (
              <li key={j.n}>
                <Link
                  href={j.href}
                  className="group flex h-full flex-col border-t-2 border-foreground pt-6 transition-opacity hover:opacity-80"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em]">
                    <span className="text-primary">{j.tag}</span>
                    <span className="variant-serif italic text-muted-foreground">
                      No. {j.n}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[20px] font-semibold leading-[1.25] tracking-[-0.01em]">
                    {j.title}
                  </h3>
                  <p className="variant-serif mt-3 flex-1 text-[15px] leading-[1.65] text-foreground/80">
                    {j.body}
                  </p>
                  {j.stat && (
                    <p className="variant-serif mt-5 text-[14px] italic leading-[1.5] text-muted-foreground">
                      <span className="not-italic font-semibold text-primary">
                        {j.stat.value}
                      </span>{" "}
                      — {j.stat.label}.
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-foreground">
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

      {/* ───── Stats — Sienna DRENCH band ───────────────────────────── */}
      <section className="variant-drench">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] opacity-75">
                Chapter Three · The gap
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl md:text-5xl">
                UK workers and businesses are falling behind on AI.
              </h2>
              <p className="variant-serif mt-5 text-[17px] italic leading-[1.6] opacity-90">
                Not a clickbait stat. Three figures from named UK research
                bodies, with the citation right next to the number.
              </p>
            </div>
            <div className="space-y-px">
              {UK_STATS.map((stat, i) => (
                <article
                  key={stat.value}
                  className="grid gap-4 border-t border-current/20 py-6 first:border-t-0 sm:grid-cols-[140px_1fr]"
                >
                  <div
                    className="text-5xl font-bold tracking-[-0.025em] sm:text-6xl"
                    style={{ fontFeatureSettings: "'tnum'" }}
                  >
                    {stat.value}
                  </div>
                  <div>
                    <p className="variant-serif text-[16px] leading-[1.55]">
                      {stat.label}.
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] opacity-70">
                      Source no. {String(i + 1).padStart(2, "0")} · DSIT, Jan 2026
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
              Chapter Four · The price
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
            <p className="variant-serif mt-4 max-w-xl text-[17px] italic leading-[1.65] text-muted-foreground">
              Start free. Learn everything in three months. Stay current for
              less than a flat white.
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
                      ? "border-primary shadow-[0_2px_24px_oklch(0.62_0.13_40_/_0.15)] lg:-translate-y-1"
                      : "border-border")
                  }
                >
                  {tier.flag && (
                    <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                      {tier.flag}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {tier.badge}
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-[-0.025em]">
                      {tier.price}
                    </span>
                    <span className="variant-serif text-[14px] italic text-muted-foreground">
                      {tier.per}
                    </span>
                  </div>
                  <ul className="variant-serif mt-6 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-foreground"
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
                      className="mt-7 w-full cursor-not-allowed rounded-full border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={
                        "mt-7 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-medium transition-opacity " +
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

      {/* ───── Final CTA — Ink-Deep panel ───────────────────────────── */}
      <section className="variant-panel">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.22em] opacity-70">
              Postscript
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-5xl md:text-6xl">
              The credential decays
              <br />
              <span className="variant-serif italic">if you stop.</span>
              <br />
              So does the gap.
            </h2>
            <p className="variant-serif mt-7 max-w-xl text-[19px] leading-[1.65] opacity-90">
              Five hours a week. Ninety-four projects. A score employers verify
              on the spot. Start free, decide later.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
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
      <footer>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
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
                A three-month AI course and verifiable credential. Built around
                UK research. Independent of any vendor or government programme.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-primary">
                  Course
                </h3>
                <ul className="variant-serif mt-4 space-y-2 text-[14px]">
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
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-primary">
                  Company
                </h3>
                <ul className="variant-serif mt-4 space-y-2 text-[14px]">
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
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-primary">
                  Legal
                </h3>
                <ul className="variant-serif mt-4 space-y-2 text-[14px]">
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
            <span>Variant C · Quiet Essay · Volume One</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
