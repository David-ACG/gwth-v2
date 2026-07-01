# GWTH.ai explainer — Remotion workspace (FDE journal register)

A self-contained Remotion project that produces the gwth.ai homepage explainer
video **and** leaves behind a small, reusable library of FDE-register slide
templates. Co-located with the platform it embeds into (W12).

> This is its own React 18 / Remotion 4 project root with its own
> `node_modules`. It deliberately does **not** share the Next.js app's React 19
> tree, so the platform's root `tsconfig.json` excludes `remotion` from the main
> `tsc` typecheck. The slide templates here are the keepable deliverable; the
> explainer is one composition assembled from them.

## Quick start

```bash
cd remotion
npm install              # first time only
npm run studio          # open Remotion Studio to preview/scrub every composition
npm run render          # render the explainer to out/explainer.mp4 (uses the VO)
```

Render any single composition:

```bash
npx remotion render src/index.ts <CompositionId> out/<name>.mp4
npx remotion still   src/index.ts <CompositionId> out/<name>.png --frame=60
```

## Compositions

| Id | What it is |
|---|---|
| `Explainer` | The composed 65s homepage explainer (the deliverable). `audioSrc` prop selects the voiceover; defaults to the David-voice draft. |
| `MotionOptions-Title` / `-Statement` / `-Feature` / `-Comparison` / `-Dispatch` | One reel per archetype that plays its 2–3 motion options back to back with a caption, for David's step-2a pick. |
| `Slide-TitleCover` / `-SingleStatement` / `-Feature` / `-ComparisonTwoUp` / `-CtaDispatch` | Each template alone with default motion — a library contact sheet. |

## The reusable template library (`src/slides/`)

Five typed, props-driven slide components in the FDE register. Every one takes
all copy via props (no hard-coded text), uses FDE tokens only (no raw hex),
handles long text, and exposes 2–3 `motionVariant`s.

| Component | Beat archetype | Default surface | Motion variants |
|---|---|---|---|
| `TitleCover` | Title / cover | teal band | `frame-draw`, `mask-wipe`, `settle` |
| `SingleStatement` | One big statement | paper | `line-fade`, `underline`, `crossfade` |
| `Feature` | Feature list / section | paper | `stagger`, `rule-rows`, `settle` |
| `ComparisonTwoUp` | Two-up comparison | paper | `divider-first`, `slide-in`, `sequential` |
| `CtaDispatch` | CTA / dispatch band | deep-teal band | `stagger`, `button-draw`, `settle` |

Use them anywhere:

```tsx
import { TitleCover } from "./slides"

<TitleCover
  kicker="GWTH.ai"
  lines={["Stop watching", "AI change", "the world. *Build.*"]}
  facts="UK applied AI · 5 hours a week · 3 months"
  surface="teal"
  motionVariant="frame-draw"
/>
```

`*word*` in any heading/statement renders as the register's ochre italic-`em`
accent. Mono labels are functional only — no decorative slide numbers or dates
(the no-clutter rule).

## Where things live

```
remotion/
├── src/
│   ├── theme/fde-theme.ts     # FDE tokens (verbatim from DESIGN_FDE §2), type scale, surfaces
│   ├── theme/fonts.ts         # Source Serif 4 + JetBrains Mono via @remotion/google-fonts
│   ├── motion/presets.ts      # restrained motion vocabulary (fades, hairline draws, wipes)
│   ├── components/primitives.tsx  # Frame, Mono, EmText
│   ├── slides/                # the five reusable templates + barrel
│   ├── explainer-content.ts   # ALL copy + beat timing for the explainer (edit here)
│   ├── Explainer.tsx          # composes the beats into the timeline
│   ├── Root.tsx               # registers every composition
│   └── index.ts               # registerRoot
├── public/audio/vo-david-draft.wav   # assembled draft voiceover (David's cloned voice)
├── public/captions/explainer.vtt     # captions track
├── assets/audio/                     # per-beat VO chunks (source)
├── out/                              # rendered mp4s and stills
├── SCRIPT.md                  # the script + chunked voiceover (David approves)
├── DECISIONS.md               # the open gates for David (script, motion, embed, voice)
└── REMOTION_REPORT.md         # how Remotion performed
```

## Editing the explainer

All copy and timing live in `src/explainer-content.ts`. Change a line or a
`seconds` value and the cut re-times automatically; the slide components never
need editing. If the final voiceover is re-recorded, set each beat's `seconds`
to match the new audio, replace `public/audio/vo-david-draft.wav`, and re-render.

## Design authority

This workspace follows `GWTH_V2/DESIGN_FDE.md` (the canonical FDE register). The
older lesson-video look in `/home/david/remotion-project`
(`DESIGN_GUIDE.md` / `DESIGN_RULES.md`, Ocean-Tech neon) is **superseded here**:
FDE tokens, serif typography, square corners, hairlines and flat colour win for
anything on gwth.ai. Only the lesson-video motion/pacing conventions (spring
configs, frame timings, cut-on-the-curve) were carried over.
