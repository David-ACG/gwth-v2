# GWTH.ai Brand Brief — for Phase 0 logo + Phase 1 homepage redesign

**Date:** 2026-04-24 (started in pre-flight; revised 2026-04-25 after audience clarification)
**Author:** David + Claude
**Purpose:** Single source of truth for who GWTH is, who it serves, how it sounds, and what it must look like — to be fed into Gemini Stitch / OpenAI image tool (Phase 0) and Claude Design (Phase 1).

---

## 1. What GWTH is

GWTH.ai is a **3-month AI training platform**, UK-first, single-curriculum (not a marketplace). One core course — *"GWTH — Applied AI Skills"* — delivered over three months, with hands-on labs, projects that go in the student's portfolio, and a continuously-updated **Dynamic Score** the student can share to LinkedIn for employer verification.

GWTH stands for ***Growth With Tech and Humans***. The acronym expansion lives on the About page; it is not a hero tagline.

---

## 2. The audience — seven journeys, not one persona

GWTH serves **seven overlapping audience segments**. None of them are bootcamp dropouts or teenagers. All of them are paying for proof, not entertainment.

| # | Journey | Core motivation | Currently addressed on homepage? |
|---|---|---|---|
| 1 | **Worried about job** ("AI will replace me") | Defensive — don't get left behind | ✅ Yes |
| 2 | **Made redundant, need to reskill** | Defensive + identity-rebuild | ✅ Yes |
| 3 | **Founder / individual consultant** | Offensive — competitive moat for own business | ✅ Yes (small-business framing) |
| 4 | **Parent worried about children's future** | Family — equip the next generation | ✅ Yes |
| 5 | **Already using AI, wants expertise** | Mastery — go from "I use ChatGPT" to capable | ⚠️ Missing — add in Phase 1b |
| 6 | **Income-motivated** ("AI fluency = higher salary") | Offensive — career compounding | ⚠️ Missing — add in Phase 1b |
| 7 | **Senior leader / manager** ("my team needs to be competitive") | Strategic — team capability, not own learning | ⚠️ Missing — add in Phase 1b |

### 2a. Common thread across all seven

A mix of **defensive** (don't get left behind) and **offensive** (get ahead) motivations, anchored in **professional identity**. None of these audiences are looking for entertainment, gamification, or a streak counter to argue with. They want **measurable, verifiable, fast** capability gain.

### 2b. Existing journey-section copy (keep verbatim — confirmed by David 2026-04-25)

The four currently-on-homepage sections live in `src/app/(public)/page.tsx`. Voice template: short title starting "You [verb/condition]" + 1-paragraph description with concrete time commitment, concrete outcome, and a stat or fact where useful.

```
{ icon: AlertTriangle, color: "#F59E0B",
  title: "You are worried AI will take your job",
  description: "Someone who knows how to use AI will be more productive than you. This course makes you that person. In three months, you will be the one your team asks for help." }

{ icon: Briefcase, color: "#33BBFF",
  title: "You have been made redundant and need to reskill",
  description: "Five hours a week for three months. Every project you build goes in your portfolio. Every score is verifiable. UK employers are hiring for exactly these skills — and only 21% of UK workers feel confident using AI. That gap is your opportunity." }

{ icon: Store, ...,
  title: "You run a small business",
  description: "UK micro businesses are 45% less likely to adopt AI than large companies. That is about to change. Five hours a week for three months, and you will not need to hire a developer or pay a consultant — you will be able to do it all yourself." }

{ ..., color: "#1CBA93",
  title: "You are a parent thinking about the future",
  description: "AI fluency will not be a nice-to-have — it will be table stakes. No coding required. If your teenager can describe what they want, they can build with AI." }
```

### 2c. New journey-section copy — drafts for Phase 1b

To be added to the same data array in `src/app/(public)/page.tsx` during Phase 1b. Voice matched to existing — concrete time commitment, concrete outcome, no fabricated stats.

**Draft #5 — "Already using AI, wants expertise":**

```
title: "You already use AI but know there is more"
description: "ChatGPT for emails. Claude for first drafts. You suspect you're scratching the surface — and you are. The gap between casual user and capable practitioner is bigger than it looks. Five hours a week for three months, and you will not just use AI — you will design with it, automate with it, ship with it."
```

**Draft #6 — "Income-motivated":**

```
title: "You know AI fluency is now worth more"
description: "AI is one of the highest-premium skill sets in the UK job market right now. Three months, every project in your portfolio, every score on your verifiable Dynamic Score. Show up to your next salary conversation — or your next interview — with proof."
```

**Draft #7 — "Senior leader / team capability":**

```
title: "You lead a team and your competitors are moving faster"
description: "The bottleneck is not the tools — it is whether your team can actually use them well. The course works for individual employees and for whole teams ready to upskill together. Get in touch about cohort enrolment."
```

> **Open question for Phase 1b implementation:** does GWTH have team / cohort enrolment infrastructure live, or is the journey-7 copy written ahead of the feature? If the latter, soften the call to action ("get in touch") to set the right expectation.

---

## 3. Voice

| Voice attribute | What it means | Examples (from existing copy) |
|---|---|---|
| **Direct** | "You" address. Short sentences. No throat-clearing. | "Stop watching AI change the world. Start building with it." |
| **Plain English** | No jargon, no consulting-speak, no "harness", no "leverage", no "synergy" | "If your teenager can describe what they want, they can build with AI." |
| **Specific over abstract** | Concrete numbers (3 months, 5 hrs/wk, 21%, 45%) over fluff | "Only 21% of UK workers feel confident using AI." |
| **Confident, not aspirational-floaty** | Stating a fact about the future, not selling a vision | "AI fluency will not be a nice-to-have — it will be table stakes." |
| **Calm authority, not anxious-hype** | Acknowledges the fear without amplifying it | "You will be the one your team asks for help." |
| **Adult, not infantilising** | Never "Great job!", never sad mascots, never streak shame | (See dashboard synthesis §4h.) |
| **British, not American** | UK English spelling; UK-specific framing where relevant | "favour", "behaviour", "centre"; UK stats; CIPD references |

### 3a. Voice not-list

The voice is **NOT**:
- Slogan-cheesy ("Empower your future!", "Master tomorrow today!")
- Aspirational-floaty ("Imagine a world where...")
- Bootcamp-bro ("Crush it!", "Level up!", "10x your skills")
- Corporate-pablum ("Empowering knowledge-workers across verticals")
- Therapeutic / soft ("It's okay to feel uncertain about AI")
- Gamified ("+50 XP! You're on a 7-day streak!")
- Patronising ("Don't worry, no maths required!")
- Generic-startup ("The future of learning, reimagined")

### 3b. Hero copy — confirmed keep

> **"Stop watching AI change the world. Start building with it."**
>
> (Second sentence rendered in gradient text per current implementation.)

This is the canonical hero. Phase 0 logo direction must work *with* this energy: **active, kinetic, agency-focused, not passive or aspirational-floaty.**

---

## 4. The product story

### 4a. What GWTH gives the student

1. **A 3-month structured curriculum** (one course, three monthly modules)
2. **Hands-on labs and projects** — every artefact builds a portfolio
3. **A continuously-updated, verifiable Dynamic Score** they can share to LinkedIn — the credential employers can check
4. **Score decay** — keeps the credential current; students who stop reviewing see their score fall (honest signalling)
5. **No coding required** — entry barrier is plain English, not Python

### 4b. What GWTH explicitly does NOT do

- **No multi-course catalogue.** One course. Don't design like Coursera.
- **No coding-bootcamp framing.** Audience includes non-developers and never-will-be-developers.
- **No XP / public leaderboards / streak shaming.** (See dashboard synthesis §4.)
- **No live cohort dependency.** Async-first; cohort/community is enhancement, not core.
- **No "we'll help you change careers" promise** — it teaches AI skills usable in ANY current job, not a path to becoming an AI engineer.

### 4c. The "verifiable score" is core

GWTH's competitive edge over Coursera / Udemy / LinkedIn Learning is the **Dynamic Score** — a continuously-updated, public-verifiable credential. The logo and visual identity must be **trustworthy enough to function as a credential mark** when displayed next to a student's name on LinkedIn. This is a real constraint:

- Recognisable at small sizes (32–48px LinkedIn profile thumbnails)
- Not childish or gimmicky
- Not so sterile it looks like a generic certification mark
- Distinct enough that an employer who has seen the GWTH stamp before can spot it again

---

## 5. Visual direction — references and constraints

### 5a. Direct references (David confirmed 2026-04-25)

Visual reference set: **productivity tools, NOT e-learning incumbents.**

| Reference | Why |
|---|---|
| **Linear** | Calm, dense, dark-mode-first, premium without being precious |
| **Vercel** | Sharp typography, bold-but-restrained, professional |
| **Stripe** | Trust-first, KPI-card vocabulary, dependable feel |
| **Notion** | Clean, dual-mode, unfussy |
| **Supabase** | shadcn-native shell, dark-mode well-tuned |

NOT references: Coursera, Udemy, LinkedIn Learning, Duolingo, Khan Academy.

### 5b. Logo direction — try BOTH (David 2026-04-25, Q-F)

Phase 0 §5.3 step 2 explores both wordmark-only and icon-forward directions. To resolve: David asked to **try both** active/kinetic AND aspirational/floaty so we have something concrete to compare.

**Direction A — active, kinetic, agency-focused** (matches "Stop watching → Start building"):
- Sharp lines, asymmetric balance, motion implied
- Bold sans-serif for wordmark (Geist, Inter Display, Cabinet Grotesk)
- Icon mark: forward-leaning, structurally confident, possibly a connection / arrow / threshold metaphor
- Colour: bias toward higher-saturation accent on neutral ground (echoes Linear's accent-on-grey)

**Direction B — aspirational, floaty, more illustrative** (counter-test, against the current spiral):
- Softer geometry, organic forms, possibly retain the spiral metaphor
- Lighter sans-serif or even semi-serif for wordmark
- Icon mark: more illustrative, possibly using the existing spiral as inspiration without literally re-using it
- Colour: more atmospheric / gradient-friendly

Generate **at least 4 concepts in each direction** in Stitch / OpenAI tool. Pick one direction at the end of step 2 — not a hybrid.

### 5c. Palette — the OKLCH Graphite Warm starting point

Currently in `src/app/globals.css`, fully documented in `CLAUDE.md` Design System section. Per Plan §0 decision (2026-04-24), this palette is **NOT sacred** — Claude Design (Phase 1) may replace it wholesale or amend it.

**Use as starting point for Phase 0 logo colour exploration:**
- Primary aqua: `oklch(0.7 0.18 220)` (~`#33BBFF`)
- Accent mint: `oklch(0.65 0.16 165)` (~`#1CBA93`)
- Dark mode background: `oklch(0.17 0.005 60)` (~`#191817`) — warm charcoal
- Text on dark: `oklch(0.93 0.008 60)` (~`#EDEAE6`) — warm off-white

**The current palette's strengths:**
- Aqua + mint pair signals tech (aqua) + human/growth (mint) — accidentally fits the "Tech and Humans" reading
- Warm-charcoal dark mode (hue 60) avoids the green-tinted teal trap of most "tech" dark themes

**The current palette's weaknesses:**
- Aqua at `0.18 220` is bright; risks looking saas-ish next to Linear's restrained accent
- Light mode `oklch(0.98 0 0)` background is near-white, conventional

Phase 0 logo concepts can come back with their own palette suggestion — Claude Design will reconcile in Phase 1.

### 5d. Typography — current commitments

- **Headings + body:** Inter (variable, via `next/font/google`)
- **Code blocks:** JetBrains Mono

These are the working defaults. Phase 0 may propose alternatives (Geist, Cabinet Grotesk, Satoshi) for the wordmark logo specifically — but body typography stays Inter unless Phase 1 makes a strong case.

### 5e. Existing visual asset — the cascading spiral

`public/logo-spiral.svg` (+ 4 blur variants) currently animates in the homepage hero as four cascading layers. Per Plan §0 D4: keep the animation primitive as a resource Claude Design can choose to use, reject, or restyle. **Phase 0 logo work can ignore the spiral entirely** unless a concept naturally extends or replaces it.

---

## 6. Logo deliverables (Phase 0 hard requirements)

| Asset | Format | Sizes | Notes |
|---|---|---|---|
| Primary horizontal wordmark | SVG | — | The default everywhere — header, footer, marketing |
| Stacked variant | SVG | — | For square contexts (LinkedIn share image, OG image) |
| Icon-only mark | SVG | — | For the favicon, the Dynamic Score credential mark, app icons |
| Dark-mode variant | SVG | — | Inverted or recoloured for dark-mode use |
| PNG exports | PNG | 512, 256, 128 | For raster contexts (sharing, embed) |
| Favicon set | ICO / PNG | 32 ICO, 180 apple-touch, 192 PNG, 512 PNG | Generated via realfavicongenerator.net from the 512 master |
| Web manifest | JSON | — | Output from realfavicongenerator |

All committed under `public/` on `experiment/redesign-poc-2026-04`, with the `kanban/design-artefacts/2026-04-24/concepts/` folder retaining the rejected concepts for the record.

---

## 7. The brief in one paragraph (for pasting into Stitch / OpenAI image tool)

> **GWTH.ai is a 3-month AI training platform for working adults — not teenagers, not bootcamp dropouts. The audience spans seven journeys (job-anxious employees, redundant reskillers, small-business owners, AI-curious upgraders, income-motivated learners, parents worried about kids' futures, senior managers wanting team capability). The voice is direct, plain English, British, calm-authoritative — never cheesy, never gamified, never patronising. The hero copy is "Stop watching AI change the world. Start building with it." — active, kinetic, agency-focused. Visual references are productivity tools (Linear, Vercel, Stripe, Notion, Supabase), NOT e-learning. The logo will sit next to a student's name on LinkedIn as a verifiable credential mark, so it must be recognisable at 32–48px and trustworthy at any size. Generate logo concepts in TWO directions for comparison: (A) active / kinetic / sharp / Linear-flavoured, and (B) aspirational / softer / more illustrative — at least 4 concepts in each, including wordmark-only AND icon-forward sub-variants. Palette starting point is aqua (#33BBFF) + mint (#1CBA93) on warm charcoal (#191817) — feel free to amend.**

---

## 8. Pre-flight before opening Stitch / OpenAI tool

- [ ] Save this brief to clipboard for pasting
- [ ] Have the existing hero copy at hand: *"Stop watching AI change the world. Start building with it."*
- [ ] Have the journey list at hand (the 7 audience segments in §2)
- [ ] Have the palette hex values: aqua `#33BBFF`, mint `#1CBA93`, charcoal `#191817`
- [ ] Have the references list mentally / in tabs: Linear, Vercel, Stripe, Notion, Supabase
- [ ] Save outputs into `kanban/design-artefacts/2026-04-24/concepts/wordmark/` and `concepts/icon/` as you go (not end-of-session bulk save — you'll lose track of which concept belongs to which prompt)

---

## 9. Decision log so far (relevant to Phase 0 only)

| Date | Decision | Source |
|---|---|---|
| 2026-04-25 | Skip brand tagline; use functional positioning copy | David Q-A |
| 2026-04-25 | Hero copy stays as-is — "Stop watching... Start building" | David Q-D |
| 2026-04-25 | GWTH = "Growth With Tech and Humans" — explainer on About page only | David Q-C |
| 2026-04-25 | Add 3 missing journey sections (5, 6, 7) in Phase 1b | David Q-E |
| 2026-04-25 | Logo direction: try both active/kinetic AND aspirational/floaty — pick after seeing concepts | David Q-F |
| 2026-04-25 | Skip leaderboards / public XP / streak shaming entirely | David (dashboard synthesis discussion) |
| 2026-04-25 | Keep Dynamic Score (per-student verified credential — NOT a leaderboard) | David |
| 2026-04-25 | Productivity-tool visual references (Linear / Notion / Vercel / Stripe / Supabase) | David |
| 2026-04-27 | Phase 1a homepage: Variant 1 (G-arrow logo + Direction B layout) chosen over Variant 2 (windmill) | David — see `concepts/homepage/DECISION.md` |
| 2026-04-27 | dirB layout adopted as the homepage source of truth for Phase 1b implementation | David |
