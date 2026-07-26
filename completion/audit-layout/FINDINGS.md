# Demo-path layout audit — findings

Captured 2026-07-26. Marketing pages from live https://gwth.ai; logged-in pages
from a local server at HEAD (production needs the demo password, which is not
stored on this box). Both widths: 1440 desktop, 390 mobile.

Scope: all 15 demo-path steps, deep on home, dashboard and the L1 lesson.

## Two capture caveats worth recording

1. **Lazy images.** A `fullPage` Playwright screenshot does not bring Next/Image
   below-fold images into view, so the first capture round showed three large
   empty panels on the home page. They are NOT broken: after a scroll pass they
   all load. The capture scripts now scroll before shooting. Anyone re-shooting
   these pages must keep that scroll pass or they will re-report a phantom bug.
2. **`/labs` is gated on purpose.** Anonymous visitors get a 307 to `/login` for
   `/labs` and `/labs/[slug]`. That is `PRIVATE_CONTENT_MODE` (documented in
   `.env.local.example`), not a defect. It does mean the demo walkthrough's claim
   that CIPD "can revisit later" is only true for home, lessons, pricing and
   for-teams. Labs pages here were captured logged in.

## The structural finding, in one line

The home page hero is a two-column composition and it is the best surface on the
site. Every inner page hero is single-column-left and leaves the right half of a
1440 screen empty. In the logged-in product the opposite problem applies: the
lesson viewer spends about 40% of the window on two stacked navigation columns
and gives the lesson text about 39%.

## Findings

| # | Where | Diagnosis | Sev | Type |
|---|---|---|---|---|
| R1 | lessons, labs, lab detail, pricing, for-teams | Hero is single-column left; the right half of the viewport is empty colour. Home solves this with a two-column hero (headline left, standfirst + meta + CTA right) and reads far stronger. Five of seven marketing pages do not use it. | P1 | DIR |
| R2 | Lesson viewer | Global nav (280px) + outline rail (248px) = 528px of chrome before content starts, on a page whose whole job is reading. The measure itself is correct (measured 62ch, exactly the bible target), but the column is pushed right: it starts at x=705 in a 1440 window, so its centre sits ~264px right of the window centre. Collapsing the global nav (an existing control) moves it to x=597 at no cost. | P1 | DIR |
| R3 | Dashboard | Hierarchy is inverted: the largest type on the page ("Welcome, Local. Your first lesson is ready.") carries no information, while the only action ("START LESSON 1") sits in a smaller right-hand panel. | P1 | DIR |
| R4 | Home, nine journeys | Nine equal-weight cards with nothing to look at first. Only four of nine carry a stat, and because rows stretch to the tallest card, cards 01, 07 and 08 end in 150-250px of dead cream. Reads unfinished. | P1 | OBJ |
| R5 | Home, journeys | Teal `#2c4a47` and moss `#2a4530` card tops read as one green side by side, so the colour coding carries no meaning. Worse over a Teams share. (Confirms the W23 finding; still live.) | P2 | DIR |
| R6 | Dashboard, progress, lesson (both widths) | Fixed edge tabs (REPORT A PROBLEM, FEEDBACK, NOTES) sit on top of content: they clip "SECTION 01 · YOUR COURSE" on the dashboard, the right-aligned stat meta on progress, and the prose column itself at 390. | P2 | OBJ |
| R7 | Home, three monthly issues | The section image is pushed right with a ~630x480 empty gutter to its left, and its bottom edge abuts the three issue cards with no separation. | P2 | OBJ |
| R8 | Global left sidebar | Four nav items top, four bottom, roughly 450px of empty rail between them. 19% of the window width doing almost nothing on every logged-in page. | P2 | DIR |
| R9 | Whole demo path | Body and mono sizes are set for a normal viewing distance, not for two readers aged 50-60 wearing reading glasses watching a compressed Teams share. This is the one place where overriding the FDE scale is worth putting to David. | P2 | DIR |
| R10 | Lesson viewer | Two progress bars sit side by side (LESSON 01 PROGRESS, MONTH 1 PROGRESS), both rendered as rows of small dashes that read as noise rather than progress at share resolution. | P3 | DIR |
| R11 | Lab detail | The Claude and ChatGPT columns are visually unequal (one-line blurb vs three-line), so the "same prompt, fair test" promise is undercut by the layout. | P3 | OBJ |

## Already tracked elsewhere, not re-reported as new

- Em dashes in the syllabus course title and description (bead `gwth-launch-dx6`).
- Empty-account zeros across dashboard and progress (W23 DIR item, David's call).
