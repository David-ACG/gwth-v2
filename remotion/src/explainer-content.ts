/**
 * Content + timing for the GWTH.ai homepage explainer.
 *
 * This is the ONLY place the explainer's copy and beat lengths live. Editing a
 * line here (or a `seconds` value) re-times the cut without touching any slide
 * component — the slides are pure templates driven entirely by these props.
 *
 * Copy is transcribed from the live FDE homepage (`home-fde.tsx`) and the
 * FINAL approved script (the fable100 winner David picked on 2026-07-04, see
 * `public/explainer/w12_picks.json` in the site repo). British English, no em
 * dashes. `*word*` marks the single ochre italic-em accent per heading.
 *
 * TIMING: beat boundaries are cut to the final voiceover take
 * (`vv7b_explainer_fable100_perfect_005.wav`, 93.52s) using word-level
 * Whisper timestamps; each cut sits at the midpoint of the spoken pause
 * between sections, so slides change exactly where the voice does. The final
 * beat holds ~2.7s past the last word before the closing fade.
 */
import type {
  TitleCoverProps,
  SingleStatementProps,
  FeatureProps,
  ComparisonTwoUpProps,
  CtaDispatchProps,
} from "./slides";

/** 30fps timing for each beat, cut to the final VO take. */
export const FPS = 30;

export type Beat =
  | { kind: "title"; seconds: number; props: TitleCoverProps }
  | { kind: "statement"; seconds: number; props: SingleStatementProps }
  | { kind: "feature"; seconds: number; props: FeatureProps }
  | { kind: "comparison"; seconds: number; props: ComparisonTwoUpProps }
  | { kind: "dispatch"; seconds: number; props: CtaDispatchProps };

/**
 * Motion treatment per archetype — David's ratified picks (2026-07-04, the
 * page defaults on /w12-review/motion; recorded in w12_picks.json).
 */
export const MOTION = {
  title: "frame-draw",
  statement: "line-fade",
  feature: "stagger",
  comparison: "divider-first",
  dispatch: "stagger",
} as const;

export const BEATS: Beat[] = [
  // VO 0:00–0:12 — "Most people use ChatGPT like a search box… barely
  // scratches the surface of what these tools can do."
  {
    kind: "title",
    seconds: 11.97,
    props: {
      kicker: "GWTH.ai",
      lines: ["Stop watching", "AI change", "the world. *Build.*"],
      facts: "UK applied AI · 5 hours a week · 3 months",
      surface: "teal",
      motionVariant: MOTION.title,
    },
  },
  // VO 0:12–0:20 — "GWTH is an applied AI course for UK adults, built to take
  // you from that first prompt to serious useful work."
  {
    kind: "statement",
    seconds: 8.5,
    props: {
      kicker: "What it is",
      statement: "A three month applied AI course for UK adults, in *plain English*.",
      surface: "paper",
      motionVariant: MOTION.statement,
    },
  },
  // VO 0:20–0:36 — "It runs for three months… no coding needed to begin.
  // Building comes later, and by the end it is the spine of the course."
  {
    kind: "feature",
    seconds: 15.38,
    props: {
      kicker: "How it runs",
      title: "From first prompt to *serious, useful work*.",
      points: [
        { heading: "Three months, in monthly parts", body: "About five hours a week." },
        { heading: "Starts in plain English", body: "No jargon, and no coding needed to begin." },
        { heading: "Building comes later", body: "By the end it is the spine of the course." },
      ],
      surface: "paper",
      motionVariant: MOTION.feature,
    },
  },
  // VO 0:36–0:48 — "You do not sit through theory… make sense of your own data."
  {
    kind: "feature",
    seconds: 11.65,
    props: {
      kicker: "What you do",
      title: "Real things, *not theory*.",
      points: [
        { heading: "Build apps", body: "Small tools that do a real job." },
        { heading: "Automate workflows", body: "Hand the repetitive work to AI." },
        { heading: "Research and analyse", body: "Answers in minutes, your own data made clear." },
      ],
      surface: "paper",
      motionVariant: MOTION.feature,
    },
  },
  // VO 0:48–1:00 — "Every lesson leaves real work behind… the credential is
  // verifiable, and it stays current."
  {
    kind: "comparison",
    seconds: 12.46,
    props: {
      kicker: "Why it is different",
      title: "Proof, *not promises*.",
      leftTitle: "Most courses",
      leftItems: ["Slides to watch", "A certificate that ages", "Nothing you can show"],
      rightTitle: "GWTH",
      rightItems: ["Projects you build", "A trail of real work", "Evidence someone can inspect"],
      highlightSide: "right",
      surface: "paper",
      motionVariant: MOTION.comparison,
    },
  },
  // VO 1:00–1:07 — "We are independent. No sponsors, no vendor deals, just
  // what works."
  {
    kind: "statement",
    seconds: 6.64,
    props: {
      kicker: "Independent",
      statement: "No sponsors. No vendor deals. *Just what works*.",
      surface: "paper",
      motionVariant: MOTION.statement,
    },
  },
  // VO 1:07–1:19 — "You can start free, with real labs and no card… £29 a
  // month… stop whenever you like."
  {
    kind: "dispatch",
    seconds: 12.49,
    props: {
      kicker: "Join the beta",
      title: "Start free. *Join when the work is worth it*.",
      entries: [
        { value: "£0", label: "Free labs, no card" },
        { value: "£29/mo", label: "Course access, stop any time" },
        { value: "£7.50/mo", label: "Stay current after" },
      ],
      buttonLabel: "Try a free lab",
      url: "gwth.ai",
      surface: "tealDeep",
      motionVariant: MOTION.dispatch,
    },
  },
  // VO 1:19–1:27 — "Here is the promise the whole course rests on. If you can
  // describe what you want, you can begin to build it."
  {
    kind: "statement",
    seconds: 7.68,
    props: {
      kicker: "The promise",
      statement: "If you can describe what you want, *you can begin to build it*.",
      attribution: "Lesson M1 L01 · Welcome to GWTH",
      surface: "paper",
      motionVariant: MOTION.statement,
    },
  },
  // VO 1:27–1:33 — "If that sounds like you, come and take a look at
  // gwth.ai." Holds ~2.7s after the last word.
  {
    kind: "title",
    seconds: 8.83,
    props: {
      kicker: "If that sounds like you",
      lines: ["Come and take", "a look at *gwth.ai*"],
      facts: "Start free · No card · Stop any time",
      surface: "teal",
      motionVariant: MOTION.title,
    },
  },
];

/** Total explainer length in frames, derived from the beats. */
export const TOTAL_FRAMES = BEATS.reduce((sum, b) => sum + Math.round(b.seconds * FPS), 0);
