"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Check, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { LogoGwth } from "./logo-gwth"
import {
  JOURNEYS,
  PRICING,
  UK_STATS,
  RESEARCH_SOURCES,
} from "@/components/marketing/data"

/**
 * Live colour explorer for the new vector logo (`/logo-gwth.svg`).
 *
 * Four axes — light/dark × wordmark/accent — let a reviewer see the
 * mark across both modes against a representative E2-E homepage layout.
 * Logo appears in the masthead (large) and the footer (small).
 *
 * The site palette anchors the swatch options:
 * - Wordmark options lean on warm-dark / warm-light tones from the
 *   E2-E `--foreground` family (no pure-black, no pure-white).
 * - Accent options orbit the locked terracotta CTA `#a94c2e`,
 *   the gold `--variant-warm`, and the original brand teal.
 */

type Swatch = { hex: string; label: string }

// Light-mode wordmark — must sit on the near-white E2-E background.
// All options are deeply darkened earth/forest tones.
const LIGHT_WORDMARK_OPTIONS: readonly Swatch[] = [
  { hex: "#0a0a0a", label: "Near black" },
  { hex: "#010101", label: "Original black" },
  { hex: "#1a1f1a", label: "Charcoal forest" },
  { hex: "#22301f", label: "E2-E dark forest" },
  { hex: "#2a2520", label: "Dark espresso" },
  { hex: "#0f2624", label: "Deep teal-black" },
  { hex: "#2c2a26", label: "Warm charcoal" },
  { hex: "#1f1d1a", label: "Soot" },
  { hex: "#3a3530", label: "Dark stone" },
  { hex: "#a94c2e", label: "Terracotta wordmark" },
  { hex: "#22301f", label: "Forest wordmark" },
  { hex: "#5e4a3a", label: "Walnut" },
] as const

// Light-mode accent — sits on near-white background, anchors terracotta.
const LIGHT_ACCENT_OPTIONS: readonly Swatch[] = [
  { hex: "#a94c2e", label: "Terracotta CTA (locked)" },
  { hex: "#36bc99", label: "Original teal" },
  { hex: "#c79a4a", label: "Mustard gold" },
  { hex: "#d4a73c", label: "Bright gold" },
  { hex: "#a8533a", label: "Warm rust" },
  { hex: "#22301f", label: "Forest" },
  { hex: "#6f876c", label: "Sage" },
  { hex: "#2f5a4a", label: "Deep teal" },
  { hex: "#88332a", label: "Deep rust" },
  { hex: "#bb4534", label: "Light terracotta" },
  { hex: "#8a8170", label: "Warm stone" },
  { hex: "#0a0a0a", label: "Mono black" },
] as const

// Dark-mode wordmark — sits on near-black E2-E background.
// Warm off-whites and cream tones.
const DARK_WORDMARK_OPTIONS: readonly Swatch[] = [
  { hex: "#edeae6", label: "Warm off-white (locked fg)" },
  { hex: "#ffffff", label: "Pure white" },
  { hex: "#f5efe1", label: "Cream" },
  { hex: "#e8e0cf", label: "Light parchment" },
  { hex: "#d4ccba", label: "Light stone" },
  { hex: "#f0eadc", label: "Warm linen" },
  { hex: "#d6cfc2", label: "Driftwood" },
  { hex: "#c79a4a", label: "Mustard gold" },
  { hex: "#e0d9ca", label: "Bone" },
  { hex: "#f2e8d5", label: "Pale mustard" },
  { hex: "#ddd2bf", label: "Sand" },
  { hex: "#a94c2e", label: "Terracotta" },
] as const

// Dark-mode accent — sits on near-black bg, must pop without going neon.
const DARK_ACCENT_OPTIONS: readonly Swatch[] = [
  { hex: "#a94c2e", label: "Terracotta CTA (locked)" },
  { hex: "#36bc99", label: "Original teal" },
  { hex: "#c79a4a", label: "Mustard gold" },
  { hex: "#d4a73c", label: "Bright gold" },
  { hex: "#bb4534", label: "Light terracotta" },
  { hex: "#cc6155", label: "Coral red" },
  { hex: "#e8b34a", label: "Light gold" },
  { hex: "#8a8170", label: "Warm stone" },
  { hex: "#6f876c", label: "Sage" },
  { hex: "#d28a5e", label: "Light rust" },
  { hex: "#5cc8a8", label: "Light mint" },
  { hex: "#edeae6", label: "Off-white mono" },
] as const

type SwatchRowProps = {
  label: string
  options: readonly Swatch[]
  value: string
  onChange: (hex: string) => void
}

function SwatchRow({ label, options, value, onChange }: SwatchRowProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:w-44">
        {label}
      </span>
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {options.map((opt, idx) => {
          const active = value.toLowerCase() === opt.hex.toLowerCase()
          return (
            <button
              key={`${opt.hex}-${idx}`}
              type="button"
              onClick={() => onChange(opt.hex)}
              title={`${opt.label} · ${opt.hex}`}
              aria-label={`${opt.label} ${opt.hex}`}
              aria-pressed={active}
              className={
                "size-7 shrink-0 rounded-full border transition-all " +
                (active
                  ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 ring-offset-white dark:border-white dark:ring-white dark:ring-offset-neutral-900"
                  : "border-neutral-300 hover:scale-110 dark:border-neutral-700")
              }
              style={{ backgroundColor: opt.hex }}
            />
          )
        })}
        <span className="ml-2 shrink-0 font-mono text-[11px] text-neutral-500">
          {value}
        </span>
      </div>
    </div>
  )
}

export function LogoExplorer() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Defaults pull from the locked E2-E palette so the page opens on a
  // sensible baseline. Reviewers can A/B from there.
  const [lightWordmark, setLightWordmark] = React.useState("#22301f")
  const [lightAccent, setLightAccent] = React.useState("#a94c2e")
  const [darkWordmark, setDarkWordmark] = React.useState("#edeae6")
  const [darkAccent, setDarkAccent] = React.useState("#a94c2e")

  const isDark = mounted && resolvedTheme === "dark"
  const wordmark = isDark ? darkWordmark : lightWordmark
  const accent = isDark ? darkAccent : lightAccent

  const journeys = JOURNEYS.slice(0, 6)

  return (
    <>
      {/* ───── Sticky control bar ────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <Link
                href="/logo_picker"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300"
              >
                logo_picker
              </Link>
              <span className="hidden text-[11px] text-neutral-500 sm:inline">
                Recolour the mark · click any swatch · toggle theme to tune both modes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/redesign_v2"
                className="rounded-full px-3 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Palette explorer
              </Link>
              <button
                type="button"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="rounded-full p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {isDark ? (
                  <Sun className="size-4" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Active mode label so it's obvious which rows are live */}
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Active mode: <span className="text-neutral-900 dark:text-neutral-100">{isDark ? "Dark" : "Light"}</span>
            <span className="ml-3 text-neutral-400">— rows for the inactive mode are still editable, just toggle the theme to preview them.</span>
          </p>

          <SwatchRow
            label="Light · wordmark"
            options={LIGHT_WORDMARK_OPTIONS}
            value={lightWordmark}
            onChange={setLightWordmark}
          />
          <SwatchRow
            label="Light · accent"
            options={LIGHT_ACCENT_OPTIONS}
            value={lightAccent}
            onChange={setLightAccent}
          />
          <SwatchRow
            label="Dark · wordmark"
            options={DARK_WORDMARK_OPTIONS}
            value={darkWordmark}
            onChange={setDarkWordmark}
          />
          <SwatchRow
            label="Dark · accent"
            options={DARK_ACCENT_OPTIONS}
            value={darkAccent}
            onChange={setDarkAccent}
          />
        </div>
      </div>

      {/* ───── Dummy E2-E homepage with the recoloured logo ─────────── */}
      <div
        data-variant="e2-e"
        className="min-h-screen bg-background font-sans text-foreground"
      >
        {/* Masthead — logo prominent */}
        <header className="border-b-2 border-foreground bg-background">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
            <Link href="/logo_picker" className="flex items-center gap-3">
              <LogoGwth
                wordmarkColor={wordmark}
                accentColor={accent}
                width={170}
                className="h-9 w-auto"
              />
              <span className="variant-serif hidden text-[12px] italic text-muted-foreground sm:inline">
                The AI Field Manual
              </span>
            </Link>
            <nav className="hidden items-center gap-7 text-[14px] font-medium md:flex">
              <Link href="#course" className="transition-colors hover:text-primary">Course</Link>
              <Link href="#credential" className="transition-colors hover:text-primary">Credential</Link>
              <Link href="#stats" className="transition-colors hover:text-primary">Research</Link>
              <Link href="#pricing" className="transition-colors hover:text-primary">Pricing</Link>
            </nav>
            <Link
              href="/signup"
              className="rounded-none border-2 border-primary bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </header>

        {/* Hero — gives the masthead context */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
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

            <div className="mt-12 max-w-3xl">
              <h1 className="text-[44px] font-bold leading-[0.98] tracking-[-0.025em] sm:text-[60px] md:text-[72px]">
                Stop watching AI change the world.
              </h1>
              <p className="variant-serif mt-7 max-w-xl text-3xl italic leading-[1.05] text-primary sm:text-[40px]">
                Start building with it.
              </p>

              <div className="variant-serif mt-10 max-w-xl space-y-4 text-[18px] leading-[1.7] text-foreground/85">
                <p>
                  A 3-month AI course and a dynamic, verifiable credential.
                  Five hours a week, ninety-four hands-on projects, plain
                  English.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-1.5 border-2 border-primary bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#credential"
                  className="inline-flex items-center justify-center border-2 border-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Read more
                </Link>
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

        {/* Journey grid — gives the page some breathing visual variety */}
        <section id="course" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <div className="max-w-3xl">
              <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
                Section 02 — Six readers
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.022em] sm:text-4xl md:text-5xl">
                Different reasons.{" "}
                <span className="variant-serif italic text-primary">Same course.</span>
              </h2>
            </div>

            <ul className="mt-12 grid gap-0 border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-3 sm:border-l-2">
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

        {/* Stats drench — shows logo nowhere but gives palette context */}
        <section id="stats" className="variant-drench">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
                  Section 03 — The UK gap
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.022em] sm:text-4xl md:text-5xl">
                  UK workers and businesses are falling behind on AI.
                </h2>
              </div>
              <div className="space-y-0">
                {UK_STATS.slice(0, 3).map((stat, i) => (
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
                        Source: DSIT, Jan 2026 · Citation no. {String(i + 1).padStart(2, "0")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Logo size variants — see the mark at multiple scales */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
              Logo sizes
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.022em] sm:text-4xl">
              The mark at four common scales.
            </h2>
            <p className="variant-serif mt-3 max-w-xl text-[16px] italic leading-[1.6] text-muted-foreground">
              Hero header (260) · masthead (170) · footer (120) · favicon-equivalent (32).
            </p>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {[
                { w: 260, label: "260 · Hero" },
                { w: 170, label: "170 · Masthead" },
                { w: 120, label: "120 · Footer" },
                { w: 32, label: "32 · Mark only" },
              ].map(({ w, label }) => (
                <div
                  key={w}
                  className="flex flex-col items-center gap-4 border border-border bg-background p-6"
                >
                  <div className="flex h-24 w-full items-center justify-center">
                    <LogoGwth wordmarkColor={wordmark} accentColor={accent} width={w} />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Postscript on the warm-stone / forest panel — logo on coloured bg */}
        <section className="variant-panel">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
            <div className="max-w-4xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-75">
                Postscript
              </p>
              <h2 className="mt-3 text-4xl font-bold leading-[1.0] tracking-[-0.025em] sm:text-5xl md:text-6xl">
                The credential decays
                <br />
                <span className="variant-serif italic">if you stop.</span>
                <br />
                So does the gap.
              </h2>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-1.5 border-2 border-primary-foreground bg-primary-foreground px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-transparent hover:text-primary-foreground"
                >
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Logo on the coloured panel — separate test */}
              <div className="mt-12 flex flex-col gap-3 border-t-2 border-current/40 pt-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
                  Logo on coloured panel
                </span>
                <LogoGwth
                  wordmarkColor={wordmark}
                  accentColor={accent}
                  width={170}
                  className="h-9 w-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing — taste of CTA + accent in cards */}
        <section id="pricing" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <div className="max-w-3xl">
              <p className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">
                Section 04 — Pricing
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.022em] sm:text-4xl md:text-5xl">
                Less than the cost of one hour with an{" "}
                <span className="variant-serif italic text-primary">AI consultant.</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-0 border-2 border-foreground sm:grid-cols-3">
              {PRICING.map((tier, i) => {
                const featured = Boolean(tier.flag)
                const isStay = tier.id === "stay"
                return (
                  <article
                    key={tier.id}
                    className={
                      "relative flex flex-col p-7 " +
                      (i < PRICING.length - 1 ? "sm:border-r-2 sm:border-foreground " : "") +
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
                        (featured || isStay ? "opacity-80" : "text-muted-foreground")
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
                      <span className="text-5xl font-bold tracking-[-0.025em]">{tier.price}</span>
                      <span
                        className={
                          "variant-serif text-[14px] italic " +
                          (featured || isStay ? "opacity-85" : "text-muted-foreground")
                        }
                      >
                        {tier.per}
                      </span>
                    </div>
                    <ul className="variant-serif mt-7 flex-1 space-y-3">
                      {tier.features.slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-[15px] leading-[1.55]"
                        >
                          <Check className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer — logo small */}
        <footer className="bg-background">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
            <div className="flex flex-col gap-8 border-b-2 border-foreground pb-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-sm">
                <LogoGwth
                  wordmarkColor={wordmark}
                  accentColor={accent}
                  width={120}
                  className="h-7 w-auto"
                />
                <p className="variant-serif mt-4 text-[14px] italic leading-[1.7] text-muted-foreground">
                  A three-month AI course and verifiable credential. Built around UK research.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <h3 className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">Course</h3>
                  <ul className="mt-4 space-y-2 text-[14px]">
                    <li><Link href="/lessons" className="hover:text-primary">Lessons</Link></li>
                    <li><Link href="/labs" className="hover:text-primary">Free labs</Link></li>
                    <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">Company</h3>
                  <ul className="mt-4 space-y-2 text-[14px]">
                    <li><Link href="/about" className="hover:text-primary">About</Link></li>
                    <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="variant-warm-text text-[11px] font-bold uppercase tracking-[0.2em]">Legal</h3>
                  <ul className="mt-4 space-y-2 text-[14px]">
                    <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
                    <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 GWTH.ai · Made in the UK</span>
              <span>logo_picker · vector mark explorer</span>
            </div>
          </div>
        </footer>

        <div aria-hidden="true" className="h-8" />
      </div>
    </>
  )
}
