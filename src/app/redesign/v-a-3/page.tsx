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
  title: "A3 · Field Notebook · Bold · Redesign",
}

/**
 * Variant A3 — "Field Notebook · Bold Typographic"
 *
 * Pushes A's typography hard. Massive H1 (clamps to ~120px desktop).
 * Three drench sections instead of two (hero adjacent + pillars + final
 * panel) for stronger rhythm. Larger pricing cards. More confident
 * asymmetry — same calm voice, bigger visual conviction.
 */
export default function VariantA3() {
  const journeys = JOURNEYS.slice(0, 6)

  return (
    <div
      data-variant="a"
      className="min-h-screen bg-background font-sans text-foreground"
    >
      {/* ───── Top nav ───────────────────────────────────────────────── */}
      <header className="border-b border-border/60 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/redesign/v-a-3"
            className="text-base font-semibold tracking-tight"
          >
            GWTH.ai
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
            className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ───── Hero — massive display ───────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-20 sm:px-8 md:pt-20 md:pb-28">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary">
            A 3-month AI course · 94 projects · UK independent
          </p>
          <h1
            className="mt-8 font-semibold tracking-[-0.028em]"
            style={{
              fontSize: "clamp(56px, 9vw, 132px)",
              lineHeight: "0.95",
            }}
          >
            Stop watching AI
            <br />
            change the world.
            <br />
            <span className="text-gradient">Start building with it.</span>
          </h1>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-start lg:gap-16">
            <div className="max-w-xl">
              <p className="text-[20px] leading-[1.6] text-muted-foreground">
                Five hours a week. Ninety-four hands-on projects. Plain English
                in, working AI tools out — we assume zero Python.
              </p>
              <p className="mt-5 text-[20px] leading-[1.6] text-muted-foreground">
                Every project you ship updates a verifiable credential UK
                employers can check on the spot.
              </p>

              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-medium text-primary-foreground transition-all hover:translate-y-[-1px] hover:shadow-md"
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#credential"
                  className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  See how the score works
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroDevice />
            </div>
          </div>
        </div>

        <div className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
            <div className="flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Built around UK research
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

      {/* ───── Pillars — Ink-Deep-Teal PANEL (bold drench 1) ────────── */}
      <section id="credential" className="variant-panel">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 md:py-36">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] opacity-75">
            The product
          </p>
          <h2
            className="mt-5 font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(44px, 6.5vw, 88px)", lineHeight: "0.98" }}
          >
            94 projects. One score.
            <br />
            <span className="opacity-85">Plain English.</span>
          </h2>

          <ol className="mt-20 grid gap-12 md:grid-cols-3">
            {PRODUCT_PILLARS.map((p) => (
              <li key={p.n} className="flex flex-col">
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] opacity-75">
                  {p.n} · {p.label}
                </span>
                <h3 className="mt-5 text-[28px] font-semibold leading-[1.15] tracking-[-0.012em] sm:text-[32px]">
                  {p.title}
                </h3>
                <p className="mt-5 text-[16px] leading-[1.7] opacity-85">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── Journey grid ─────────────────────────────────────────── */}
      <section id="course" className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary">
            Six readers
          </p>
          <h2
            className="mt-5 font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: "1" }}
          >
            Different reasons.
            <br />
            <span className="text-gradient">Same course.</span>
          </h2>

          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((j) => (
              <li key={j.n}>
                <Link
                  href={j.href}
                  className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        "rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider " +
                        (j.accent === "mint"
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary")
                      }
                    >
                      {j.tag}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                      {j.n}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[19px] font-semibold leading-[1.25] tracking-[-0.012em]">
                    {j.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.65] text-muted-foreground">
                    {j.body}
                  </p>
                  {j.stat && (
                    <div
                      className={
                        "mt-6 rounded-2xl p-4 " +
                        (j.accent === "mint"
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary")
                      }
                    >
                      <div className="text-3xl font-bold tracking-[-0.02em]">
                        {j.stat.value}
                      </div>
                      <div className="text-[11px] opacity-80">{j.stat.label}</div>
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-7 text-[14px] font-medium text-foreground">
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

      {/* ───── Stats — Mint DRENCH (bold drench 2) ──────────────────── */}
      <section className="variant-drench">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] opacity-75">
            The UK gap
          </p>
          <h2
            className="mt-5 font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: "1" }}
          >
            UK workers and businesses
            <br />
            are falling behind on AI.
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {UK_STATS.map((stat, i) => (
              <article
                key={stat.value}
                className="flex flex-col border-t-2 border-current/30 pt-7"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
                  Stat {String(i + 1).padStart(2, "0")} · DSIT
                </span>
                <div
                  className="mt-3 font-bold tracking-[-0.04em]"
                  style={{
                    fontSize: "clamp(72px, 11vw, 152px)",
                    lineHeight: "0.92",
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {stat.value}
                </div>
                <p className="mt-5 text-[16px] leading-[1.55] opacity-90">
                  {stat.label}.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pricing — bigger cards ───────────────────────────────── */}
      <section id="pricing" className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary">
            Pricing
          </p>
          <h2
            className="mt-5 font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: "1" }}
          >
            Less than the cost of one hour
            <br />
            <span className="text-muted-foreground">with an AI consultant.</span>
          </h2>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {PRICING.map((tier) => {
              const featured = Boolean(tier.flag)
              return (
                <article
                  key={tier.id}
                  className={
                    "relative flex flex-col rounded-3xl border bg-card p-9 transition-all " +
                    (featured
                      ? "border-primary shadow-2xl ring-1 ring-primary/20 lg:-translate-y-2"
                      : "border-border hover:-translate-y-0.5 hover:shadow-md")
                  }
                >
                  {tier.flag && (
                    <span className="absolute -top-3 left-9 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                      {tier.flag}
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {tier.badge}
                  </span>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span
                      className="font-bold tracking-[-0.03em]"
                      style={{ fontSize: "clamp(48px, 5vw, 64px)", lineHeight: "0.95" }}
                    >
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{tier.per}</span>
                  </div>
                  <ul className="mt-7 flex-1 space-y-3.5">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-foreground"
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
                      className="mt-8 w-full cursor-not-allowed rounded-md border border-border px-4 py-3 text-[14px] font-medium text-muted-foreground"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={
                        "mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-[14px] font-medium transition-colors " +
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

      {/* ───── Final CTA — Ink-Deep-Teal PANEL (bold drench 3) ──────── */}
      <section className="variant-panel">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 md:py-36">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] opacity-70">
            Start the course
          </p>
          <h2
            className="mt-5 font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: "0.98" }}
          >
            The credential decays
            <br />
            if you stop. So does the gap.
          </h2>
          <p className="mt-8 max-w-2xl text-[20px] leading-[1.6] opacity-85">
            Five hours a week. Ninety-four projects. A score employers verify on
            the spot. Start free, decide later.
          </p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-background px-7 py-4 text-[15px] font-medium text-foreground transition-all hover:opacity-90"
            >
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/labs"
              className="inline-flex items-center justify-center rounded-md border border-current/30 px-7 py-4 text-[15px] font-medium transition-colors hover:bg-current/10"
            >
              Try a free lab
            </Link>
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
                around UK research. Independent.
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
            <span>A3 · Field Notebook · Bold · v1.0</span>
          </div>
        </div>
      </footer>

      <div aria-hidden="true" className="h-20" />
    </div>
  )
}
