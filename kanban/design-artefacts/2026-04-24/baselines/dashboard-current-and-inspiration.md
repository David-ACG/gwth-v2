# Student Dashboard — Current State + Best-in-Class Inspiration

**Date:** 2026-04-24
**Purpose:** Feeder doc for Phase 2a (`beads_GWTH-eay`) — the Claude Design exploration of the redesigned student dashboard. Combines (a) what GWTH's dashboard does today, read from code, and (b) inspiration from a wide survey of learning + productivity dashboards. The Phase 2 redesign should NOT clone the current dashboard — David has explicitly opted in to "lots of improvements." Use this doc to pick which elements survive, which are replaced, and which net-new patterns to adopt.

> **Source attribution:** §0 below is read from `src/app/(dashboard)/dashboard/page.tsx`. §1–§6 come from a wide-survey research pass (URLs cited inline; deduplicated at §6). Where the agent couldn't find a canonical source, that's flagged honestly in-line.

---

## 0. The current GWTH dashboard — what's there today

Read from `src/app/(dashboard)/dashboard/page.tsx` (327 lines), `src/app/(dashboard)/layout.tsx`, and the components under `src/components/progress/`.

### 0.1 Layout shell (from `(dashboard)/layout.tsx`)

- **Sidebar** (`src/components/layout/sidebar.tsx`) — collapsible, 280px expanded / 64px collapsed
- **Header** (`src/components/layout/header.tsx`) — `DashboardHeader` with breadcrumbs + user name/email/avatar
- **Main** — overflow-auto, `p-4 md:p-6 lg:p-8`, max-width 1400px
- **SearchPalette** — Cmd+K (`src/components/search/search-palette.tsx`)

This wrapper is sound and matches Linear/Vercel convention. Phase 2 should leave it alone unless the dashboard hero design forces a layout-wrapper change.

### 0.2 The page itself — three subscription-state branches

The page conditionally renders based on `user.subscriptionState`:

| State | What renders |
|---|---|
| **`visitor`** / `registered` (free) | "The Course" teaser card (locked icon, subscribe CTA at `£{COURSE_MONTHLY_PRICE}/month`, "Try a Free Lab" secondary) + **Quick Links grid** (Free Labs + Tech Radar) |
| **subscriber** (`hasCourseAccess`) | "Your Course" card with `ProgressRing` (100px), course title link, completed/total lessons, overall `Progress` bar, Continue/Start CTA, **3-month grid** mapping `MONTH_CONFIGS` to per-month progress |
| **`lapsed`** | Red destructive banner + "Update Payment" CTA (above the state-specific section) |

### 0.3 Shared widgets (rendered for everyone)

Below the state-specific section:

1. **`StudyStreakCalendar`** (`src/components/progress/study-streak-calendar.tsx`) — GitHub-style heatmap, takes a `streak` prop from `getStreak()`
2. **Notifications card** — last 4 from `getNotifications()`, unread badge, blue dot indicator on unread items, empty state "No notifications yet."
3. **Bookmarks card** (conditional, only if `bookmarks.length > 0`) — count + "View all bookmarks" link

### 0.4 Data sources

```ts
const [user, courses, courseProgress, streak, bookmarks, notifications] =
  await Promise.all([...])
```

All from `src/lib/data/*` mock layer. Real backend will be wired separately. Keep the data-layer abstraction during the redesign — Phase 2 only changes the UI.

### 0.5 What the current dashboard does well

- **Single-course model** is honoured (`course = courses[0]`) — the page doesn't pretend to be a multi-course catalogue.
- **3-month structure visible at a glance** via the `MONTH_CONFIGS` grid — students see where they are in the journey.
- **Subscription state branching** keeps the page useful for visitors AND subscribers without a separate paywalled `/dashboard` route.
- **Existing primitives are good** — `ProgressRing`, `StatusBadge`, shadcn `Card`/`Progress`/`Badge`, Lucide icons, `formatProgress` / `formatRelativeDate` utilities.

### 0.5b Existing Dynamic Score (pre-built but absent from dashboard today)

Already exists in code, surfaced only on `/progress`:

```ts
// src/lib/types.ts
interface DynamicScore {
  overallScore       // 1.5 pts per lesson, decays if content not reviewed
  maxPossibleScore   // ceiling based on completed lessons
  percentile         // 0–100, peer-rank percentile
  curiosityIndex     // 0–1, ratio of optional/advanced lessons explored
  consistencyScore   // 0–100, regularity of study sessions
  improvementRate    // -100 to 100, quiz-score trend
  scoreHistory       // {date, score}[] for chart
}
```

Marketing copy on `/` and `/pricing` already commits to:
- *"Dynamic scores that employers can verify"*
- *"Scores decay if you stop"* — explicit decay mechanic
- *"Dynamic certification scores employers can verify"*

**Critical for redesign:** Dynamic Score is **core to GWTH's value proposition** — it's the credential students share on LinkedIn that signals to employers they're current. It is NOT a leaderboard or XP gimmick; it is a measured-capability score with verification. Distinguish carefully from §4b (which bans peer-ranking leaderboards). See §3f1 (new) below.

### 0.6 What's notably absent / weak today

(Candidates for the Phase 2 improvement list — David picks from §5.)

| Gap | Why it matters |
|---|---|
| No **"continue exactly where you left off"** specific lesson card | The single most valuable widget on a single-course dashboard. Currently the CTA is "Continue Learning" without showing *which* lesson. |
| No **upcoming / what unlocks next** widget | Content is monthly-drop-paced — students need to know "Module 2 unlocks 30 April." |
| No **labs progress** at all on the dashboard | Free users get a Labs CTA; subscribers get nothing. Labs are part of the course. |
| **Bookmarks block is thin** — just a count + link | Risks the "bookmarks blackhole" (saved and never returned to). |
| **Notifications block is functional but generic** — no clear hierarchy of types (achievement vs reminder vs announcement) |
| **Mobile density** is fine but undifferentiated — no specific mobile layout choices (everything stacks 1-col below `sm:`) |
| No **time / session stats** for self-knowledge ("you've spent 4h 20m this week") |
| No **certificate progress** indicator |
| **`StudyStreakCalendar` ships streak counters by default** — see §3e + §4a; this is the single most contentious decision in the redesign |
| No **cohort signals** — peers / community / "5 others on this lesson today" |

### 0.7 Baseline screenshot caveat

The dashboard is **auth-gated** (`/dashboard` returns 307 to `/login` for unauth'd requests). David asked me NOT to follow the old version exactly — so a literal screenshot baseline is less load-bearing than for the homepage. This doc IS the baseline.

---

## 1. TL;DR — Five Strongest Recommendations

1. **Borrow from productivity tools, not e-learning incumbents.** Linear, Notion, Vercel, Stripe, and Supabase have already solved "calm, dense, dark-mode-first dashboards for professionals" at a higher bar than Coursera, Udemy, or LinkedIn Learning. Steal their layout grammar (sidebar 240–280px, KPI strip 4–6 cards, 12-col content grid, 24px gutters, skeleton states) and apply it to learning content. Do not copy LMS dashboards directly — they're optimised for institutions, not learners. ([Art of Styleframe](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/), [LogRocket](https://blog.logrocket.com/ux-design/dashboard-ui-best-practices-examples/))

2. **Make "Continue where you left off" the hero of the dashboard.** For a single-course, self-paced product, the most valuable thing the dashboard can do in the first 5 seconds is answer "what do I do next?" Reforge, Khan Academy, Netflix, and Coursera all confirm this — Reforge in particular reframes its dashboard as **progress management, not course browsing**, which fits GWTH exactly. ([Reforge KB](https://reforge.helpscoutdocs.com/article/236-new-reforge-ui-my-learning), [Khan Academy](https://blog.khanacademy.org/introducingthe-learning-dashboard/))

3. **Skip Duolingo-style streak-shaming. Replace with a calm activity heatmap and identity-based framing.** Adult professionals describe streak loss as anxiety-inducing, the streak rewards consistency-of-tap not actual learning, and 1,107-day streak holders have famously "learned almost nothing." Use a GitHub-style heatmap as a *retrospective* signal ("look at all you've done") rather than a *prospective* threat ("don't break it"). Add streak freezes / 80%-rule framing if you must keep a counter. ([Medium / 1107-day streak](https://medium.com/@jorryn.flanagan/i-have-a-1107-day-streak-on-duolingo-heres-why-i-have-learned-almost-nothing-e888d7fe81e2), [Cohorty psychology of streaks](https://blog.cohorty.app/the-psychology-of-streaks-why-they-work-and-when-they-backfire/))

4. **Ship the dashboard for the 5-second test, not the feature list.** The hero question is "What do I do next, and where am I in the course?" Resist the urge to fill a screen with widgets. NN/g and Linear's own playbook say: fewer dashboards, fewer widgets, more intentionality. Default density: medium. Default colour palette: 2–3 hues + status accents. ([NN/g — Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/), [Linear best practices](https://linear.app/now/dashboards-best-practices))

5. **No leaderboards. No XP. Cohort presence as ambient signal only.** Adult professionals in a learning-to-use-AI-at-work context are anxious; ranking them publicly will make 90% disengage. If you want social, do it the Reforge / Maven way: a community sidebar with recent discussion, peer questions, and "5 others completed this lesson today" — relatedness, not competition. ([Yu-kai Chou on leaderboards](https://yukaichou.com/advanced-gamification/how-to-design-effective-leaderboards-boosting-motivation-and-engagement/), [Maven community](https://help.maven.com/en/articles/6289166-community-overview))

---

## 2. Best-in-Class Examples — What's Worth Copying

### 2a. Learning platforms

**Reforge — "My Learning"** ([source](https://reforge.helpscoutdocs.com/article/236-new-reforge-ui-my-learning))
- Dashboard is structured as **progress management** for busy senior professionals: Course Progress → Completed → Guides/Artifacts → Learning Plans.
- Top-of-screen module navigation with prev/next buttons; left-side module completion bar with clickable lesson list. This **lesson layout** is worth copying wholesale.
- Conspicuous absence of: streaks, XP, badges, leaderboards. They trust their audience.
- Most directly relevant reference for GWTH given the audience (mid/senior professionals learning a new domain).

**Khan Academy — Learning Dashboard** ([source](https://blog.khanacademy.org/introducingthe-learning-dashboard/))
- "Personal homepage" that surfaces *the next thing to do.*
- Recommendations + a focus list the user can curate.
- Note: Khan's K-12 leaning makes its visual style wrong for adults, but the IA principle (next-action over content-catalogue) is correct.

**Coursera — Learner Dashboard** ([source](https://www.coursera.org/))
- Strong "resume where you left off" continuation pattern (visible enrolled courses with progress bars and a primary CTA per course).
- Weak hierarchy on the course-detail page itself — too many sub-tabs.
- Lesson copy critique: their dashboard tries to serve both hobbyists and degree students, leading to feature creep. GWTH should be tighter.

**edX — Learner Home / Important Dates** ([Open edX docs](https://docs.openedx.org/projects/openedx-aspects/en/latest/reference/individual_learner_dashboard.html))
- The "Important Dates" widget on mobile is the main thing worth borrowing — a calendar-aware list of upcoming deadlines, clickable.
- For GWTH's monthly-content-release model, this becomes the "Upcoming this month" or "What unlocks next" widget.

**Maven — Cohort home** ([Maven Help](https://help.maven.com/en/articles/6289166-community-overview))
- Community feed alongside course content in one dashboard. Discussion, peer Q&A, and instructor messages live in the same place as the syllabus.
- For GWTH's monthly content drops, a lightweight "what classmates are talking about" feed is high-value relatedness without the toxicity of leaderboards.

**Brilliant.org** ([ustwo case study](https://ustwo.com/work/brilliant/))
- Clean visual identity, high polish on micro-interactions.
- Uses streaks/points but applies them to STEM puzzles; treats them as small dopamine hits rather than the core mechanic. GWTH should *not* copy the gamification.
- Worth borrowing: the "learning path" page that shows clear direction *and* freedom of choice — students see scaffolding without feeling rail-roaded.

**DataCamp / Codecademy** ([DataCamp Tracks](https://support.datacamp.com/hc/en-us/sections/360007655154-Progress-and-XP))
- DataCamp's XP system is overdone for an adult professional context (their own enterprise dashboard adds leaderboards, which David should explicitly reject).
- Codecademy's "Progress" table (% complete, modules done, avg quiz score) is a clean compact reference for the `/progress` page.

**MasterClass** — no canonical UX writeup found; skip.

**Skillshare / Udemy / LinkedIn Learning / Pluralsight / freeCodeCamp** — no canonical writeups found beyond marketing pages. Visit the products yourself for spot reference. Skip as primary inspiration: the marketplace model creates a different dashboard problem (catalogue-first) than GWTH's single-course problem.

### 2b. Productivity dashboards (the better source material)

**Linear** ([dashboard best practices](https://linear.app/now/dashboards-best-practices), [redesign post](https://linear.app/now/how-we-redesigned-the-linear-ui))
- Principles to steal verbatim:
  - "Fewer dashboards is generally better" — median Linear workspace has *two* dashboards.
  - Pair every metric with comparison context (current vs. historical).
  - Tailor density to viewing frequency: daily-checked surfaces are dense and glanceable; rarely-viewed surfaces need explanatory copy.
- Visual: 240–280px sidebar, 36px sidebar item height, near-instant interactions, skeleton-shimmer loading.

**Notion — Dashboards view** ([release note](https://www.notion.com/releases/2026-03-10), [help](https://www.notion.com/help/dashboards))
- Up to 4 widgets per row, max 12 widgets total — a useful constraint for resisting widget creep.
- Drag-to-resize, right-click to duplicate. Worth offering "pin a widget" as a Phase 2 feature for power users.

**Vercel** ([dashboard redesign](https://vercel.com/blog/dashboard-redesign), [project dashboard](https://vercel.com/docs/projects/project-dashboard))
- Collapsible sidebar; full-screen content panes.
- Project-level dashboard pattern (production deployment + recent activity + commits) maps neatly to a course-level dashboard (current lesson + recent activity + upcoming).
- They invested heavily in performance — First Meaningful Paint -1.2s. Worth treating as a non-negotiable for GWTH.

**Stripe** ([referenced in Art of Styleframe](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/))
- The KPI card pattern: 4 cards, each with one big number + sparkline + trend delta. Translates directly to a learner KPI strip: "Lessons complete | This week | Quiz avg | Time invested."
- 200-280px card width, CSS Grid `auto-fill, minmax(200px, 1fr)`.

**Supabase** ([UI library](https://supabase.com/ui))
- shadcn/ui-based dashboard shell — a near-direct visual reference for GWTH given the matching stack.
- Tooltips that show 4 timestamp formats — a small but smart accessibility detail worth borrowing.

**GitHub** — the contribution graph (heatmap calendar) is the best-known pattern for "show me my activity over time without shaming me." We'll come back to this in §3.

**Cursor** ([account dashboard](https://cursor.com/docs/account/teams/dashboard)) — usage/billing focused; not directly useful for learner dashboards. Skip.

### 2c. Pattern guides worth reading

- **Nielsen Norman Group — Dashboards: Making Charts Easier to Understand** ([source](https://www.nngroup.com/articles/dashboards-preattentive/)). Best concise statement of preattentive processing rules: length and 2D position win; pie charts, donuts, gauges, and 3D charts lose.
- **Smashing Magazine — From Good to Great in Dashboard Design** ([source](https://www.smashingmagazine.com/2021/11/dashboard-design-research-decluttering-data-viz/)). Research-driven decluttering, 5-colour palette ceiling, semantic colour use.
- **Smashing Magazine — UX Strategies for Real-Time Dashboards** ([source](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)). 200–400ms micro-animations, delta indicators, freshness timestamps, skeleton UIs.
- **NN/g — Designing Empty States** ([source](https://www.nngroup.com/articles/empty-state-interface-design/)). Three rules: communicate status, teach in context, provide a path.
- **Pencil & Paper — Dashboard UX Pattern Analysis** ([source](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)). Seven patterns: navigation, orientation, filtering, drill-in, actions, tooltips, toggles.
- **LogRocket — 5 dashboards studied** ([source](https://blog.logrocket.com/ux-design/dashboard-ui-best-practices-examples/)). The "what will this user care about in 5 seconds?" framing is the single best north-star question.
- **Refactoring UI** ([refactoringui.com](https://refactoringui.com/)). Greyscale-first, hierarchy via spacing/contrast/typography before colour, "start with too much whitespace then remove."
- **Mobbin — Education / Dashboard collections** ([dashboard web](https://mobbin.com/explore/web/screens/dashboard), [education web](https://mobbin.com/explore/web/app-categories/education)). Browseable real-product screenshots; auth required for full-quality images but list view is public.

---

## 3. Widget Catalogue

For each widget: **what / when / who does it well / trade-offs**. GWTH-specific advice in §5.

### 3a. Progress widgets

**Course progress ring / bar**
- *What:* Circular or linear visualisation of overall course completion percentage.
- *When:* Top of dashboard (1 ring per active course; for GWTH, just one).
- *Best in class:* Coursera's per-course progress bars on the dashboard; Reforge's module completion bar in the lesson sidebar.
- *Trade-offs:* Rings are emotionally satisfying but harder to read than bars at small sizes ([NN/g preattentive analysis](https://www.nngroup.com/articles/dashboards-preattentive/)). Bars win for accuracy, rings win for "wow." Hybrid: large ring on dashboard hero, thin bars in lesson nav.
- *Anti-pattern:* Pie charts for >5 segments. Avoid.
- **GWTH today:** uses `ProgressRing` at 100px in the subscriber state. Keep the ring; treat the linear `Progress` bar inside the same card as redundant — pick one.

**Sparkline KPI cards**
- *What:* Big number + tiny inline trend chart + delta arrow ([Art of Styleframe](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/)).
- *When:* Top strip, 4 cards max for GWTH.
- *Best in class:* Stripe (revenue/charges/payouts/disputes pattern).
- *Trade-offs:* Sparklines are noise unless the user actually checks daily — for a 3-month course with weekly cadence, a 4-week sparkline is useful; daily would be sparse.
- *GWTH translation:* "Lessons complete | Hours invested | Quiz average | Days active" (no streak counter, not yet — see §3e).

### 3b. Continue-learning / next-action widgets

**"Pick up where you left off" hero card**
- *What:* Single large card showing the lesson the user was on, their position within it, and a primary CTA.
- *When:* Top of dashboard, above the fold, single most important widget.
- *Best in class:* Netflix (resume position with thumbnail), Coursera (per-course resume), Reforge (module navigation prev/next).
- *Trade-offs:* If the user has finished, this needs an empty/celebration state ("You're caught up — next module unlocks April 30"). Don't leave it stale.
- *Source:* [Resume pattern across platforms](https://medium.com/@fenixlaine/spotify-ux-concept-resume-playlist-64b321387ccf), [LearnStream UX](https://learnstream.io/blog/good-ux-practices/).
- **GWTH today:** missing. Generic "Continue Learning" CTA without showing *which* lesson. Highest-value addition.

**"Next lesson" preview card**
- *What:* Small card showing what comes after the current lesson.
- *When:* Below the resume hero. Useful for "I just finished one, what's next?"
- *Trade-offs:* Risks redundancy with the resume card. Merge them: one card with "Continue Lesson 4.2" primary, "Up next: Lesson 4.3" secondary.

**Recommendations (next-best-thing)**
- *What:* Algorithmic or curated suggestions for what to study next.
- *When:* Optional; only valuable if there's branching content (which GWTH doesn't have at v1).
- *Best in class:* Khan Academy's "Recommended skills" rail.
- *Trade-offs:* For a single-course product, recommendations are *anti-helpful* — they imply choice where there isn't one. **Skip until you have side-content (labs, optional deep-dives).**

### 3c. Social / cohort widgets

**Cohort activity feed**
- *What:* "5 others completed this lesson today" / "Sarah asked a question 2h ago."
- *When:* Sidebar or tertiary widget. Activates relatedness without ranking.
- *Best in class:* Maven's community pane; Reforge's discussion widget.
- *Trade-offs:* Without moderation, low-engagement cohorts make this feel empty. Pair with seeded prompts.
- *Source:* [Maven Community](https://help.maven.com/en/articles/6289166-community-overview), [Wharton on cohort vs self-paced](https://executiveeducation.wharton.upenn.edu/thought-leadership/wharton-online-insights/cohort-vs-self-paced-learning/).
- **GWTH today:** missing. Defer to v2 if no community is live; add now if there is.

**Peer comparison (calm)**
- *What:* "You're on track with your cohort" / "Most learners reach Lesson 4 in week 2."
- *When:* Optional widget on `/progress`.
- *Best in class:* No canonical source found — this is a generalised pattern adapted from cohort-learning research. The principle: aggregate-only, percentile-only, never named ranking.
- *Trade-offs:* Without careful framing, this slips into leaderboard territory. Always show *bands* ("most learners," "ahead of 60% of cohort") not ranks. See [Yu-kai Chou](https://yukaichou.com/advanced-gamification/how-to-design-effective-leaderboards-boosting-motivation-and-engagement/).

**Leaderboards** — explicit anti-pattern for this audience. See §4.

### 3d. Time / deadline widgets

**Upcoming dates / what unlocks next**
- *What:* List of upcoming deadlines, content drops, or live sessions.
- *When:* Right rail or below the hero.
- *Best in class:* edX "Important Dates" mobile widget; Google Calendar integration patterns ([Smashing](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)).
- *GWTH fit:* High. The monthly content drop model means there's *always* a meaningful "next thing" to surface — "Module 2 unlocks April 30" / "Live cohort call: Friday 4pm BST."
- *Trade-offs:* Don't over-notify. One upcoming + one in-7-days is plenty.
- **GWTH today:** missing entirely. The 3-month grid implies monthly drops but doesn't surface the dates.

### 3e. Streak / habit widgets

**Activity heatmap (GitHub-style)**
- *What:* 12-week or 12-month grid; cells coloured by activity intensity.
- *When:* Mid/lower dashboard or `/progress` page.
- *Best in class:* GitHub's contribution graph; Anki's review heatmap ([review-heatmap-replace-streak](https://github.com/usavictor210/review-heatmap-replace-streak)).
- *Why this over a streak counter:* It's *retrospective* (look how much you've done) rather than *prospective-threatening* (don't break the chain). It doesn't reset to zero. Missed days are simply paler cells, not failures.
- *Trade-offs:* Cells with no colour can still feel like guilt for some users. Mitigate by labelling axis only by months (no day numbers visible) and by framing copy around totals ("23 sessions in April") rather than gaps.
- **GWTH today:** the existing `StudyStreakCalendar` is heatmap-shaped which is good — but it's named "streak" which biases the framing toward shame. Renaming + reframing copy is a low-cost win.

**Streak counter — only with safeguards**
- *What:* "X days in a row" badge.
- *When:* Last resort, only if user research shows the audience wants it.
- *Best in class with safeguards:* Apps that include streak freezes, weekend off-by-default, and 80%-rule framing ([Cohorty article](https://blog.cohorty.app/the-psychology-of-streaks-why-they-work-and-when-they-backfire/)).
- *Trade-offs:* Adult professionals describe streak loss as anxiety-inducing ([1107-day streak post](https://medium.com/@jorryn.flanagan/i-have-a-1107-day-streak-on-duolingo-heres-why-i-have-learned-almost-nothing-e888d7fe81e2)). Default to *not* showing this on the GWTH dashboard.

### 3f. Achievement widgets

**Dynamic Score (GWTH-specific, already in code)** — *the load-bearing widget for the GWTH credential story*
- *What:* A measured-capability score per student (overall + sub-metrics: curiosity, consistency, improvement). Already implemented in `src/lib/types.ts` + `mock-data.ts` + rendered on `/progress`.
- *When:* Belongs on the dashboard hero strip in addition to `/progress`. It is **the** thing employers look at on a shared LinkedIn link, so the dashboard should make it visible-but-calm — not a giant gamified number, not a hidden footer stat.
- *How to surface:*
  - **Primary tile (~⅓ width on desktop):** big number ("23 / 36") + 12-week sparkline (`scoreHistory`) + delta vs last week + small `Share to LinkedIn` link.
  - Click-through to `/progress` for the full breakdown (curiosity / consistency / improvement / percentile chart).
  - Sonner toast when score changes ("+1.5 — Lesson 3.2 complete"); no full-screen celebrations (anti-§4h).
- *Trade-offs / design decisions still open:*
  - **Percentile field** — `dynamicScore.percentile` is a peer-rank number, which crosses the leaderboard line if shown publicly. Three options:
    - (a) Keep `percentile` private to the student (don't render on shared LinkedIn card)
    - (b) Reframe as bands ("ahead of cohort" / "with cohort" / "catching up") rather than a number
    - (c) Drop `percentile` from view entirely; rely on absolute score + capability sub-metrics
  - **Decay framing** — pricing copy commits to "scores decay if you stop." Decay is honest, but the dashboard should warn before a decay event ("Your score will decay 0.3 if no activity in 3 days") rather than punish silently. The line between "useful prompt" and "Duolingo streak shame" is narrow — frame as a credential maintenance cue, not anxiety bait.
  - **Verification surface** — "employers can verify" implies a public credential URL with score + audit trail. Treat the dashboard widget as a one-click route to that URL; the URL itself is a separate design.
- *Anti-pattern boundary:* This is NOT XP/leaderboards/public ranking (banned in §4b). It is a verified credential like an Accredible-style digital badge but updated continuously rather than awarded once. Keep the language calibrated to "credential" / "score" rather than "XP" / "level" / "rank."
- *Source:* GWTH-internal (existing code + marketing copy). For comparable verification-credential patterns: [Accredible](https://www.accredible.com/blog/what-is-a-digital-badge), [Open Badges spec](https://openbadges.org/), LinkedIn Learning's badge integration.

**Certificates earned**
- *What:* Display of completed-course credentials.
- *When:* `/progress` page, prominent on completion. Not the dashboard hero.
- *Best in class:* LinkedIn Learning's shareable badges with deep links into LinkedIn profiles ([Accredible](https://www.accredible.com/blog/what-is-a-digital-badge)).
- *GWTH fit:* High. UK working professionals will share to LinkedIn — make sharing a primary CTA.

**Badges / micro-credentials**
- *What:* Smaller achievement markers (module complete, lab complete, first quiz passed).
- *When:* Tertiary surface. Show progress toward unearned badges sparingly — adults find "you have 3/4 to unlock" patterns childish at high frequency.
- *Best in class:* Open Badges spec; LinkedIn badge integration.
- *Trade-offs:* Easy to overdo. Default to: 1 badge per module, 1 capstone certificate. No more.

### 3g. Recent activity / history widgets

**Activity log**
- *What:* "You finished Lesson 3.2 on Tuesday" / "Bookmarked Lab 2 yesterday."
- *When:* Right rail or `/progress` page.
- *Best in class:* GitHub's user activity feed; Notion's recent-pages list.
- *Trade-offs:* For a self-paced solo learner, this is filler unless density is otherwise low. For a cohort context, it doubles as social proof.

### 3h. Search / quick actions

**Cmd+K command palette**
- *What:* Keyboard-triggered overlay for searching lessons, labs, glossary terms, and jumping to settings.
- *When:* Globally available.
- *Best in class:* Linear, Notion, Vercel, Raycast ([Maggie Appleton's command bar essay](https://maggieappleton.com/command-bar)).
- *GWTH fit:* High — David's audience is mid-career professionals, not students; Cmd+K signals "this is a real tool, not a toy." Use shadcn's Command primitive.
- *Trade-offs:* Discoverability — show a `⌘K` hint in the header. Cmd+K must include keyboard-accessible recents, scoped sections, and shortcuts.
- **GWTH today:** already wired (`SearchPalette` in the layout). Verify it's discoverable in the new header design.

**Universal search**
- *What:* Always-visible search input.
- *When:* Header, even if duplicative with Cmd+K (mobile users won't have keyboard).
- *Best in class:* Notion's top-bar search.

### 3i. Notes / bookmarks

**Bookmarks**
- *What:* User-saved lessons/labs for "save for later."
- *When:* Dedicated page; small "recent bookmarks" widget on the dashboard.
- *Best in class:* Medium's bookmark UX ([UX Collective case study](https://uxdesign.cc/medium-bookmarks-a-case-study-c42af80404f1)). Most platforms suffer from the "bookmarks blackhole" — users save and never return ([Escaping Bookmarks Blackhole](https://medium.com/@vishweshnavtake/escaping-bookmarks-blackhole-ux-case-study-0aaf76a38101)).
- *Trade-offs:* Counter the blackhole by surfacing "Saved 2 weeks ago" on the dashboard with a one-click resume.
- **GWTH today:** count + link only. Show 2-3 most recent saves with one-click resume.

**Notes panel**
- *What:* Per-lesson personal annotations.
- *When:* Lesson viewer slide-out; aggregate view on a `/notes` page.
- *Best in class:* DataCamp's notes feature; Notion-style inline annotations.

### 3j. Empty states

**Pattern (per [NN/g](https://www.nngroup.com/articles/empty-state-interface-design/)):**
1. Communicate status — "You haven't started any lessons yet."
2. Teach in context — "When you complete a lesson, your progress shows here."
3. Provide a path — single primary CTA to begin.

**GWTH-specific empty states required:**
- Brand-new user: "Welcome — start with Module 1 Lesson 1."
- Caught-up user: "You're up to date. Module 2 unlocks 30 April. In the meantime: [optional lab] or [community discussion]."
- No bookmarks yet: "Bookmark lessons by clicking the star — they'll appear here for quick return."
- No notes yet: "Take notes inside any lesson — they sync here automatically."

### 3k. Loading states

- Skeleton screens, not spinners. ~20–30% improvement in perceived load ([Art of Styleframe](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/)).
- Shimmer animation matches Linear/Stripe/Notion convention.
- GWTH already has `Spinner` and `PageSpinner` components — pair them with skeleton placeholders that match the actual layout.

---

## 4. Anti-Patterns to Avoid

### 4a. Streak shame
- **What it looks like:** Big red number showing days-in-a-row, urgent push notifications when at risk, sad-mascot loss screens.
- **Why it fails for adult professionals:** Anxiety > motivation. The user with a 1,107-day Duolingo streak who learned nothing is the canonical case ([Medium post](https://medium.com/@jorryn.flanagan/i-have-a-1107-day-streak-on-duolingo-heres-why-i-have-learned-almost-nothing-e888d7fe81e2)). NEIU Independent's [2-year streak holder](https://neiuindependent.org/20561/opinions/duolingo-app-review-as-rated-by-a-2-year-streak-holder/) and the [Hacker News critique](https://news.ycombinator.com/item?id=45425061) corroborate.
- **What it rewards:** consistency-of-tap, not learning gain.
- **Replace with:** activity heatmap (retrospective), session counts ("23 sessions this month"), or no time-pressure widget at all.

### 4b. Public leaderboards
- **What it looks like:** Top-N rankings, global percentile rank, "you're #2,847."
- **Why it fails:** Activates loss-avoidance for the 90% who aren't top-10. Yu-kai Chou: "A poorly designed leaderboard demotivates the majority to energise the few." 43.8% of leaderboard users engage in upward comparison amplifying inadequacy ([source](https://yukaichou.com/advanced-gamification/how-to-design-effective-leaderboards-boosting-motivation-and-engagement/)).
- **For GWTH specifically:** AI-anxious mid-career professionals are *exactly* the audience this hurts most. They're already comparing themselves down to "those AI-native kids."
- **Replace with:** aggregate cohort progress bands, peer questions, "5 others working through this lesson today."
- **Carve-out — GWTH's Dynamic Score is NOT a leaderboard.** It is a per-student verified credential (see §3f1). The distinction:
  - **Leaderboard (banned)** = ranking visible to others; identity attached; activates upward social comparison.
  - **Dynamic Score (kept)** = measured capability per student; visible on the student's own surfaces and on a credential URL the student chooses to share; no ranking-against-named-peers visible.
  - The `dynamicScore.percentile` field is the one place this carve-out is fragile — it's a peer-rank number. Resolve at design time using one of the three options in §3f1 (private to student / banded language / drop entirely).

### 4c. Density-by-default
- **What it looks like:** Power-BI-style 9-widgets-on-load, every chart visible at once.
- **Why it fails:** Adult professionals checking weekly need *glanceable* not *exhaustive*. Linear's own guidance ([source](https://linear.app/now/dashboards-best-practices)) says infrequently-checked dashboards should *guide*, not *cram*.
- **Replace with:** 5–7 primary widgets max. Push everything else to `/progress`, `/bookmarks`, `/notifications`.

### 4d. Feature-creep dashboards
- **What it looks like:** Adding a widget for every feature the team has shipped.
- **Why it fails:** Becomes a control panel for product managers, not a learning surface for users.
- **Cite:** Notion's max 12 widgets / 4-per-row constraint as a discipline. LogRocket's "what does this user care about in 5 seconds?" as a filter.

### 4e. XP and points without intrinsic linkage
- **What it looks like:** "+50 XP" on every action; level-ups disconnected from real capability.
- **Why it fails:** Research is clear that "overemphasising badges, points, or leaderboards may obscure the intrinsic benefits of learning" ([adult learning gamification meta-review](https://www.sciencedirect.com/science/article/pii/S2666374025000317)). Adult learners need autonomy, competence, relatedness — not Skinner-box dopamine.
- **Replace with:** progression tied to demonstrated capability (quizzes passed, labs completed, projects shipped). Make the achievement *itself* the reward.

### 4f. Pie charts, donuts, gauges, 3D anything
- **What it looks like:** Circular completion gauges, multi-segment donut charts.
- **Why it fails:** Humans can't compare angles or areas accurately. Length and 2D position are the only preattentive attributes that work for quantitative data ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
- **Replace with:** bar charts, line charts, sparklines, or single-metric large numbers.

### 4g. Colour as the only signal
- **What it looks like:** Status conveyed only by red/green/amber.
- **Why it fails:** 8% of men have colour-vision deficiency. WCAG AA non-compliance.
- **Replace with:** colour + icon + text. (GWTH's `StatusBadge` already does this — keep it that way.)

### 4h. Patronising microcopy
- **What it looks like:** "Great job!" "You're a star!" celebratory mascots.
- **Why it fails:** Adult professionals find it infantilising. Linear, Notion, Stripe never do this.
- **Replace with:** factual, calm copy. "Module 1 complete. Module 2 unlocks 30 April." Sonner toasts, not full-screen celebrations.

### 4i. The "engagement" trap
- **What it looks like:** Optimising dashboard for daily active use ("come back every day").
- **Why it fails for a 3-month course:** Real professional learning happens in 1–3 sessions per week of 30–90 minutes. Daily-engagement-bait creates false metrics and burns out users.
- **Replace with:** weekly cadence framing ("this week's lesson"), respect for off-days, no Sunday push notifications.

---

## 5. GWTH-Specific Synthesis (the recommended widget shortlist)

Given:
- **Single course, 3 months, monthly content drops**
- **Audience: working UK professionals, AI-anxious, mid-career**
- **Vibe: premium / calm / Linear-flavoured**
- **Stack: Next.js 16, shadcn, Tailwind v4, Motion, dark mode required**
- **Three subscription states already in code: visitor, subscriber, lapsed**

### 5a. Recommended dashboard composition (subscriber view)

**Above the fold (priority 1 — must answer "what do I do next?" + surface the credential):**

1. **Hero "Continue" card** — full-width on mobile, ~⅔ width on desktop. Shows current lesson title, progress-within-lesson bar, primary CTA "Continue Lesson 4.2". On the right ⅓: a course-level progress ring (Module N of 3, X% overall).
2. **Dynamic Score tile** (parallel to the Continue hero on desktop, stacked below on mobile) — big number ("23 / 36"), 12-week sparkline of `scoreHistory`, delta vs last week, small "Share" link to credential URL. See §3f1 for the percentile-framing decision still open.
3. **"What's next" card** — next lesson title + estimated time + difficulty, or "Module 2 unlocks Friday 30 April" when caught up. Smaller, supporting role.

**Mid-page (priority 2 — orientation):**

4. **KPI strip — 4 cards max.** Suggested: "Lessons complete (e.g. 7/24)" | "Curiosity Index" (sub-metric of Dynamic Score, optional/advanced lessons explored) | "Latest quiz score" | "Sessions this week" (no consecutive-day streak). Sparklines over 4-week windows where data permits.
5. **Activity heatmap** — 12-week GitHub-style grid. Retrospective-only framing. "23 sessions in April." Replaces / reframes the existing `StudyStreakCalendar` (rename → "Activity"; drop any consecutive-day counter).

**Below (priority 3 — context, not action):**

5. **Bookmarks widget** — last 3 saved items, with save date.
6. **Cohort sidebar widget** — small. "5 questions in #module-1 today" + 1 sample question excerpt + link to community. **Skip entirely for v1 if no community is live** — David's call.
7. **Empty `/progress` and `/bookmarks` deep-link tiles** — only if those pages have content; otherwise hide.

### 5b. Recommended visitor / free dashboard composition

The current `visitor` state is already pretty strong. Improvements worth Claude Design considering:

1. **Replace the "locked" framing with curiosity-driven framing.** Instead of "Lock icon — Subscribe ££/month," try "Module 1 Preview" with one free lesson playable. Lower friction; preserves the upsell.
2. **Promote a specific free Lab** from the labs library in the dashboard hero, not just a generic "Try a Free Lab First."
3. **Tech Radar tile is good** — keep.
4. **Add a "What's in the course" tile** — three-month outline at a glance. Currently the `MONTH_CONFIGS` grid is hidden behind the paywall.

### 5c. Recommended lapsed dashboard composition

The current red-banner approach is fine for the warning. Improvements:

1. **Banner copy is functional but not warm.** Soften with "Your billing didn't go through — let's keep your progress saved."
2. **Show what they'd lose** — "You're 47% through Module 2; we'll keep this for 14 days while you sort billing."
3. **Below the banner, render the SUBSCRIBER state**, not the visitor state — they still have grace-period access.

### 5d. Layout dimensions (matches your existing `lib/config.ts` shape)

- Sidebar: 280px expanded / 64px collapsed (matches your CLAUDE.md spec, which is also Linear/Vercel convention).
- Header: 64px.
- Content max-width: 1400px.
- KPI cards: `grid-cols-[repeat(auto-fill,minmax(220px,1fr))]` with 24px gap.
- Hero card: full-width on `<lg`, `lg:col-span-8 lg:row-span-2` on `lg+`; "What's next" sits `lg:col-span-4` next to it.

### 5e. Visual rhythm

- **Card style:** `bg-card`, subtle border (`border` token), 12–16px radius, no shadow on default state, subtle shadow on hover.
- **Density:** medium. Notion's 4-widget-per-row max is a good ceiling.
- **Animation:** Motion's `layout` prop for sidebar collapse and tab swap; spring physics on progress rings; respect `prefers-reduced-motion`. Micro-animations 200–400ms ([Smashing on real-time dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)).
- **Typography:** Inter for everything, JetBrains Mono only inside lesson code blocks (which is what your spec says — keep it). The current OKLCH Graphite Warm palette is up for grabs in this redesign per §0 plan decision.
- **Dark mode:** non-negotiable, defaulting to system preference. Linear, Vercel, Stripe, Supabase all ship dark-first; this audience expects it. Your "Graphite Warm" palette is good — neutral warm charcoal sidesteps the green-tinted teal trap.

### 5f. The cohort question

Your audience benefits from cohort presence (relatedness driver from Self-Determination Theory) but is harmed by ranking. The right answer for v1:

- **Include:** ambient activity ("5 classmates working through this lesson today"), seeded discussion threads per lesson, instructor live-call calendar.
- **Exclude:** ranks, leaderboards, public profiles, peer scoring.
- **Defer to Phase 2:** named-peer signals (e.g., "Sarah and 3 others completed this") with explicit opt-in.

### 5g. Onboarding empty state

A returning learner is the easy case. The first-load empty state is the hardest — and the most defensible thing to over-invest in:

- Hero card replaced with: "Welcome to GWTH. Your course starts here." + one CTA "Start Lesson 1.1."
- KPI strip replaced with: a one-line orientation paragraph and 3 onboarding tasks (set notification preferences, install browser extension if any, join cohort channel).
- After Lesson 1.1 complete → full dashboard reveals progressively.

This is the [NN/g empty-states pattern](https://www.nngroup.com/articles/empty-state-interface-design/) applied to a whole-screen state.

### 5h. Risk register (things David should test before committing)

- **Heatmap with 0 cells** — does it feel motivating or guilt-inducing for new users? Mitigation: hide until ≥5 sessions logged.
- **"What's next" when nothing is unlocked yet** — does the "unlocks 30 April" copy feel exciting or frustrating? Mitigation: pair with a labs/community CTA.
- **Cohort widget in low-engagement cohorts** — does it surface dead air? Mitigation: instructor-seeded weekly prompt; hide widget when no activity in 7 days.
- **"Hours invested" KPI** — risks self-judgement. Mitigation: phrase as "time exploring" or remove if user research is negative.

---

## 6. Reference URLs (deduplicated)

### Learning platforms
- Reforge — My Learning: https://reforge.helpscoutdocs.com/article/236-new-reforge-ui-my-learning
- Reforge — On-Demand Courses: https://reforge.helpscoutdocs.com/article/238-new-reforge-ui-on-demand-courses
- Khan Academy — Learning Dashboard: https://blog.khanacademy.org/introducingthe-learning-dashboard/
- Coursera — Learner home: https://www.coursera.org/
- Open edX — Individual Learner Dashboard: https://docs.openedx.org/projects/openedx-aspects/en/latest/reference/individual_learner_dashboard.html
- Open edX — Learner Dashboard MFE: https://github.com/openedx/frontend-app-learner-dashboard
- edX Learning Dashboard Challenge: https://openedx.org/blog/edx-learning-dashboard-challenge/
- Maven — Community overview: https://help.maven.com/en/articles/6289166-community-overview
- Maven — community template: https://maven.com/resources/community-introduction-template
- Brilliant.org x ustwo case study: https://ustwo.com/work/brilliant/
- DataCamp — Progress and XP: https://support.datacamp.com/hc/en-us/sections/360007655154-Progress-and-XP
- DataCamp — Tracks: https://support.datacamp.com/hc/en-us/articles/360017301033-DataCamp-Tracks

### Productivity / dashboard tools
- Linear — Dashboards best practices: https://linear.app/now/dashboards-best-practices
- Linear — UI redesign part II: https://linear.app/now/how-we-redesigned-the-linear-ui
- Notion — Dashboards help: https://www.notion.com/help/dashboards
- Notion — Dashboards release: https://www.notion.com/releases/2026-03-10
- Vercel — Dashboard redesign: https://vercel.com/blog/dashboard-redesign
- Vercel — Project dashboard docs: https://vercel.com/docs/projects/project-dashboard
- Vercel — New dashboard overview changelog: https://vercel.com/changelog/a-new-dashboard-overview-is-now-available
- Supabase UI library: https://supabase.com/ui
- Cursor — team dashboard docs: https://cursor.com/docs/account/teams/dashboard

### Pattern guides and writeups
- NN/g — Dashboards: Making charts easier to understand: https://www.nngroup.com/articles/dashboards-preattentive/
- NN/g — Designing empty states in complex applications: https://www.nngroup.com/articles/empty-state-interface-design/
- NN/g — 8 design guidelines for complex applications: https://www.nngroup.com/articles/complex-application-design/
- Smashing Magazine — From good to great in dashboard design: https://www.smashingmagazine.com/2021/11/dashboard-design-research-decluttering-data-viz/
- Smashing Magazine — UX strategies for real-time dashboards: https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/
- Refactoring UI: https://refactoringui.com/
- LogRocket — I studied 5 popular dashboard UIs: https://blog.logrocket.com/ux-design/dashboard-ui-best-practices-examples/
- Pencil & Paper — Dashboard UX pattern analysis: https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards
- Art of Styleframe — Dashboard design patterns 2026: https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/
- Dashboard Design Patterns project: https://dashboarddesignpatterns.github.io/patterns.html
- Mobbin — Dashboard web screens: https://mobbin.com/explore/web/screens/dashboard
- Mobbin — Education web apps: https://mobbin.com/explore/web/app-categories/education
- Mobbin — Command palette glossary: https://mobbin.com/glossary/command-palette
- Mobbin — Empty state glossary: https://mobbin.com/glossary/empty-state
- Eleken — Empty state UX rules: https://www.eleken.co/blog-posts/empty-state-ux
- LMS dashboard guide (Educate-me): https://www.educate-me.co/blog/lms-dashboard

### Streak / gamification critique
- Medium — 1107-day Duolingo streak, learned nothing: https://medium.com/@jorryn.flanagan/i-have-a-1107-day-streak-on-duolingo-heres-why-i-have-learned-almost-nothing-e888d7fe81e2
- Substack — Duolingo is ruining language learning: https://mathiasbarra.substack.com/p/duolingo-is-ruining-language-learning
- Hacker News — opinionated critique of Duolingo: https://news.ycombinator.com/item?id=45425061
- Medium — Why I let go of my 480-day Duolingo streak: https://saunved.medium.com/why-i-let-go-of-my-480-day-duolingo-streak-a2098b3eff35
- NEIU Independent — Duolingo as rated by 2-year streak holder: https://neiuindependent.org/20561/opinions/duolingo-app-review-as-rated-by-a-2-year-streak-holder/
- Ntari — Fundamental criticisms of the Duolingo approach: https://www.ntari.org/post/fundamental-criticisms-of-the-duolingo-approach
- Medium / Bianca Wu — Duolingo redesign challenge (lost streaks healthily): https://medium.com/design-bootcamp/duolingo-redesign-challenge-celebrating-streaks-in-a-healthier-way-f35cd70f126a
- Cohorty — Psychology of streaks (when they work, when they backfire): https://blog.cohorty.app/the-psychology-of-streaks-why-they-work-and-when-they-backfire/
- WorkBrighter — The habit streak paradox: https://workbrighter.co/habit-streak-paradox/
- UX Magazine — Hot streak game design without shame: https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame
- Yu-kai Chou — How to design effective leaderboards: https://yukaichou.com/advanced-gamification/how-to-design-effective-leaderboards-boosting-motivation-and-engagement/

### Adult-learner gamification research
- ScienceDirect — Effectiveness of gamification in adult education: https://www.sciencedirect.com/science/article/pii/S2666374025000317
- Springer — Evaluation of gamification for adult learners (andragogical): https://link.springer.com/article/10.1007/s10639-024-12561-x
- ResearchGate — Gamification of adult learning: https://www.researchgate.net/publication/331256286_Gamification_of_Adult_Learning_Gamifying_Employee_Training_and_Development
- EPALE — Why gamification is essential for adult learning: https://epale.ec.europa.eu/en/blog/games4you-why-gamification-essential-adult-learning

### Specific widget patterns
- Mobbin — Command palette glossary: https://mobbin.com/glossary/command-palette
- Maggie Appleton — Command K bars: https://maggieappleton.com/command-bar
- Philip Davis — Command palette interfaces: https://philipcdavis.com/writing/command-palette-interfaces
- Dashibase — Adopting Notion's UI: https://dashibase.com/blog/notion-ui/
- Anki review heatmap (replace streak): https://github.com/usavictor210/review-heatmap-replace-streak
- DEV — GitHub-like contribution heatmap in JS: https://dev.to/ajaykrupalk/github-like-contribution-heatmap-in-js-4201
- UX Collective — Medium bookmarks UX case study: https://uxdesign.cc/medium-bookmarks-a-case-study-c42af80404f1
- Medium — Escaping bookmarks blackhole: https://medium.com/@vishweshnavtake/escaping-bookmarks-blackhole-ux-case-study-0aaf76a38101
- LearnStream — 10 good UX practices for online courses: https://learnstream.io/blog/good-ux-practices/

### Cohort learning
- Dr Luke Hobson — Why cohort-based learning is effective for adults: https://drlukehobson.com/blog1/why-cohort-based-learning-is-so-effective-for-adults
- Wharton — Cohort vs self-paced learning: https://executiveeducation.wharton.upenn.edu/thought-leadership/wharton-online-insights/cohort-vs-self-paced-learning/

### Digital badges / certificates
- US Dept of Education — Digital badges for adult learners: https://lincs.ed.gov/professional-development/resource-collections/profile-716
- Accredible — What is a digital badge: https://www.accredible.com/blog/what-is-a-digital-badge
- Open Badges spec: https://openbadges.org/

---

## 7. David's decisions

This doc is a menu, not a spec. Decisions made 2026-04-25 marked ✅ DECIDED; the rest still need a call before Phase 2a.

1. ✅ **Streak counter — REFRAME** (David 2026-04-25). Rename `StudyStreakCalendar` → "Activity"; drop the prominent consecutive-day counter; keep the 12-week heatmap as a retrospective signal.
2. ✅ **Leaderboards / public XP / public ranking — SKIP** (David 2026-04-25), with a **carve-out for GWTH's Dynamic Score** (§3f1, §4b). Personal credential the student can share to LinkedIn for employer verification = core to the GWTH offer = KEEP and surface prominently. Per-student, not peer-ranked.
3. ✅ **Productivity tools (Linear / Notion / Vercel / Stripe / Supabase) over e-learning incumbents (Coursera / Udemy / LinkedIn Learning)** as visual references (David 2026-04-25). Phase 2a Claude Design seed will lead with the productivity-tool aesthetic.
4. ✅ **"Continue Lesson X.Y" hero card replaces the generic CTA** (David 2026-04-25). Highest-priority addition.

**Still open — please answer before Phase 2a starts:**

5. **`dynamicScore.percentile` framing.** It's a peer-rank number (0–100), which crosses the leaderboard line if shown publicly. Three options:
   - (a) Keep `percentile` private to the student only (don't render on the shared LinkedIn credential card)
   - (b) Reframe as bands ("ahead of cohort" / "with cohort" / "catching up") rather than a number
   - (c) Drop `percentile` from view entirely; rely on absolute score + capability sub-metrics
6. **Cohort widget — include now or defer?** Depends on whether a community surface (Discord / Circle / Slack / built-in) is ready. If not, defer to v2.
7. **"Hours / time-spent" KPI vs "Sessions this week" KPI.** Hours risks self-judgement framing; sessions is calmer. Pick one for the KPI strip, or include both?
8. **Cmd+K discoverability.** Already wired. Does the new header need a visible `⌘K` hint button (Linear/Vercel pattern), or is the keyboard-only behaviour fine?
9. **Visitor-state framing — keep "locked + subscribe" or pivot to "Module 1 preview, try Lesson 1.1 free"?** The latter is closer to Brilliant / Coursera; the former is closer to the current.
10. **Lapsed-state design — keep red banner or soften?** Default recommendation: soften copy, render the subscriber state below (still grace-period access).
11. **First-time-user flow — invest in a separate empty-state design, or use the standard subscriber view with empty cells?** Separate flow is higher-impact but a separate design unit (more Claude Design quota).

---

## 8. How this feeds Phase 2a

When Phase 2a runs (`beads_GWTH-eay`), this doc accompanies the Claude Design seed bundle. Specifically:
- §0 → "current state" reference for Claude Design to know what *not* to merely re-skin
- §5 (synthesis) → the **prescriptive widget shortlist** for the redesigned dashboard
- §3 widget catalogue → reference for *how* each widget should behave
- §4 anti-patterns → explicit guardrails ("Claude Design should not propose a leaderboard or daily streak counter")
- §7 → David's ticked decisions get folded into the seed brief
- All URLs → for Claude Design to crawl as visual references if its tooling supports it (or for me to capture screenshots from for the seed bundle)

---

**Note on canonical sources:** A few queries returned no usable canonical writeups: MasterClass dashboard internals, Skillshare/Udemy/freeCodeCamp/Pluralsight dashboard UX, full-quality Mobbin auth-walled screenshots, and the original Refactoring UI dashboard chapter (paywalled). Where principles are cited from these areas they're drawn from secondary writeups, not the primary product or book — flagged inline in §2. For Mobbin specifically, you'll get more from a 30-minute paid browse than from public search results.
