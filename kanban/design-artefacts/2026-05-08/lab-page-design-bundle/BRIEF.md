# Claude Design Brief — GWTH.ai Single Lab Page (2026-05-08)

**Logo PNGs are locked — do NOT propose, attempt, or render any SVG version of the logo. If you generate one, the entire response will be rejected.**

**Design tokens are locked.** The Stone & Sage palette, Public Sans / Vollkorn / JetBrains Mono typography, terracotta `#a94c2e` primary, and warm forest dark mode are inherited from the homepage template this chat was seeded from. Do NOT redefine, propose alternatives to, or "polish" the tokens. Use them.

You are Claude Design working on the GWTH.ai 23 May 2026 UK beta launch. Design the **single Lab page** at route `/labs/[slug]`, the surface a visitor lands on after picking a specific lab from the labs index. Labs are short, hands-on, **public, unscored** AI exercises (prompt comparisons, tool walkthroughs, small build challenges). They are a free lead-magnet and bonus learning, not a course gate. After the dashboard and lesson viewer, this is the third in-product surface that needs design exploration before launch.

## 1. The two design ideas this lab page is built around

### Idea A — Instructions and workspace, side by side, no context switch

A lab is "read a bit, do a bit, see the result". Splitting that across separate pages or a modal kills the loop. Default desktop layout: a narrow **instructions column on the left** (what to do, why it matters, hint reveal), a **workspace column on the right** (the actual interactive surface — prompt input, model output, comparison, or whatever the lab type calls for). The learner reads, acts, sees the result, all without scrolling between contexts.

- Instructions column max ~360–420px wide. Workspace column takes the rest of the body up to a comfortable max.
- Instructions are paginated like the lesson viewer (Step 1 of 4, Step 2 of 4, ...) so each step feels finishable. Use the same multi-page pattern: short prose per step, Continue affordance to advance to the next step. Do NOT show all steps as one long scroll.
- Hints are progressive-disclosure inside each step: a quiet "Show hint" link that expands inline, never a modal.
- The workspace is persistent across step transitions — it does not reset when the learner advances steps.

### Idea B — Honest unscored framing + soft course conversion

This page must be honest with the visitor: labs are useful, but they don't earn a GWTH Score and they don't substitute for the course. The credential comes from the paid course. The page should say so once, calmly, near the lab title, and then again at the completion state. No pop-ups. No guilt. No fake urgency.

- Top of the page near the lab title: a small functional pill `UNSCORED`, plus a single sentence in muted-foreground explaining: "Free, hands-on, does not affect your GWTH Score."
- Completion state: a quiet inline panel that says "Lab complete." in italic Vollkorn, then a calmly-bordered conversion card: "Want the credential? Start the course. £29 / month, one month at a time." with a sharp terracotta primary button.
- Do NOT decorate the conversion card with stars, ribbons, "Most popular" pills, or testimonials. It is a single bordered panel, single sentence, single CTA.

These two ideas together are the point of the design. Everything else serves them.

## 2. Hard prohibitions (any one of these = response rejected)

- No SVG logo work. The wordmark, if shown, is a PNG.
- No decorative eyebrow pills above headlines. Functional pills (UNSCORED, step counter, status) are fine.
- No gradient text.
- No side-stripe accents.
- No fake stats, fake learner counts, fake testimonials, fake company logos.
- No "trusted by" row.
- No modal-first interactions. Hints, examples, and "show solution" expand inline.
- No nested cards (a card inside a card inside a card).
- No UI copy explaining how to use the page. The interface should explain itself.
- No em dashes in visible UI copy. Use commas or a colon.
- No "Tech Radar" anywhere.
- Do NOT imply the lab affects the GWTH Score. Labs are unscored. Period.
- Do NOT reuse the GWTH Score share-ticker card on this page. Score lives on the dashboard.
- Do NOT introduce aqua / mint / Inter — those were the pre-2026-04-29 register and are dead.
- No gamified XP bars, badges, confetti, or streak fire icons. Calm. Editorial. Adult.
- No urgency timers ("only 24h left to redeem"). Labs are evergreen.
- No live-learner-counter ("327 people doing this lab right now"). Fake.

## 3. Product context (only the parts the lab page needs)

- Labs are **public** (unauthenticated visitors can land directly on `/labs/[slug]`).
- Labs are **unscored** — completing them does not move the GWTH Score, does not unlock course content, does not count toward Month 1 progress.
- Labs are short: target 10–20 minutes including reading and acting. Most are 3–5 steps.
- Labs cover three rough shapes; the design must flex for all three:
  1. **Prompt comparison.** Visitor writes a prompt, sees model output; sample "good" prompts reveal on demand; visitor compares.
  2. **Tool walkthrough.** Step-by-step exercise inside an external tool (Perplexity, Claude Projects, NotebookLM). Workspace shows screenshots, expected results, and a self-check input.
  3. **Small build challenge.** Visitor produces a short artefact (one paragraph, one outline, one screenshot). Workspace has a textarea or file-drop and a model-or-rubric self-grade.
- Conversion target: visitors finish the lab feeling like they got real value, then see the paid-course CTA at the right moment (completion state, not before).
- A subset of labs require sign-in to save progress — the design must handle a "Sign in to save your progress" inline cue (not a blocker, not a modal) for that variant.

## 4. Surfaces to deliver

### Surface 1 — Lab landing (Step 1 of N, no work yet)

- Top: lesson-style chrome but adapted for labs. Mono uppercase `LAB · PROMPT COMPARISON` (or whichever shape this lab is), lab title in big sans display, a single italic Vollkorn subtitle (1 line), the **UNSCORED** functional pill, the unscored-explanation sentence in muted-foreground.
- Below chrome: two-column body. Left column = instructions for Step 1, "Show hint" link, Continue button. Right column = workspace primed for the lab shape (e.g. for prompt comparison: a prompt input, an empty output panel, a "Run" button).
- Persistent step indicator inside the instructions column: `STEP 1 OF 4`.
- A thin lab-progress bar in the chrome.

### Surface 2 — Lab in progress (Step 2 of N, workspace populated)

- Same layout. Instructions column now showing Step 2; left rail or breadcrumb shows Step 1 ticked.
- Workspace shows real interaction state: visitor's prompt + model output side-by-side, or screenshot-walk-through current frame, or build-challenge textarea with content and a "Self-check" reveal.
- Hints expanded inline (show this so the hint pattern is clear).

### Surface 3 — Lab completed

- Instructions column shows a calm "Lab complete." italic Vollkorn line and a 2-line summary of what the visitor practised.
- Workspace column either: (a) collapses into a final-output snapshot, or (b) shows the final compared-prompt panel locked in. Your judgement.
- Below the body: the **conversion card** described in Idea B. Single bordered panel, single sentence, single sharp terracotta CTA "Start the course". A second muted ghost link: "Browse more labs".
- A second small panel: "Save this lab to your account" with a sign-in cue, only relevant for visitors who finished the lab anonymously.

### Surface 4 — Mobile 412px

- Instructions stack above workspace.
- Step indicator becomes a horizontal segmented bar at the top.
- Hints still inline, no modal.
- Conversion card at the end is full-width.

### Optional if quota allows

- Dark mode for Surface 1.
- The "tool walkthrough" workspace variant (Surface 2 alternative): screenshot frame with annotation pins, "Next screenshot" affordance.
- The "build challenge" workspace variant: textarea + self-grade rubric reveal.

## 5. Information architecture rules

- Instructions column always uses the same readability discipline as the lesson viewer: max ~420px wide, italic Vollkorn for emphasis allowed sparingly, mono uppercase only for step labels.
- Workspace column is allowed to be denser and more tool-like. JetBrains Mono is welcome inside prompt inputs, outputs, and code displays.
- Sharp bordered buttons (`border-2 rounded-none`, uppercase, `font-bold tracking-wider`) for primary actions. Ghost for secondary. The "Run" / "Submit" workspace button uses the same primary language as Continue.
- Do not nest panels. Instructions column is one bordered surface or no border (your call). Workspace is one bordered surface. Conversion card at end is one bordered surface. That is the lot.

## 6. Current implementation to respect

This will be ported into a Next.js app. The existing implementation has:

- Route: `src/app/(public)/labs/[slug]/page.tsx` (or sibling, confirm in repo).
- Lab data already includes title, shape (`prompt-comparison` / `tool-walkthrough` / `build-challenge`), steps array, hints, expected outputs, and conversion-card copy.
- Public layout (`src/app/(public)/layout.tsx`) provides PublicNav and Footer. The lab page sits inside that shell, **do not** propose a separate top navigation or in-page editorial nav.

## 7. Deliverables

- Desktop **Surface 1** at 1440px (lab landing, Step 1, workspace empty).
- Desktop **Surface 2** at 1440px (lab in progress, Step 2, workspace populated, one hint expanded).
- Desktop **Surface 3** at 1440px (lab complete, conversion card visible).
- Mobile **Surface 4** at 412px (Step 2, workspace populated).
- Concise implementation handoff: component list (lab chrome, instructions column, workspace primitives for the three lab shapes, hint disclosure, conversion card, sign-in cue), state-machine notes for step progression, exact button copy.
- Short list of anything the codebase needs before this can be fully wired (e.g. lab manifest format, screenshot annotation primitive, prompt-output comparison primitive, anonymous-progress storage).

## 8. Quality bar

- A first-time visitor must understand within 5 seconds: this is free, this is hands-on, this won't earn a credential, the course is the thing that does.
- A visitor mid-lab must never have to scroll between "what to do" and "the place to do it".
- A visitor who finishes the lab should feel they got real value AND naturally see the course CTA, without feeling sold to.
- The page must feel like a calmer, denser cousin of the home page: same palette, same typography, same sharp-bordered editorial spirit, but task-first, with a small workspace tool inside it.
- David should be able to port it into the existing Next.js public lab route without reverse-engineering hidden intent.
