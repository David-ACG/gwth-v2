import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Lock } from "lucide-react"
import { HeroDevice } from "@/components/marketing/hero/hero-device"
import { LogoGwthMark } from "@/components/marketing/redesign/logo-gwth"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { cn } from "@/lib/utils"
import { CalcDisclosure } from "./calc-disclosure"
import { ShareRow } from "./share-row"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ state?: string }>
}

/**
 * Valid public-credential states surfaced via `?state=` for the demo
 * preview. `verified` is the production default; `educational` reveals
 * the "What is a GWTH Score?" panel for first-time visitors; `revoked`
 * replaces the score hero with a quiet, dignified record-only panel.
 */
type VerifyState = "verified" | "educational" | "revoked"
const VALID_STATES: ReadonlySet<string> = new Set([
  "verified",
  "educational",
  "revoked",
])

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!ENABLE_GWTH_SCORE) {
    return {
      title: "Public Credential Verification Disabled",
      description: "Public credential verification is disabled for beta.",
      robots: { index: false, follow: false },
    }
  }

  const { id } = await params
  return {
    title: `GWTH Certified Practitioner · Score Verification`,
    description: `Public canonical record for GWTH credential ${id}. Verifiable, dynamic, decaying.`,
    robots: { index: false, follow: false },
  }
}

/**
 * Public credential verify page (Stage 4 of the 2026-05-08 design-bundle
 * port). This is the canonical record a recruiter sees when they click a
 * candidate's GWTH Score link from LinkedIn. It is a standalone surface,
 * NOT inside the public marketing layout, the dashboard layout, or the
 * auth layout — only the root layout (fonts + theme provider) wraps it.
 *
 * The score-card hero reuses `<HeroDevice />` (the locked share-ticker
 * pattern from `src/components/marketing/hero/`) verbatim. The body uses
 * the Stone & Sage editorial register (Public Sans display, Vollkorn
 * italic accents, JetBrains Mono section labels, sharp bordered panels,
 * terracotta `#a94c2e` accent).
 *
 * Three states preview-able via `?state=verified|educational|revoked`:
 * - `verified` (default): score hero + meta strip + credential name +
 *   five reasons + collapsible calc + share row.
 * - `educational`: same as verified, plus a "What is a GWTH Score?"
 *   institutional explainer panel above the reasons; calc opens by
 *   default.
 * - `revoked`: the score hero is replaced by a quiet bordered panel
 *   ("CREDENTIAL REVOKED" + single dignified sentence). The five reasons
 *   and calc disclosure are hidden; a contact panel takes their place.
 *
 * The `id` route param will eventually drive a real lookup against the
 * credential backend; for Stage 4 the page renders the demo holder
 * already wired into HeroDevice / `EXAMPLE_SCORE_HISTORY`. See follow-up
 * beads for the real lookup, real revocation pathway, real LinkedIn
 * deep-link wiring (memory `linkedin-add-to-profile-future-feature-deferred-to`),
 * and score-history sparkline data binding.
 */
export default async function ScoreVerifyPage({
  params,
  searchParams,
}: PageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `id` will drive a real credential lookup once the backend is wired (Stage-4 follow-up beads).
  const { id: _id } = await params
  if (!ENABLE_GWTH_SCORE) {
    return <ScoreDisabledForBeta />
  }

  const sp = await searchParams
  const stateParam = sp.state ?? "verified"
  const state: VerifyState = VALID_STATES.has(stateParam)
    ? (stateParam as VerifyState)
    : "verified"

  return (
    <div
      data-variant="e2-e"
      className="font-sans flex min-h-screen flex-col bg-background text-foreground"
    >
      <VerifyHeader />

      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-[56px]">
        <div className="w-full max-w-[840px]">
          {state === "revoked" ? (
            <RevokedSurface />
          ) : (
            <VerifiedSurface state={state} />
          )}
        </div>
      </main>

      <VerifyFooter />
    </div>
  )
}

function ScoreDisabledForBeta() {
  return (
    <div
      data-variant="e2-e"
      className="font-sans flex min-h-screen flex-col bg-background text-foreground"
    >
      <VerifyHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 md:px-8">
        <section className="w-full max-w-[640px] border-2 border-foreground bg-card px-7 py-8 text-center">
          <SectionLabel>BETA ACCESS</SectionLabel>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em]">
            Public credential verification is disabled for beta.
          </h1>
          <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">
            The 23 June beta shows plain course progress to invited learners.
            Public credential pages return after beta.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex border-2 border-primary bg-primary px-5 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Join waitlist
          </Link>
        </section>
      </main>
      <VerifyFooter />
    </div>
  )
}

// ─── Page header / footer (bare shell) ────────────────────────────────────────

function VerifyHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-4 sm:px-6 sm:py-5 md:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2"
        aria-label="GWTH home"
      >
        <LogoGwthMark className="size-6" />
        <span className="text-[18px] font-extrabold tracking-[-0.02em] text-[var(--logo-wordmark)]">
          GWTH<span className="text-[var(--logo-accent)]">.ai</span>
        </span>
      </Link>
      <div className="hidden items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground sm:flex">
        <Lock className="size-3" aria-hidden="true" strokeWidth={1.5} />
        <span>
          {ENABLE_GWTH_SCORE ? "Public Credential Record" : "Beta Progress Record"}
        </span>
      </div>
    </header>
  )
}

function VerifyFooter() {
  return (
    <footer className="flex flex-col gap-3 border-t border-border bg-card px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-2">
          <Lock className="size-3.5" aria-hidden="true" strokeWidth={1.5} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Verified by gwth.ai
          </span>
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground sm:ml-3">
          Canonical record · 99.9 uptime
        </span>
      </div>
      <Link
        href={ENABLE_GWTH_SCORE ? "/about" : "/lessons"}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        {ENABLE_GWTH_SCORE ? "About the GWTH Score" : "About course progress"} &rarr;
      </Link>
    </footer>
  )
}

// ─── Verified / educational surfaces ──────────────────────────────────────────

function VerifiedSurface({ state }: { state: VerifyState }) {
  const isEducational = state === "educational"
  return (
    <>
      <ScoreCardSlot />
      <MetaStrip
        items={[
          { label: "LAST VERIFIED", value: "2 MAY 2026" },
          { label: "VERIFICATION ID", value: "C67SG#DDE5" },
          { label: "STATUS", value: "VERIFIED", tone: "success" },
        ]}
      />
      <BodyColumn>
        <CredentialName />
        {isEducational && <EducationalPanel />}
        <FiveReasonsPanel />
        <CalcDisclosure defaultOpen={isEducational} />
        <ShareRow />
        <CanonicalLine />
      </BodyColumn>
    </>
  )
}

/**
 * The locked share-ticker score card. Reuses `<HeroDevice />` so the
 * verify page and the home-page hero render the SAME card. Centred
 * inside the 840px verify column.
 */
function ScoreCardSlot() {
  return (
    <div className="flex justify-center">
      <HeroDevice />
    </div>
  )
}

/**
 * Two-column body wrapper; the bundle holds the credential prose at
 * ~720px even though the score card is allowed to extend a little wider.
 */
function BodyColumn({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[720px]">{children}</div>
}

// ─── Meta strip (institutional metadata) ──────────────────────────────────────

type MetaItem = {
  label: string
  value: string
  tone?: "success" | "warm" | "default"
}

function MetaStrip({ items }: { items: MetaItem[] }) {
  return (
    <div className="mx-auto mt-5 flex max-w-[720px] flex-wrap justify-between gap-x-6 gap-y-3 border-y-2 border-foreground py-3.5">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-baseline gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]"
        >
          <span className="text-muted-foreground">{it.label}</span>
          <span
            className={cn(
              "font-semibold",
              it.tone === "success" && "text-success",
              it.tone === "warm" && "variant-warm-text",
              (!it.tone || it.tone === "default") && "text-foreground"
            )}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Credential headline ──────────────────────────────────────────────────────

function CredentialName() {
  return (
    <div className="mt-9">
      <SectionLabel>CREDENTIAL</SectionLabel>
      <h1 className="mt-2.5 text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[32px]">
        GWTH Certified Practitioner.
        <br />
        <span className="font-serif text-[26px] font-medium italic text-primary sm:text-[30px]">
          Score 104, Top 1%.
        </span>
      </h1>
      <p className="mt-3.5 max-w-[640px] text-base leading-[1.6] text-muted-foreground">
        Issued by GWTH.ai, United Kingdom. The credential certifies that the
        named holder has completed the GWTH applied-AI course, passed every
        check question, and shipped three reviewed capstone projects. The
        score above is live and recomputes weekly.
      </p>
    </div>
  )
}

// ─── Educational panel (first-time visitor) ───────────────────────────────────

function EducationalPanel() {
  return (
    <section className="mt-9 border-2 border-foreground bg-card px-7 py-6 sm:px-8 sm:py-7">
      <SectionLabel>FIRST TIME HERE</SectionLabel>
      <h2 className="mt-2 mb-3.5 text-[24px] font-bold leading-[1.18] tracking-[-0.02em] text-foreground sm:text-[26px]">
        What is a GWTH Score?
      </h2>
      <p className="text-base leading-[1.6] text-foreground">
        A GWTH Score is a verified, dynamic measure of an individual&rsquo;s
        applied AI capability. The number above isn&rsquo;t a snapshot,
        it&rsquo;s a live reading: it climbs as the holder completes hands-on
        lesson work and reviewed capstone projects, and it decays if they
        stop keeping current.
      </p>
      <p className="mt-3.5 text-base leading-[1.6] text-muted-foreground">
        This page is the canonical record of the credential. The holder
        earned it on gwth.ai through 94+ projects across a 3-month course.
        The number, the tier, and the verification ID below are issued and
        maintained by GWTH.ai. Anyone with this URL can confirm the
        credential is live and current.
      </p>
    </section>
  )
}

// ─── Five credibility reasons (verbatim copy from BRIEF section 5) ────────────

const FIVE_REASONS: ReadonlyArray<{ lead: string; body: string }> = [
  {
    lead: "Always current.",
    body: "Lessons update constantly so students stay on the cutting edge, and the score decays if they don't keep up.",
  },
  {
    lead: "Hands-on, not lectured.",
    body: "Reaching 100 means completing 94+ hands-on projects across 3 modules, no passive watching.",
  },
  {
    lead: "Tested, not assumed.",
    body: "Every lesson has check questions; the course requires 3 capstone projects to graduate.",
  },
  {
    lead: "Paced, not crammed.",
    body: "The course is 3 months; lessons release in stages, no shortcuts, no rushing through.",
  },
  {
    lead: "A high score is a recent score.",
    body: "Above 100 means top 1% of applied-AI practitioners today, not when they enrolled.",
  },
]

function FiveReasonsPanel() {
  return (
    <section className="mt-9 border-2 border-foreground bg-card">
      <header className="border-b border-border px-7 pb-4 pt-5 sm:px-8 sm:pb-4.5 sm:pt-5.5">
        <SectionLabel>SECTION 01 / CREDIBILITY</SectionLabel>
        <h2 className="mt-2 text-[22px] font-bold leading-[1.18] tracking-[-0.02em] text-foreground sm:text-[26px]">
          What this score tells an employer.
          <br />
          <span className="font-serif text-[20px] font-medium italic text-primary sm:text-[24px]">
            5 reasons it&rsquo;s credible.
          </span>
        </h2>
      </header>
      <ol className="m-0 list-none p-0">
        {FIVE_REASONS.map((r, i) => (
          <li
            key={i}
            className={cn(
              "grid grid-cols-[40px_1fr] items-baseline gap-5 px-7 py-5 sm:grid-cols-[64px_1fr] sm:gap-5 sm:px-8",
              i > 0 && "border-t border-border"
            )}
          >
            <div className="pt-1 font-mono text-[12px] font-bold uppercase tracking-[0.16em] tabular-nums text-muted-foreground">
              0{i + 1}
            </div>
            <div className="leading-[1.55]">
              <span className="font-serif text-[18px] font-medium italic text-foreground sm:text-[19px]">
                {r.lead}
              </span>{" "}
              <span className="text-[15px] text-muted-foreground">
                {r.body}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ─── Canonical line (tail) ────────────────────────────────────────────────────

function CanonicalLine() {
  return (
    <section className="mt-14 flex flex-wrap items-baseline justify-between gap-4 border-t border-border pt-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Canonical URL · gwth.ai/score/c67sg#dde5
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Issued by GWTH.ai · UK · No expiry
      </div>
    </section>
  )
}

// ─── Revoked surface ──────────────────────────────────────────────────────────

function RevokedSurface() {
  return (
    <>
      <RevokedHero />
      <MetaStrip
        items={[
          { label: "REVOKED ON", value: "28 APR 2026" },
          { label: "VERIFICATION ID", value: "C67SG#DDE5" },
          { label: "STATUS", value: "REVOKED" },
        ]}
      />
      <BodyColumn>
        <div className="mt-9">
          <SectionLabel>CREDENTIAL · ON RECORD</SectionLabel>
          <h1 className="mt-2.5 text-[28px] font-bold leading-[1.18] tracking-[-0.025em] text-muted-foreground sm:text-[30px]">
            GWTH Certified Practitioner.
            <br />
            <span className="font-serif text-[26px] font-medium italic text-muted-foreground sm:text-[28px]">
              No longer recognised by the issuer.
            </span>
          </h1>
        </div>

        <section className="mt-8 border border-border bg-card px-7 py-6 sm:px-8 sm:py-7">
          <SectionLabel>CONTACT</SectionLabel>
          <p className="mt-3 text-base leading-[1.6] text-foreground">
            If you believe this is in error, contact{" "}
            <a
              href="mailto:verify@gwth.ai"
              className="border-b border-primary pb-px text-primary transition-colors hover:text-foreground hover:border-foreground"
            >
              verify@gwth.ai
            </a>
            .
          </p>
          <p className="mt-3.5 text-[14px] leading-[1.55] text-muted-foreground">
            Revocation reasons include refund, manual review failure, or
            breach of the credential terms. The verification ID and the
            holder&rsquo;s name remain on record so prior third-party
            references can be reconciled.
          </p>
        </section>

        <CanonicalLine />
      </BodyColumn>
    </>
  )
}

function RevokedHero() {
  return (
    <section className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/70" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-warning/70" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-success/70" aria-hidden="true" />
        <span className="ml-3 truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground line-through opacity-70">
          gwth.ai/score/c67sg#dde5
        </span>
      </div>

      <div className="px-7 pb-9 pt-9 sm:px-10 sm:pb-9 sm:pt-10">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-semibold text-primary-foreground">
            AE
          </div>
          <div className="leading-tight">
            <div className="text-[20px] font-semibold text-foreground">
              Alex Example
            </div>
            <div className="text-[14.5px] text-muted-foreground">
              Operations Lead · UK
            </div>
          </div>
        </div>

        <div className="mt-8 border border-border bg-muted px-7 py-7 text-center sm:px-8 sm:py-8">
          <div className="font-mono text-[12.5px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Credential Revoked
          </div>
          <p className="mx-auto mt-3.5 max-w-[480px] text-base leading-[1.55] text-muted-foreground">
            This credential is no longer valid as of 28 April 2026.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Inline subcomponents ─────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  )
}
