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
  title: "G · Architectural · Redesign",
}

/**
 * Redesign Variant G — "Architectural" · NO GRADIENTS
 *
 * Solid colour blocks per section. Big Shoulders Display (display) +
 * Hanken Grotesk (body). Black + warm cream + saturated ochre. Mid-
 * century / Bauhaus / Eye-magazine grid. No rounded corners on cards;
 * no opacity-wash backgrounds; no gradient text.
 *
 * The score widget's gradient flattens because `--accent` is collapsed
 * to match `--primary` in this variant scope.
 */
export default function VariantG() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="g"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/redesign/v-g" className="flex items-baseline gap-3">
            <span className="variant-display text-2xl font-black uppercase tracking-tight">
              GWTH.ai
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-[12px] font-bold uppercase tracking-[0.14em] md:flex">
            <Link href="#course" className="transition-colors hover:text-primary">
              Course
            </Link>
            <Link href="#credential" className="transition-colors hover:text-primary">
              Credential
            </Link>
            <Link href="#stats" className="transition-colors hover:text-primary">
              Research
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav>
          <Link
            href="/signup"
            className="bg-foreground px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ───── Hero — split block, ochre right column ───────────────── */}
      <section className="border-b-2 border-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="grid lg:grid-cols-[1.3fr_1fr]">
            <div className="border-foreground py-20 md:py-28 lg:border-r-2 lg:pr-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                01 — Issue Zero · UK · Independent
              </p>
              <h1 className="variant-display mt-6 text-[60px] font-black uppercase leading-[0.92] tracking-[-0.02em] sm:text-[88px] md:text-[120px]">
                Stop watching.
                <br />
                Start building.
              </h1>
              <p className="mt-8 max-w-xl text-[18px] leading-[1.55] text-muted-foreground">
                A 3-month AI course and a dynamic, verifiable credential.
                Five hours a week. Ninety-four hands-on projects. Plain
                English. We assume zero Python.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-1.5 bg-primary px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#credential"
                  className="inline-flex items-center justify-center border-2 border-foreground px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  See the credential
                </Link>
              </div>
            </div>

            <div className="flex justify-center bg-primary py-16 md:py-20 lg:justify-end lg:py-28">
              <div className="px-6 lg:px-12">
                <p className="variant-display mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                  Your dynamic score
                </p>
                <HeroDevice />
              </div>
            </div>
          </div>
        </div>

        {/* Research strip — solid foreground bar */}
        <div className="border-t-2 border-foreground bg-foreground text-background">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-5 text-[11px] uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span className="font-bold">Built around UK research</span>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 font-medium">
              {RESEARCH_SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Pillars — three blocks separated by hairlines ────────── */}
      <section id="credential" className="border-b-2 border-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="border-foreground py-16 md:py-20 lg:border-b-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              02 — The product
            </p>
            <h2 className="variant-display mt-3 text-[44px] font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-[64px] md:text-[80px]">
              94 projects.
              <br />
              One score.
              <br />
              Plain English.
            </h2>
          </div>

          <div className="grid border-foreground md:grid-cols-3">
            {PRODUCT_PILLARS.map((p, i) => (
              <article
                key={p.n}
                className={
                  "py-12 md:py-16 " +
                  (i < PRODUCT_PILLARS.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2 border-foreground md:pr-8 " : "md:pl-8 ") +
                  (i > 0 && i < PRODUCT_PILLARS.length - 1 ? "md:px-8 " : "") +
                  (i === 0 ? "md:pr-8 " : "")
                }
              >
                <p className="variant-display text-[10rem] font-black leading-[0.85] text-primary">
                  {p.n}
                </p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {p.label}
                </p>
                <h3 className="variant-display mt-4 text-[28px] font-black uppercase leading-[0.95] tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="mt-5 text-[15px] leading-[1.65] text-foreground/85">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Journey grid — heavy block grid ──────────────────────── */}
      <section id="course" className="border-b-2 border-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="border-b-2 border-foreground py-16 md:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              03 — Six readers
            </p>
            <h2 className="variant-display mt-3 text-[44px] font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-[64px] md:text-[80px]">
              Different reasons.
              <br />
              Same course.
            </h2>
          </div>

          <ul className="grid border-foreground sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j, i) => (
              <li
                key={j.n}
                className={
                  "border-foreground " +
                  // Bottom border on all except the bottom row at lg
                  "border-b-2 " +
                  // Right border on all except every nth (last in row)
                  ((i + 1) % 2 !== 0 ? "sm:border-r-2 " : "") +
                  ((i + 1) % 3 !== 0 ? "lg:border-r-2 " : "lg:border-r-0 ") +
                  // Override sm right-border at lg if needed
                  ""
                }
              >
                <Link
                  href={j.href}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-primary/15"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-foreground px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-background">
                      {j.tag}
                    </span>
                    <span className="variant-display text-3xl font-black text-primary">
                      {j.n}
                    </span>
                  </div>
                  <h3 className="variant-display mt-5 text-[22px] font-black uppercase leading-[0.95] tracking-[-0.01em]">
                    {j.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[14.5px] leading-[1.65] text-foreground/80">
                    {j.body}
                  </p>
                  {j.stat && (
                    <div className="mt-5 border-t-2 border-foreground pt-3">
                      <span className="variant-display text-3xl font-black text-primary">
                        {j.stat.value}
                      </span>
                      <p className="text-[12px] text-muted-foreground">
                        {j.stat.label}
                      </p>
                    </div>
                  )}
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">
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

      {/* ───── Stats — Ochre DRENCH block ───────────────────────────── */}
      <section id="stats" className="variant-drench border-b-2 border-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="border-foreground py-16 md:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
              04 — The UK gap
            </p>
            <h2 className="variant-display mt-3 text-[44px] font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-[64px] md:text-[80px]">
              UK workers.
              <br />
              Falling behind on AI.
            </h2>
          </div>

          <div className="grid border-foreground md:grid-cols-3">
            {UK_STATS.map((stat, i) => (
              <article
                key={stat.value}
                className={
                  "py-10 md:py-12 " +
                  (i < UK_STATS.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2 border-foreground md:pr-8 " : "md:pl-8 ") +
                  (i > 0 && i < UK_STATS.length - 1 ? "md:px-8 " : "") +
                  (i === 0 ? "md:pr-8 " : "")
                }
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                  Stat {String(i + 1).padStart(2, "0")} · DSIT
                </p>
                <div
                  className="variant-display mt-3 text-[8rem] font-black leading-[0.82] tracking-[-0.025em]"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  {stat.value}
                </div>
                <p className="mt-4 max-w-xs text-[15px] leading-[1.55]">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pricing — three solid blocks ─────────────────────────── */}
      <section id="pricing" className="border-b-2 border-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="border-b-2 border-foreground py-16 md:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              05 — Pricing
            </p>
            <h2 className="variant-display mt-3 text-[44px] font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-[64px] md:text-[80px]">
              Less than one hour
              <br />
              with a consultant.
            </h2>
          </div>

          <div className="grid border-foreground sm:grid-cols-3">
            {PRICING.map((tier, i) => {
              const featured = Boolean(tier.flag)
              return (
                <article
                  key={tier.id}
                  className={
                    "flex flex-col p-7 md:p-9 " +
                    (i < PRICING.length - 1 ? "sm:border-r-2 sm:border-foreground " : "") +
                    (featured ? "bg-primary text-primary-foreground" : "bg-card")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        "text-[11px] font-bold uppercase tracking-[0.14em] " +
                        (featured ? "opacity-80" : "text-muted-foreground")
                      }
                    >
                      {tier.badge}
                    </span>
                    {tier.flag && (
                      <span className="border-2 border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                        ★ {tier.flag}
                      </span>
                    )}
                  </div>
                  <div
                    className="variant-display mt-6 text-[5rem] font-black leading-[0.85] tracking-[-0.025em]"
                    style={{ fontFeatureSettings: "'tnum'" }}
                  >
                    {tier.price}
                  </div>
                  <p
                    className={
                      "mt-2 text-[13px] " +
                      (featured ? "opacity-85" : "text-muted-foreground")
                    }
                  >
                    {tier.per}
                  </p>
                  <ul className="mt-7 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[14.5px] leading-[1.55]"
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
                          ? "bg-primary-foreground text-primary hover:bg-foreground hover:text-background"
                          : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground")
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

      {/* ───── Final CTA — Ink-Black PANEL ──────────────────────────── */}
      <section className="variant-panel">
        <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 md:py-32">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-75">
            06 — Start the course
          </p>
          <h2 className="variant-display mt-3 text-[60px] font-black uppercase leading-[0.92] tracking-[-0.02em] sm:text-[88px] md:text-[120px]">
            The credential
            <br />
            decays if you stop.
            <br />
            <span className="text-primary">So does the gap.</span>
          </h2>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1.5 bg-primary px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/labs"
              className="inline-flex items-center justify-center border-2 border-current px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-current hover:text-background"
            >
              Try a free lab
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-background">
        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
          <div className="flex flex-col gap-8 border-b-2 border-foreground pb-8 md:flex-row md:items-start md:justify-between">
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
                A 3-month AI course and verifiable credential. Built around
                UK research. Independent of any vendor or government
                programme.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Course
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li>
                    <Link href="/lessons" className="hover:text-primary">
                      Lessons
                    </Link>
                  </li>
                  <li>
                    <Link href="/labs" className="hover:text-primary">
                      Free labs
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-primary">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li>
                    <Link href="/about" className="hover:text-primary">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-primary">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2 text-[13px]">
                  <li>
                    <Link href="/privacy" className="hover:text-primary">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-primary">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 GWTH.ai · Made in the UK</span>
            <span>Variant G · Architectural · Issue 0</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
