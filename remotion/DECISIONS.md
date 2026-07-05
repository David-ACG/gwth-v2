# W12 explainer — open decisions for David

> **ALL FOUR GATES CLOSED 2026-07-04.** David's picks are recorded in
> `../public/explainer/w12_picks.json`: script = Claude Fable 100s (spoken
> G-W-T-H), voice = VV7B fable100 take 005, motion = the defaults below,
> embed = after-hero + framed. The final cut is wired into the live `/`
> (`src/app/(public)/page.tsx`). This file is kept as the decision record;
> the details below describe the pre-decision option set.

This was built as far as it can go autonomously. Four gates need your eye. Each
has options prepared so you are picking, not starting from scratch. Nothing
below is wired into the live homepage yet; the live `/` is untouched.

---

## Gate 1 — Script (approve or edit)

Read [SCRIPT.md](SCRIPT.md). It is a ~66s draft, British English, no em dashes,
every fact taken from the live homepage. Edit any line. All copy lives in one
file (`src/explainer-content.ts`); change it there and the cut re-times itself.

**If you change the script, the draft voiceover must be regenerated** (see Gate 3).

---

## Gate 2a — Motion per archetype (pick one each)

Each archetype has 2–3 restrained motion treatments, all within the chosen
mixed visual treatment (the colours are NOT up for grabs — only how things
enter). Watch the five reels; each plays its options back to back with a caption:

- `out/motion-title.mp4` — frame-draw / mask-wipe / settle
- `out/motion-statement.mp4` — line-fade / underline-draw / crossfade
- `out/motion-feature.mp4` — stagger / rule-rows / settle
- `out/motion-comparison.mp4` — divider-first / slide-in / sequential
- `out/motion-dispatch.mp4` — stagger / button-draw / settle

Set your picks in one place — the `MOTION` map at the top of
`src/explainer-content.ts` — then re-render. Current defaults:
title `frame-draw`, statement `line-fade`, feature `stagger`,
comparison `divider-first`, dispatch `stagger`.

---

## Gate 2b — Embed chrome + placement (pick one of each)

**Chrome** — review at `/explainer-preview` on the dev site (light and dark):
- **Option A — framed:** paper mat + hairline border + mono caption + a small
  section head. Sits like a journal plate. (Recommended — matches the register.)
- **Option B — bare:** edge-to-edge video, no mat.

**Placement on the live home** (`home-fde.tsx`) — pick one:
1. **After the hero, before "Nine journeys"** (recommended): the tour answers
   "what is this?" immediately after the headline.
2. **Replacing the pull-quote band** ("If you can describe what you want…"):
   the video already ends on that exact line, so it would be redundant there.
3. **After the curriculum, before pricing:** a "see it in action" beat before
   the dispatch band.

Wiring is a one-liner once you pick (the component is built and tested):

```tsx
import { ExplainerVideo } from "./explainer-video"
// ...inside HomeFde, after the hero <section>:
<ExplainerVideo
  src="/explainer/explainer.mp4"
  poster="/explainer/poster.png"
  captionsSrc="/explainer/explainer.vtt"
  chrome="framed"
  heading="See it in a minute."
  kicker="The 60-second tour"
/>
```

Then delete the `src/app/explainer-preview/` review route.

---

## Gate 3 — Voice (approve the draft, or re-record)

The draft VO is **your cloned voice**, generated with F5-TTS from your existing
sample (`~/david-TTS-sample-podcast-65-15.wav`) using the tts-voices recipe
(cfg 2.2, speed 0.95, em-dash uptalk prevention). It is in the current cut
(`out/explainer-draft-vo.mp4`). Two paths from here:

- **(i) Approve the clone** as the final voice → done.
- **(ii) Record it yourself** for the real cut → use the chunked takes in
  SCRIPT.md, drop the files in `public/audio/`, re-time each beat's `seconds` to
  the new audio, re-render.

**One thing to confirm regardless:** the draft pronounces "GWTH" as **"growth"**
(the brand spelled without vowels). If you say it differently (for example
"G-W-T-H"), tell me and I will regenerate beats 6 (and the title kicker is text
only, so unaffected).

> Per the brief, the final cut must be your voice. The clone counts as your
> voice (path ii in the brief), but it is marked draft until you approve it.
