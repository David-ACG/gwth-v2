# Claude Design Brief — GWTH.ai Lesson Viewer (2026-05-08)

**Logo PNGs are locked — do NOT propose, attempt, or render any SVG version of the logo. If you generate one, the entire response will be rejected.**

**Design tokens are locked.** The Stone & Sage palette, Public Sans / Vollkorn / JetBrains Mono typography, terracotta `#a94c2e` primary, and warm forest dark mode are inherited from the homepage template this chat was seeded from. Do NOT redefine, propose alternatives to, or "polish" the tokens. Use them.

You are Claude Design working on the GWTH.ai 23 May 2026 UK beta launch. Design the **logged-in student lesson viewer** — the surface where a paying learner actually consumes a lesson. After the dashboard, this is the second-most-time-spent surface in the product. It must feel calm, focused, and finishable, not like a textbook.

## 1. The two design ideas this lesson viewer is built around

### Idea A — Multi-page reading, not one infinite scroll

Each lesson is broken into a series of short pages (think 200–500 words per page, plus optional figure or code block). A learner sees one page at a time. Reaching the end of the page reveals the **Continue** affordance and increments lesson progress. This makes a 4,000-word lesson feel like 8–12 finishable pages instead of a wall of text.

- Show clear lesson location: `Lesson 13 · Page 3 of 8` style indicator.
- Show lesson progress and course-month progress in the chrome (two thin bars or one segmented bar — your judgement).
- Page transitions should feel intentional. No carousel feel; no "swipe" novelty. Use a subtle fade or slide of body content while chrome stays still.

### Idea B — Audiobook mode (auto-advance)

Every lesson page has a narrated audio track. When a learner taps Play, the audio reads the current page; when audio for that page ends, the viewer **automatically advances to the next page and continues reading**, audiobook-style. The learner can listen end-to-end without ever touching the screen.

- Persistent audio bar pinned to the bottom (or top — your call). Visible across all page transitions.
- Audio bar must include: play/pause, scrub, current-page time + total-page time, speed (1x / 1.25x / 1.5x), and a clearly visible **Auto-advance: ON / OFF** toggle.
- When auto-advance is ON and a page ends mid-listen, show a brief "Advancing in 2s — tap to stay" affordance so a learner pausing to think can interrupt without panic.
- When auto-advance is OFF, audio simply stops at end of page; learner taps Continue manually.
- Audio bar must remain visible while the learner is interacting with body content (it's the most important persistent control on the surface).

These two ideas together are the point of the design. Everything else serves them.

## 2. Reference assets in this bundle

The chat has already been seeded from the homepage template, so palette, typography, mono section labels, sharp buttons, italic serif accents, and `data-variant="e2-e"` token mapping all carry forward without you re-deriving them. If you need a visual refresher, reference the homepage template tokens — don't re-invent.

## 3. Hard prohibitions (any one of these = response rejected)

- No SVG logo work. The wordmark, if shown, is a PNG.
- No decorative eyebrow pills above headlines. Functional pills (status, tier, page-counter) are fine.
- No gradient text.
- No side-stripe accents.
- No fake stats, fake learner counts, fake testimonials.
- No "trusted by" row.
- No modal-first interactions. The audio player is **not** a modal — it's a persistent inline bar.
- No nested cards (a card inside a card inside a card).
- No UI copy explaining how to use the viewer. The interface should explain itself.
- No em dashes (—) in visible UI copy. Use commas or a colon.
- No "Tech Radar" anywhere.
- Do not reinvent the GWTH Score card or surface a score number on the lesson viewer. Score lives on the dashboard.
- Do not introduce aqua / mint / Inter — those were the pre-2026-04-29 register and are dead.
- Do not turn the page navigation into a flashy carousel, parallax, or scroll-jacking effect. Calm. Editorial. Bookish.

## 4. Product context (launch truth, only the parts the lesson viewer needs)

- A lesson is the unit of progress. **Lesson completion = intro video watched to 80% AND Q&A passed.** Both gates must be expressible in this design.
- Lessons live inside a **course month** (Month 1 = 24 mandatory lessons). The viewer should show the lesson's place in the month.
- Learners on Month 1 are paying £29 / month. They are adults moving from "I use ChatGPT like Google" to real applied AI capability. Tone: serious, calm, respectful of their time. No gamified stickers.
- Lessons can include: prose pages, short embedded video, code blocks, diagrams/images, callouts, and a final Q&A.
- Public labs are **unscored** and live elsewhere. A lesson viewer must not imply lab-style "try it yourself" gamification mid-lesson.

## 5. Required content + states to deliver

### Surface 1 — Reading a prose page (default state)

- Lesson chrome (top): course-month label in mono uppercase, lesson title, `Page 3 of 8` indicator, two progress bars (lesson + course-month) or one segmented equivalent.
- Body: one page of prose. Include at least one inline image / figure with mono caption, and at least one body paragraph using italic Vollkorn for emphasis (sparingly — match home-page restraint).
- Page footer: previous-page ghost button on the left, **Continue** primary button on the right (sharp, terracotta, uppercase, `border-2 rounded-none` to match homepage button language).
- Persistent audio bar pinned at the bottom (default state: **paused, page audio loaded**).
- Optional left rail: collapsible lesson outline (page list with ticks for read pages, current page highlighted). On mobile this becomes a sheet.

### Surface 2 — Audio playing with auto-advance ON

- Same layout as Surface 1, but audio bar shows: pause icon, animated waveform or progress, current-time / total-time, **AUTO-ADVANCE ON** indicator clearly visible.
- Show the brief "Advancing in 2s — tap to stay" overlay treatment near the Continue button when a page is about to end.

### Surface 3 — Intro video page

- Same chrome as prose pages but body is replaced by a 16:9 video frame.
- A clear **80% watched** progress affordance under the video — the gate to completion. When threshold is met, show a quiet inline confirmation ("Counts toward completion"). Do not pop a modal.
- Audio bar can either be hidden during video playback or muted with a hint that audio resumes on the next prose page — your call, pick the cleaner one.

### Surface 4 — End-of-lesson Q&A page

- Body becomes a small set of multiple-choice questions (3–5). Sharp bordered options, single-select.
- Submit button reuses primary button language. On submit, show pass/fail inline. Pass: "Lesson complete" confirmation that surfaces the next-lesson CTA. Fail: per-question feedback and a Retry button. No modals.
- Pass state should make it obvious that the lesson now counts toward Month 1 progress.

### Surface 5 — Mobile 412px (one prose page + audio bar)

- Audio bar remains pinned bottom (still persistent, still includes auto-advance toggle).
- Lesson outline becomes a Sheet triggered by a left-rail icon in the top chrome.
- Page footer collapses to a single full-width Continue button. Previous-page button moves into a small ghost icon top-left.

### Optional if quota allows

- Dark mode for Surface 1 (reading prose page, audio paused).
- A "Lesson complete" celebration state that is calm and editorial, not confetti — italic serif "Lesson complete." line plus the next lesson card.

## 6. Information architecture rules

- Body column max width ~720px (readability). Don't let prose go full-bleed.
- Use mono uppercase section labels (`MONTH 1 · LESSON 13`, `PAGE 3 OF 8`) sparingly for orientation.
- Italic Vollkorn body emphasis is allowed and encouraged inside prose pages — this is one of the few surfaces in the product where editorial typography is appropriate.
- Sharp bordered buttons (`border-2 rounded-none`, uppercase, `font-bold tracking-wider`) for primary actions. Ghost buttons for secondary.
- Do not nest panels. The body column sits on the page background; the audio bar is a single bordered surface; the optional left rail is a single bordered surface. That's it.

## 7. Current implementation to respect

This will be ported into a Next.js app. The existing implementation has:

- Route: `src/app/(dashboard)/lessons/[slug]/page.tsx` (or sibling — confirm in repo).
- Lesson data already includes title, sections (prose / video / Q&A), narration audio URL per section, and completion gates (`videoWatchedPct`, `qaPassed`).
- A sidebar + header already exists at the dashboard layout level. The lesson viewer should sit inside that shell, not reinvent navigation.

Improve the lesson viewer content surface inside the existing app shell. Do not propose a separate top navigation.

## 8. Deliverables

Return:

- **Desktop reading page at 1440px wide** (Surface 1 — audio paused).
- **Desktop reading page at 1440px wide** (Surface 2 — audio playing, auto-advance ON, with the 2-second advance overlay shown).
- **Desktop intro-video page at 1440px wide** (Surface 3).
- **Desktop Q&A page at 1440px wide** (Surface 4 — show one with unanswered questions and one with a passed result).
- **Mobile reading page at 412px wide** (Surface 5).
- **Concise implementation handoff**: component list (audio bar, page chrome, outline rail, Q&A primitives), state machine notes for auto-advance, and exact button copy.
- **Short list of anything the codebase needs** before this design can be fully wired (e.g. per-page audio segmentation, narration manifest format).

## 9. Quality bar

- A learner mid-bus-ride must be able to tap Play, pocket the phone, and listen to the rest of the lesson without touching the screen.
- A learner sitting at a desk must be able to read the lesson silently, with audio off, and never feel that the audio bar is in their way.
- A 4,000-word lesson must feel finishable, not intimidating, on first sight.
- The viewer must feel like a calmer, more focused cousin of the home page: same palette, same typography, same editorial restraint, but task-first rather than argumentative.
- David should be able to port it into the existing Next.js lesson viewer without reverse-engineering hidden intent.
