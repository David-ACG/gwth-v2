# Product

## Register

brand

## Users

UK-focused adult learners — spread across the AI-fluency spectrum. The course is built around UK context, examples, currency, and workplace reality, but it should not explicitly block non-UK learners. Other countries can be described as launching soon.

The primary starting audience is people who mostly use ChatGPT like Google: asking questions, getting answers, and not yet doing much serious research, building, coding, or workflow creation. Other audiences include defensive ("worried AI will take my job"), transitional (made redundant, reskilling), entrepreneurial (small-business owners), advisory (parents thinking about a teenager's future), upgrading (already using ChatGPT but suspecting they're scratching the surface), career (looking for a salary lift backed by proof), and light team-scope (managers whose competitors are moving faster).

Visiting the homepage on a phone in a coffee break or on a laptop in the evening. Skimming. Looking for a reason to trust this thing isn't another certificate mill. Reading first, signing up later — the public site has to do the convincing before any auth wall.

The job: decide whether GWTH.ai is the course that will move them from "uses ChatGPT like Google" to "ships with AI", and whether the credential it produces is one a UK employer will actually recognise.

## Product Purpose

A 3-month, async-first applied AI course delivered alongside a **dynamic, verifiable credential** (the GWTH Score) that updates as the learner completes lessons, passes Q&A, ships capstones, and stays current. Five hours a week, three monthly modules, a current working structure of 64 mandatory lessons plus 30 optional go-deeper lessons, and capstones that prove applied skill. It starts at beginner level, then deliberately moves learners toward advanced applied AI capability.

Month 1 covers foundations, the six primitives, and AI-assisted coding/building as the main spine. Completing Month 1 should put a learner around the top 30% for applied AI skill. Month 2 goes deeper into building, coding, workflows, apps, small-business use cases, and AI consulting, targeting roughly top 10% with mandatory lessons and top 5% with most optional lessons. Month 3 focuses on enterprise AI transformation and larger-company consulting, targeting roughly top 2% with mandatory lessons and top 1% with most optional lessons.

Starter pricing is £29/mo per course month, with monthly unlocks and no prominent £87 total. Learners can stop after Month 1, Month 2, or Month 3. After course access ends, optional £7.50/mo Stay Current access lets them retake significantly updated lessons and prevent score decay.

Success looks like: a practitioner walks away with a portfolio of real artefacts and a credential employers can verify on the spot — no PDFs, no faked completion dates, no hand-wavy "certificate of completion".

## Brand Personality

Three words: **practitioner**, **honest**, **UK-grounded**.

Voice: written by people who actually ship AI work, not by marketers writing about it. Specific numbers over slogans. Sentences that earn their weight. Self-aware about the category's worst clichés (one-shot certificates, fake "1,240 learners" badges, AI-generated stock illustrations) and refuses to deploy them.

Emotional goal: confidence, not hype. The visitor should leave feeling "this is the serious one" — closer to a Royal Society policy paper than to a Khan Academy or a generic SaaS landing page. Calm, declarative, dense with proof.

## Anti-references

This is NOT what GWTH.ai should look or feel like:

- **AI-slop landing pages.** Eyebrow pills above every headline ("● The future of AI"), gradient text everywhere, identical-card-grids of "features" with lucide icons, "trusted by" rows of fabricated company logos, hero metrics that aren't real ("1,240 learners", "94% finish"). Set 2026-04-28: zero decorative pills above headlines, ever.
- **Certificate mills.** Bootcamps that promise the world, ship a PDF, and never speak to the learner again. The site should explicitly read against this — credentials that decay if you stop, public verify URLs, no "Class of 2026" cohort theatre.
- **Generic SaaS landing pages.** The hero-metric template (big number + small label + supporting stat + gradient accent), the "Empowering teams to..." headline pattern, the screenshot-with-arrows tour. GWTH is selling a credential, not seats in a Notion clone.
- **Government-programme tone.** Earnest, slow, hedged, full of stakeholder-driven copy. We're independent of any vendor or government programme — say so directly.
- **Vendor lock-in framing.** No "powered by [Big AI co]" badges. The course teaches Claude, ChatGPT, n8n — tools learners already pay for, used the way professionals actually use them.

## Design Principles

1. **Show the work, don't claim it.** If a stat appears (21% / 1 in 6 / 45%), it cites DSIT, ONS, or another named UK source. If we say the credential is verifiable, the homepage demonstrates the verify URL pattern. If we say learners can move toward the top 1% for applied AI skill, the product needs a visible GWTH benchmark rubric and external research map. Every claim has an artefact next to it.

2. **Plain English ≥ jargon.** Headings are short, declarative, parallel ("Different reasons. Same course." / "94 projects. One score. Plain English."). No "empowering" / "leverage" / "synergy". No em dashes (the AI tell). Sentences a UK adult could read aloud at a kitchen table without flinching.

3. **Proof over promise.** The hero device shows a real-shaped GWTH Score (with the "Illustrative" caveat right below). Pricing tiers are exact (£0 labs / £29/mo starter course access / £7.50/mo Stay Current) without pushing a total course price. The credential says when it decays and why — honesty as a moat against certificate mills.

4. **UK-grounded.** "Built around UK research" not "trusted by"; UK statistics from named UK bodies; UK currency, UK spelling ("analyse" not "analyze"), UK examples (the Andrej Karpathy reference is fine; mentioning DSIT is better). The product can say anyone can join, but it should be clear that the course is UK-focused and priced in GBP, with other countries launching soon.

5. **Quiet confidence over performance.** Subtle Motion (entrance fades, scroll reveals, hover lifts), one accent colour at a time, single solid colours over gradients, real photography or hand-illustrated marks over stock or AI-generated imagery. The page should feel like a book jacket, not a billboard.

6. **Anti-AI-slop on every commit.** Match-and-refuse the absolute bans: side-stripe borders, gradient text, glassmorphism-by-default, hero-metric template, identical card grids, modal-as-first-thought, decorative section-setup pills. If a designer (human or LLM) is about to ship one, rewrite the element.

## Accessibility & Inclusion

- WCAG 2.1 AA across light + dark themes — 4.5:1 for body text, 3:1 for large text. OKLCH tokens in `src/app/globals.css` are the reference.
- All Motion respects `prefers-reduced-motion` (existing `useReducedMotion` hook + global guard in `src/app/globals.css`).
- Status colours never carry meaning alone — every status has an icon + text label too.
- Keyboard navigation: every interactive element focusable, visible focus rings, logical tab order. Cards use a single anchor wrap (no nested links) so tab order stays linear.
- Mobile-first responsive — 412px is the smallest target; lesson sidebar collapses to a Sheet.
- Reading level: aim for the bottom of the UK secondary spectrum on marketing copy. The course content can be technical; the homepage should not be.
