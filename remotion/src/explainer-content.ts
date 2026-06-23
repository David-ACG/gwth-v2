/**
 * Content + timing for the GWTH.ai homepage explainer.
 *
 * This is the ONLY place the explainer's copy and beat lengths live. Editing a
 * line here (or a `seconds` value) re-times the cut without touching any slide
 * component — the slides are pure templates driven entirely by these props.
 *
 * Copy is transcribed from the live FDE homepage (`home-fde.tsx`) and the
 * approved script (`SCRIPT.md`). British English, no em dashes. `*word*` marks
 * the single ochre italic-em accent per heading.
 *
 * @see SCRIPT.md — the human-readable script and voiceover David approves.
 */
import type {
  TitleCoverProps,
  SingleStatementProps,
  FeatureProps,
  ComparisonTwoUpProps,
  CtaDispatchProps,
} from "./slides";

/** 30fps timing for each beat, matching SCRIPT.md. */
export const FPS = 30;

export type Beat =
  | { kind: "title"; seconds: number; props: TitleCoverProps }
  | { kind: "statement"; seconds: number; props: SingleStatementProps }
  | { kind: "feature"; seconds: number; props: FeatureProps }
  | { kind: "comparison"; seconds: number; props: ComparisonTwoUpProps }
  | { kind: "dispatch"; seconds: number; props: CtaDispatchProps };

/**
 * Default motion treatment per archetype. These are SENSIBLE DEFAULTS — the
 * open choice in step 2a. David previews the alternatives in the "MotionOptions"
 * compositions and sets his pick here in one place.
 */
export const MOTION = {
  title: "frame-draw",
  statement: "line-fade",
  feature: "stagger",
  comparison: "divider-first",
  dispatch: "stagger",
} as const;

export const BEATS: Beat[] = [
  {
    kind: "title",
    seconds: 7.6,
    props: {
      kicker: "GWTH.ai",
      lines: ["Stop watching", "AI change", "the world. *Build.*"],
      facts: "UK applied AI · 5 hours a week · 3 months",
      surface: "teal",
      motionVariant: MOTION.title,
    },
  },
  {
    kind: "statement",
    seconds: 10.6,
    props: {
      kicker: "What it is",
      statement: "A three month applied AI course for UK adults, in *plain English*.",
      surface: "paper",
      motionVariant: MOTION.statement,
    },
  },
  {
    kind: "feature",
    seconds: 14.4,
    props: {
      kicker: "What you do",
      title: "Real things, *not theory*.",
      lead: "About five hours a week, in plain language.",
      points: [
        { heading: "Build apps", body: "Small tools that do a real job." },
        { heading: "Automate workflows", body: "Hand the repetitive work to AI." },
        { heading: "Research and analyse", body: "Answers in minutes, your own data made clear." },
      ],
      surface: "paper",
      motionVariant: MOTION.feature,
    },
  },
  {
    kind: "comparison",
    seconds: 11.9,
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
  {
    kind: "statement",
    seconds: 8.5,
    props: {
      kicker: "The promise",
      statement: "If you can describe what you want, *you can begin to build it*.",
      attribution: "Lesson M1 L01 · Welcome to GWTH",
      surface: "paper",
      motionVariant: MOTION.statement,
    },
  },
  {
    kind: "dispatch",
    seconds: 12.0,
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
];

/** Total explainer length in frames, derived from the beats. */
export const TOTAL_FRAMES = BEATS.reduce((sum, b) => sum + Math.round(b.seconds * FPS), 0);
