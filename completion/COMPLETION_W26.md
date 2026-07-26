# Completion: W26 — production demo-path readiness on gwth.ai

**Date:** 2026-07-26 (night run) · **Repo:** GWTH_V2
**Commits (master):** `32ca81b` → `4284dd4`, fourteen commits, 32 files, +1,148 / −124
**Prod:** <https://gwth.ai> · Coolify `tw0cc8oc0w4scwoccs0cw0go`, deployed and verified at `4284dd4`
**Test URL:** <https://gwth.ai/> then sign in at <https://gwth.ai/login>
**Status:** DONE, awaiting your verdict

Everything below was fixed and then proved **on the live site**, not locally.
The final production run is **78/78 checks passed** at 1440 and 390, plus
**18/18** on the W25 gate to show it was not weakened.

## What changed

- **The home intro video now supports byte ranges through Cloudflare**, so it
  scrubs and starts mid-video. The origin was never at fault; Cloudflare was
  caching the `.mp4` and refusing to range-serve it. It also plays end to end
  on production, 95.7 seconds, zero stalls, `ended=true`.
- **The lesson-1 intro video was invisible on production** and is now fixed.
  This was the worst thing found tonight: a loading skeleton that never came
  down covered the video and swallowed the click that would start it.
- **The demo lesson, dashboard, labs and the marketing pages were swept at both
  widths** and eleven further defects were fixed, from clipped mobile controls
  to copy promising access the W25 gate no longer gives.
- **Nine things I could not safely fix before Monday are listed below with bead
  ids.** Nothing is left silent.

## What you should verify

- **Play the home video and drag the scrubber.** <https://gwth.ai/> then click
  "Play the 90-second tour" and drag to the middle. Before tonight that snapped
  back to zero. This is the single change most likely to be noticed live.
- **Open the demo lesson and look at the video on page 1.**
  <https://gwth.ai/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers>
  It rendered as a solid green block with no play button on production until
  tonight. Please click it yourself.
- **Reset drill.** The demo student's progress was cleared back to zero after
  testing (see "Demo account reset" below), so Monday starts on "Your first
  lesson is ready". Sign in and confirm the dashboard still says `0 / 26`, and
  run `bash deploy/w26-reset-demo-progress.sh` again after Sunday's dry run.

One decision is yours and I have deliberately left it alone: the intro video's
burnt-in title card still shows the old lesson title with an em dash
(`gwth-launch-1c0`). It needs a pipeline re-render, which is not something to
do 36 hours out without your say-so.

---

## 1. Home intro video: byte ranges

**Before:** a `Range` request came back `200` with the whole 5,870,949-byte body
and no `accept-ranges`. Seeking to 60 seconds put `currentTime` back to `0.00`
and silently restarted from the beginning. Safari and iOS refuse to play an
HTML5 video whose server does not range-serve at all.

**Diagnosis.** Three probes located it precisely:

| Layer | `Range: bytes=0-999` | Verdict |
|---|---|---|
| Next static handler on staging `:3001` | `206`, `content-range: bytes 0-999/5870949` | correct |
| Hetzner origin, bypassing Cloudflare via `--resolve` | `206`, `accept-ranges: bytes` | correct |
| Through Cloudflare | `200`, full 5.87 MB body, no `accept-ranges` | **the fault** |

The captions track sitting next to the video was the control that gave the fix
away: `.vtt` is not one of Cloudflare's default-cached extensions, so it is
`cf-cache-status: DYNAMIC` and already range-served correctly on production.
`.mp4` is a default-cached extension, and Cloudflare would not range-serve what
it held.

**Fix.** `src/proxy.ts` stamps `Cache-Control: private, max-age=3600` on paths
matching `RANGE_SERVED_MEDIA` (`mp4|m4v|mov|webm|m4a|mp3|ogg`). Cloudflare
honours `private`, marks the response `BYPASS`, and proxies the Range straight
through to an origin that already answers `206`. `private` rather than
`no-store` on purpose: the browser still caches for an hour, so a second
viewing in the same session does not re-download.

**After, live:** full proof in [`W26/byte-range-proof.txt`](W26/byte-range-proof.txt).

```
$ curl -s -o /dev/null -D - -H 'Range: bytes=2000000-2000999' https://gwth.ai/explainer/explainer.mp4
  HTTP/2 206
  accept-ranges: bytes
  content-range: bytes 2000000-2000999/5870949
  content-length: 1000
  cf-cache-status: BYPASS
  bytes served match the source file: YES
```

Three ranges were checked, at the head, the middle and the last 500 bytes, and
each was byte-compared against `public/explainer/explainer.mp4`. All matched.

**Playback on production**, driven in a real browser:

```
PASS  poster frame renders before play — naturalWidth 1100
PASS  home page has a video with poster and captions
PASS  captions track loads real cues — captions/English, 20 cues
PASS  video plays end to end without stalling — reached 95.7s of 95.7s, ended=true, stalls=0
PASS  video scrubs to mid-video and resumes — currentTime 49.0s after seeking to 45s, readyState 4
```

![Home explainer playing on production](W26/prod-home-video-playing.png)

### The voice: measured, and it is your call

You asked whether the tail drifts the way the L1 lesson intro did. **On the
words and the timing, no.** I transcribed the audio with faster-whisper and
compared it against its own VTT script:

| Measure | Result |
|---|---|
| Overall WER | **0.0044** (one ASR homophone in 228 words) |
| Final third (cues 15 to 20) | **0.000** |
| Final 20 per cent (cues 18 to 20) | **0.000** |
| Caption alignment drift | mean +0.14s, trend +0.003 s/cue, i.e. flat |
| Repeated phrases, dropped sentences, mid-file dead air | none |

The tail is the *best* region, the inverse of what L24 found on the lesson
intro. **But WER is blind to timbre**, and bead `gwth-launch-ps5` already
measured HNR falling 3.07 at the head to 2.53 at the tail and 1.50 on the last
cue, present in the source take rather than the mux, with take 004 measuring a
cleaner tail. So if it still sounds wrong to you, the evidence points at voice
quality, not at the script. **I have not re-voiced anything: that is L25 and it
needs your ear.** The measurements are merged into `gwth-launch-ps5`.

One more thing worth knowing before you decide: the video runs to 95.60s while
the last spoken word ends at 92.84s and true silence starts at 93.19s. A viewer
sees about 2.4 seconds of silent outro, which can itself read as a stall on a
screen share.

---

## 2. The demo lesson

**Test URL:**
<https://gwth.ai/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers>

| Thing | Before | After |
|---|---|---|
| Intro video, page 1 | **Solid green block, no play control.** `<video>` healthy at readyState 4, but a `data-slot="skeleton"` div at `z-10` covered it and intercepted the click. Reproduced 3 times out of 3, including a 20-second wait | Video visible with a play control, plays on click. Verified on prod at both widths: `0 covering skeleton(s), readyState 4`, `currentTime 3.46s of 89.5s` |
| Lesson H1 | `Welcome to GWTH Six Ways AI Can Give You Superpowers` | `Welcome to GWTH: Six Ways AI Can Give You Superpowers` |
| Lesson body | No raw markdown, no em dashes, no US spellings across 44,762 rendered characters | unchanged, re-checked |
| Images | All 17 return 200 and render | unchanged |
| Narration audio | Real: `media.gwth.ai/.../kokoro_main.wav`, 1931.4s, advances on play | unchanged |
| Quiz | Scores, gives per-question feedback, offers RETRY, passes at 100% | unchanged |
| Project page, outline, pagination | Real, 13 pages, next lesson resolves 200 | unchanged |
| CONTINUE button at 390px | Right edge at **464** against a 390px viewport, a third of it clipped off-screen and unreachable (nothing scrolls horizontally) | right edge **370** |
| Pagination row at 390px | left edge **−54**, "Play narration" at left **−46**, right **2**, so the control was all but gone | left edge **20**, play button left **16** |
| Header breadcrumb at 390px | Wrapped to four lines, 160px tall inside a 64px header, painted straight through the `P1/13` outline toggle | one line, ellipsised, height **19**, no intersection |

![Demo lesson, 1440](W26/prod-lesson-l1-1440.png)
![Demo lesson, 390](W26/prod-lesson-l1-390.png)

**Final walk on production**, after the last deploy, all 13 pages plus the
quiz, driven in a real browser:

```
LOGIN ok -> https://gwth.ai/dashboard
13/13 pages rendered, 0 raw-markdown hits across the lot
  (checked for **, leading # or ##, leading "> ", bare ---, |---|, [text](url), backticks)
WRONG SUBMIT  -> "SCORE 0% · 67% NEEDED", retry offered,
                 toast "Score 0%. You need 67% to pass. Retry when ready."
RETRY         -> "0 OF 3 ANSWERED"
RIGHT SUBMIT  -> "SCORE 100% · PASSED", FINISH LESSON enabled,
                 toast "Q&A passed at 100%. Saved to your progress."
OUTLINE       -> 13 real entries, P01 to P13, with types and durations
COURSE        -> 26 lesson links, all resolving, titles now punctuated
```

Mobile geometry measured at 390x844 on the live site:

```
PAGE 1  CONTINUE right edge 370 (<= 390)      PAGE 2  CONTINUE right edge 370
        pagination row left 20 (>= 0)                 pagination row left 20
        breadcrumb 182x19, outline toggle 77x30       "Play narration" 16..64, fully on screen
        breadcrumb x outline intersects: FALSE        breadcrumb x outline intersects: FALSE
        scrollWidth 390 == clientWidth 390            scrollWidth 390 == clientWidth 390
```

![Demo lesson page 1, 390, after the fix](W26/final-lesson-page1-390.png)

### Lessons that are not demoable

25 of the 26 Month-1 lessons have no narration recorded, so their audio bar is
the state a visitor meets almost everywhere. It read **"NARRATION NOT AVAILABLE
YET"** over **"This lesson's narration is still in production"**, which sounds
like something broken behind the scenes.

It now reads **"NO READ-ALONG ON THIS LESSON"** over **"Read-along audio is
being added lesson by lesson through the beta. This one is a reading lesson."**
Same true state, framed as the plan it actually is, and it matches what
`/guide` already tells students. The placeholder is kept rather than hidden on
purpose: an honest empty state beats a fake player, which is what this
component chose from the start. Narration for l02 to l26 stays on bead
`gwth-launch-0xo`.

![Lesson 2's audio bar on production, after the change](W26/final-lesson2-no-readalong.png)

Raw evidence: [`W26/final-lesson-walk.txt`](W26/final-lesson-walk.txt) and
[`W26/final-mobile-geometry.txt`](W26/final-mobile-geometry.txt).

An independent adversarial re-walk of the whole lesson after the last deploy
returned **11/11 PASS**: video click no longer swallowed (`elementFromPoint` at
the video centre returns the `<video>` itself), zero markdown hits across all
13 pages on eight separate patterns, narration `206 audio/wav` advancing
`00:00 → 00:04 / 32:11`, quiz 0% then 100% with the right toasts, the
completion screen's "UP NEXT · LESSON 2" resolving 200, and **zero console
errors and zero responses at 400 or above** across the whole run. It also found
three things worth knowing, all now on beads and listed below.

---

## 3. Student dashboard

**Test URL:** <https://gwth.ai/dashboard>

The dashboard was in better shape than expected and needed no correctness fix.
Verified on production, signed in:

- **Month:** "Month 1 of 3", "MONTH 1 OF 3". Correct.
- **Lesson order:** L01 to L06 in order, then "+ 20 MORE LESSONS THIS MONTH".
  Correct.
- **Continue:** "START LESSON 1" points at
  `/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers`.
  Correct.
- **No seeded data:** every counter reads a real zero (0 done, 0 hours, 0
  streak, 0 projects). Nothing invented.

What did need fixing:

| Thing | Before | After |
|---|---|---|
| Lesson titles | 22 of 26 read as run-on sentences: `Your AI Colleague How to Get Brilliant Help Without Giving Up Your Judgement`. An earlier sweep removed the banned em dashes and put nothing in their place | Colons and the source syllabus's commas restored: `Your AI Colleague: How to Get Brilliant Help Without Giving Up Your Judgement`. One Americanism corrected, `Toward` to `Towards` |
| `/progress` at 390px | "Current streak" and "LONGEST 0 DAYS" painted on top of each other; the label box was 33px wide with 68px of content and `overflow: visible` | Label has `min-width: 0`; below 480px the meta drops to its own row |
| REPORT A PROBLEM tab | Rested at `translate(0.3rem, -50%)`, putting its right edge 5px past a 1440 viewport and 2px from right-aligned stat meta, so "ALL TIME" and "LONGEST 0 DAYS" read as truncated (`beads_GWTH-81d`) | Rests flush inside the edge, hover reveal slides inwards, clearance −2px to **+4px** |
| Dashboard outline at 390px | Kept its fixed LENGTH column, so titles wrapped over five lines in about 150px | Duration drops under the title; title column 150px to **281px** |
| Course header | `26 LESSONS · 98H · 3 MONTHS` beside `24 mandatory lessons` beside a list of 26 | `26 LESSONS AVAILABLE NOW · 98H ACROSS 3 MONTHS`, and the config corrected to 26 |

![Dashboard, 1440](W26/prod-dashboard-1440.png)
![Dashboard, 390](W26/prod-dashboard-390.png)
![Progress, 390 — the overprint is gone](W26/prod-progress-390.png)

### The lesson counts, in one place

Three surfaces gave three answers about the same Month 1. Production really
holds 26 Month-1 lessons (verified with `psql`), so the config was wrong, not
the data. `TOTAL_MANDATORY_LESSONS` was a standalone `64` maintained separately
from the per-month numbers, which is exactly how it drifted; it is now derived
from `MONTH_CONFIGS` and the four places that typed it out read it from there.
Months 2 and 3 are left at 20+15 because their content does not exist yet and
there is nothing to verify them against.

The `98H` was not wrong, only unlabelled: it covers the whole three-month
course while the lesson count covers what exists today. The header now names
each scope rather than changing either number.

---

## 4. Whole demo-path sweep, 1440 and 390

Every route below was loaded on the live site, signed in, at both widths, with
horizontal overflow measured as `documentElement.scrollWidth` against
`window.innerWidth`. **Zero overflow on all ten routes at both widths.**

| Route | 1440 | 390 |
|---|---|---|
| `/` | ![](W26/prod-home-1440.png) | ![](W26/prod-home-390.png) |
| `/login` | ![](W26/prod-login-1440.png) | ![](W26/prod-login-390.png) |
| `/dashboard` | ![](W26/prod-dashboard-1440.png) | ![](W26/prod-dashboard-390.png) |
| lesson L1 | ![](W26/prod-lesson-l1-1440.png) | ![](W26/prod-lesson-l1-390.png) |
| `/labs` | ![](W26/prod-labs-1440.png) | ![](W26/prod-labs-390.png) |
| `/labs/job-advert-claude-vs-chatgpt` | ![](W26/prod-lab-detail-1440.png) | ![](W26/prod-lab-detail-390.png) |
| `/progress` | ![](W26/prod-progress-1440.png) | ![](W26/prod-progress-390.png) |
| `/course/applied-ai-skills` | ![](W26/prod-course-1440.png) | ![](W26/prod-course-390.png) |
| `/pricing` | ![](W26/prod-pricing-1440.png) | ![](W26/prod-pricing-390.png) |
| `/about` | ![](W26/prod-about-1440.png) | ![](W26/prod-about-390.png) |
| `/for-teams` | ![](W26/prod-for-teams-1440.png) | ![](W26/prod-for-teams-390.png) |

### Dark mode

Checked separately on production, signed in, at 1440, because a screen share
inherits whatever theme the browser is in. Five surfaces render correctly with
zero horizontal overflow: dashboard, the demo lesson, `/progress`, the lab
detail and home. The logo shows its mustard arrow on the dark ground, per the
two-ink rule.

![Demo lesson, dark, 1440](W26/prod-dark-lesson-l1-1440.png)
![Dashboard, dark, 1440](W26/prod-dark-dashboard-1440.png)

Fixed along the way:

| Defect | Before | After |
|---|---|---|
| **Labs promised access the gate no longer gives.** CIPD would watch a screen share saying no account is needed, then be bounced to `/login` afterwards | `The Model Arena · Free, no account`, `Read free · No account needed`, `Free to read`, and the same promise in the page metadata | `The Model Arena · Dated head-to-head tests`, `Included free with your beta place`, `Outputs unedited`. **The W25 gate itself was not touched** |
| **Breadcrumb linked to a 404.** `/course/applied-ai-skills` offered a `COURSE` crumb pointing at `/course`, which has no page; the lesson URL added a second at `/course/<slug>/lesson` | two dead links one click from the demo lesson | both render as plain crumbs. `0 anchors with href="/course"` on production |
| **Home page title stacked the brand twice** | `GWTH.ai \| Beginner-to-Advanced Applied AI \| GWTH.ai` | `GWTH.ai \| Beginner-to-Advanced Applied AI` |
| **Two `/pricing` CTAs read "Join the Waitlist", one went to `/signup`**, which answers "Registration closed" | mixed destinations | all three go to `/waitlist`. `0 anchors with href="/signup"` |
| **£29 written three ways** | home `£29/mo`, pricing `£29/mo`, for-teams `£29.00/month` | all `£29/mo`. Values unchanged |
| **Home images had no `sizes`**, so a 390px phone fetched the `w=3840` variant (209 KB) into a 348px slot | about 250 KB wasted per mobile load | each `sizes` mirrors its column width |
| **The lab's two answers looked inconsistent.** ChatGPT's output is markdown (it was generated through the Codex CLI) so it shows literal `##` and `**` beside Claude's plain prose | reads as a broken page | a line under the section heading says each answer is printed exactly as the tool returned it, formatting marks and all. Outputs untouched; whether to render the markdown instead is your call on bead `gwth-launch-6zx` |

### robots.txt

The two contradictory groups are real. Cloudflare prepends a managed
content-signals block that opens with its **own** `User-agent: *` carrying
`Allow: /`, then the origin's `User-Agent: *` / `Disallow: /` follows. RFC 9309
settles an equally specific allow-versus-disallow in favour of the allow, so
the wildcard `Disallow` was blocking nobody.

Fetching the origin directly proves the origin's file is clean, so the
contradiction is injected at the edge. I fixed the half that lives in the repo:
`src/app/robots.ts` now emits **named groups** for Googlebot, Googlebot-Image,
Googlebot-News, Bingbot, Slurp, DuckDuckBot, Baiduspider, YandexBot and
Applebot, plus fourteen AI scrapers. A crawler obeys the most specific matching
group and ignores the wildcards, so every crawler that actually drives indexing
is now blocked outright, without editing Cloudflare's block and losing its
Content-Signal AI-training reservations.

```
PASS  robots.txt blocks Googlebot by name — named group present with Disallow: /
PASS  robots.txt blocks Bingbot by name
PASS  robots.txt blocks DuckDuckBot by name
PASS  robots.txt blocks Applebot by name
```

The other half needs the Cloudflare dashboard and this repo holds no Cloudflare
credential. It is bead `gwth-launch-4w1`, and the exposure is nil either way:
every pre-launch response carries `X-Robots-Tag: noindex`, which is
authoritative and beats robots.txt outright.

---

## Backend / data change

Two production changes were made outside the deploy: a title-only database
update and a demo-account reset.

```mermaid
flowchart TB
  subgraph before["lessons table, before"]
    B1["title: 'Welcome to GWTH Six Ways AI Can Give You Superpowers'"]
    B2["slug: welcome-to-gwth-six-ways-ai-can-give-you-superpowers"]
  end
  subgraph after["lessons table, after"]
    A1["title: 'Welcome to GWTH: Six Ways AI Can Give You Superpowers'"]
    A2["slug: UNCHANGED"]
  end
  B1 -->|"22 UPDATE statements, one transaction"| A1
  B2 -->|"not touched"| A2
  A1 --> R["rollback: completion/W26/prod-lesson-titles-before-*.csv"]
```

**Why it is safe.** Titles only, inside one `BEGIN`/`COMMIT`, keyed by primary
key. Slugs are untouched, so no URL changes and no redirects are needed. Every
prior title is captured in
[`W26/prod-lesson-titles-before-20260726T015848Z.csv`](W26/prod-lesson-titles-before-20260726T015848Z.csv),
so a rollback is a `psql` copy away. The same migration was applied to the
staging database for parity. The statements live in
[`deploy/w26-lesson-title-punctuation.sql`](../deploy/w26-lesson-title-punctuation.sql).

### Demo account reset

Verification walked the whole lesson on the real demo account, which completed
lesson 1 and recorded a quiz pass. That would have shown CIPD a half-finished
course on Monday instead of "Your first lesson is ready", so the account's
`lesson_progress` rows were deleted afterwards and the dashboard confirmed back
at `0 / 26`. Nothing else about the account was changed: the login, the
verified email and the `manual_beta` grant are all as W25 left them.

The reset is a script, so it can be run again after Sunday's dry run:
[`deploy/w26-reset-demo-progress.sh`](../deploy/w26-reset-demo-progress.sh).
Confirmed on the live dashboard afterwards:

```
H1: "Welcome, David. | Your first lesson is ready."
0 / 26 MANDATORY   present
0 DONE · 26 TO GO  present
START LESSON 1     present
CONTINUE LESSON …  absent
grant intact: familyuccelli@gmail.com, subscription_month 1, beta cohort 1
```

![Dashboard back at a clean start](W26/prod-dashboard-reset-1440.png)

---

## Known, not fixed

Every one has a bead. Nothing here is silent.

| Bead | What | Why not before Monday |
|---|---|---|
| `gwth-launch-j00` | Lesson m1_l01 page 10 promises "The Build section below", and there is no Build section anywhere in the lesson | Lesson body copy lives in the pipeline repo and needs a re-import. Rewriting lesson prose 36 hours out is a bigger risk than the sentence |
| `gwth-launch-7we` | The same lesson renders `4.1 Research` to `4.6 Automation and agents`, referring to a section 4 the reader never sees | Same: pipeline content, needs a re-import |
| `gwth-launch-0w1` | Two lesson images are 2.5 MB and 2.3 MB PNGs; the other 15 are 47 to 96 KB. They can visibly pop in on a cold cache | Pipeline media regeneration. Mitigation: scroll the lesson once before presenting to warm the CDN |
| `gwth-launch-4w1` | Cloudflare's managed robots.txt still says `Allow: /` | Needs a Cloudflare credential this repo does not have. `X-Robots-Tag: noindex` already does the real work |
| `gwth-launch-6zx` | Whether the Model Arena should render its verbatim outputs as markdown | A ratified design question, not a bug, and it is yours to decide. W26 took the low-risk half and named the behaviour on the page |
| `gwth-launch-02u` | `/progress` Study Streak heatmap has no weekday or week labels and a ragged final row, unlike the dashboard's own | A tour stop, not a demo centrepiece, and it needs a component swap rather than a CSS tweak |
| `gwth-launch-3nz` | The general breadcrumb overflow is fixed only for the lesson viewer | No other current route reproduces it on production. The general fix touches every dashboard route |
| `gwth-launch-0mg` | The tone gate reads "Superpowers" across the Month-1 lesson names as hype, and "AI Power Tools: MCPs, CLIs..." as beginner jargon | It failed the first pass on the lesson NAMES, not on my punctuation change. Re-run scoped to the punctuation delta it passed, and only the punctuation shipped. Renaming is a curriculum-wide decision for you |
| `gwth-launch-ps5` | The explainer voice sounds strange towards the end | Measured tonight and the words and timings are clean, so this is timbre. **Not re-voiced deliberately: that is L25 and needs your ear** |
| `gwth-launch-0xo` | 25 of 26 Month-1 lessons still have no narration | Pre-existing and out of scope. The state now reads as a plan rather than a fault |
| **`gwth-launch-1c0` (P1)** | **The intro video's burnt-in title card still reads "Welcome to GWTH — What AI Can Actually Do For You": the superseded title, with an em dash.** The page around it now says "Welcome to GWTH: Six Ways AI Can Give You Superpowers" | It is baked into the MP4, so it is a pipeline re-render and re-upload. Doing that 36 hours before the demo is a bigger risk than one title card, but it is the one item here an attentive viewer might actually catch, so it is P1 |
| `gwth-launch-a8p` | Reloading mid-lesson returns to page 1, and `?page=13` does not deep-link | Harmless for a linear demo; the workaround is not to refresh mid-lesson. Lesson-level progress IS persisted, it is only the within-lesson cursor that is not |
| `gwth-launch-9za` | The lesson route renders two `<main>` elements | Accessibility smell, no user-visible impact |

---

## Verification run

**Production, after the final deploy at `4284dd4`:**

```
$ DEMO_PASSWORD=... node deploy/verify-w26-prod.mjs
78/78 checks passed
```

Covering: three byte ranges byte-compared against the source file; poster,
captions, full 95.7s playback and a mid-video seek; sign-in at both widths; ten
routes at 1440 and 390 with overflow measured; the intro-video skeleton; the
lesson H1; the dead `/course` breadcrumb link; the labs access promise; the
`/signup` CTA; the doubled home title; the report-a-problem tab; and four named
robots.txt crawler groups.

**The W25 gate, re-run to prove nothing was weakened:**

```
$ DEMO_PASSWORD=... ONLY=anon node deploy/verify-w25-prod.mjs
18/18 checks passed
```

Anonymous traffic still reads the marketing site and is still bounced off
`/labs`, every lab detail, `/dashboard` and the lesson viewer; a forged session
cookie still reaches no lab content; no marketing page offers a dead-end Labs
link.

**Local:**

```
$ npm test          → 474 passed | 13 skipped (487)
$ npx tsc --noEmit  → clean
```

Twenty-one new tests were added alongside the fixes: seven pinning the video
skeleton race, five on the breadcrumb, three on the media cache header, one on
the robots crawler groups, and the rest on the mobile layout contracts and the
changed copy.

**Guardrails held:** FDE register throughout, no eyebrow pills, no em dashes in
any user-visible copy, British English, no hardcoded colours, no new
dependencies. Every copy change cleared the Codex tone gate; the one FAIL and
what I did about it is recorded above under `gwth-launch-0mg`.
