import React from "react";
import {
  Composition,
  AbsoluteFill,
  Series,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Explainer } from "./Explainer";
import { TOTAL_FRAMES } from "./explainer-content";
import {
  TitleCover,
  SingleStatement,
  Feature,
  ComparisonTwoUp,
  CtaDispatch,
  TitleMotion,
  StatementMotion,
  FeatureMotion,
  ComparisonMotion,
  DispatchMotion,
} from "./slides";
import { VIDEO } from "./theme/fde-theme";
import { FONT_FAMILY } from "./theme/fonts";
import { FDE, TYPE } from "./theme/fde-theme";
import "./theme/fonts";

const { width, height, fps } = VIDEO;
/** Each motion option plays this long in a comparison reel (2.5s at 30fps). */
const OPTION_FRAMES = 75;

/**
 * A small mono caption pinned bottom-left, identifying which motion option is
 * playing. Used only in the review reels (step 2a) so David can name his pick;
 * the final Explainer carries no such overlay (the no-clutter rule).
 */
const OptionCaption: React.FC<{ label: string; onDark: boolean }> = ({ label, onDark }) => (
  <div style={{ position: "absolute", left: 56, bottom: 48 }}>
    <span
      style={{
        fontFamily: FONT_FAMILY.mono,
        fontSize: 22,
        letterSpacing: TYPE.trackingMono,
        textTransform: "uppercase",
        color: onDark ? FDE.creamMuted : FDE.muted,
      }}
    >
      {label}
    </span>
  </div>
);

/**
 * Plays a list of motion variants back to back, each with a caption, so a single
 * rendered clip lets David compare the options for one archetype and pick.
 */
function VariantReel<T extends string>({
  variants,
  onDark,
  render,
}: {
  variants: { variant: T; label: string }[];
  onDark: boolean;
  render: (variant: T) => React.ReactNode;
}) {
  return (
    <Series>
      {variants.map(({ variant, label }) => (
        <Series.Sequence key={variant} durationInFrames={OPTION_FRAMES}>
          <ReelFade>{render(variant)}</ReelFade>
          <OptionCaption label={label} onDark={onDark} />
        </Series.Sequence>
      ))}
    </Series>
  );
}

/** Brief fade in/out around each option so the reel reads as distinct takes. */
const ReelFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, OPTION_FRAMES - 5, OPTION_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const titleVariants: { variant: TitleMotion; label: string }[] = [
  { variant: "frame-draw", label: "Option A · frame-draw" },
  { variant: "mask-wipe", label: "Option B · mask-wipe" },
  { variant: "settle", label: "Option C · settle" },
];
const statementVariants: { variant: StatementMotion; label: string }[] = [
  { variant: "line-fade", label: "Option A · line-fade" },
  { variant: "underline", label: "Option B · underline-draw" },
  { variant: "crossfade", label: "Option C · crossfade" },
];
const featureVariants: { variant: FeatureMotion; label: string }[] = [
  { variant: "stagger", label: "Option A · stagger" },
  { variant: "rule-rows", label: "Option B · rule-rows" },
  { variant: "settle", label: "Option C · settle" },
];
const comparisonVariants: { variant: ComparisonMotion; label: string }[] = [
  { variant: "divider-first", label: "Option A · divider-first" },
  { variant: "slide-in", label: "Option B · slide-in" },
  { variant: "sequential", label: "Option C · sequential" },
];
const dispatchVariants: { variant: DispatchMotion; label: string }[] = [
  { variant: "stagger", label: "Option A · stagger" },
  { variant: "button-draw", label: "Option B · button-draw" },
  { variant: "settle", label: "Option C · settle" },
];

/** Sample copy for the review reels (mirrors the real beats). */
const SAMPLE = {
  title: {
    kicker: "GWTH.ai",
    lines: ["Stop watching", "AI change", "the world. *Build.*"],
    facts: "UK applied AI · 5 hours a week · 3 months",
  },
  statement: {
    kicker: "The promise",
    statement: "If you can describe what you want, *you can begin to build it*.",
    attribution: "Lesson M1 L01 · Welcome to GWTH",
  },
  feature: {
    kicker: "What you do",
    title: "Real things, *not theory*.",
    lead: "About five hours a week, in plain language.",
    points: [
      { heading: "Build apps", body: "Small tools that do a real job." },
      { heading: "Automate workflows", body: "Hand the repetitive work to AI." },
      { heading: "Research and analyse", body: "Answers in minutes, your own data made clear." },
    ],
  },
  comparison: {
    kicker: "Why it is different",
    title: "Proof, *not promises*.",
    leftTitle: "Most courses",
    leftItems: ["Slides to watch", "A certificate that ages", "Nothing you can show"],
    rightTitle: "GWTH",
    rightItems: ["Projects you build", "A trail of real work", "Evidence someone can inspect"],
    highlightSide: "right" as const,
  },
  dispatch: {
    kicker: "Join the beta",
    title: "Start free. *Join when the work is worth it*.",
    entries: [
      { value: "£0", label: "Free labs, no card" },
      { value: "£29/mo", label: "Course access, stop any time" },
      { value: "£7.50/mo", label: "Stay current after" },
    ],
    buttonLabel: "Try a free lab",
    url: "gwth.ai",
  },
};

/**
 * Deliberately oversized content for the QA-FitStress composition: each list is
 * far taller than the 1080 canvas, proving the FitToFrame guard scales content
 * down instead of the old centre-clip failure. Not part of any deliverable.
 */
const STRESS = {
  feature: {
    kicker: "QA · fit stress",
    title: "Six points with long wrapping bodies, *deliberately oversized*.",
    lead: "Without the FitToFrame guard this slide clips off the top and bottom edges; with it, everything scales to fit the canvas.",
    points: [
      { heading: "Build small applications end to end", body: "A long body line that wraps across the measure and pushes the row height up considerably, simulating a verbose author writing far more than the design anticipated for one row." },
      { heading: "Automate the workflows that eat your week", body: "Another long wrapping body with plenty of text so the row takes several lines at body size, adding to the accumulated vertical overflow across the slide." },
      { heading: "Research in minutes, not hours", body: "Yet another long body designed to wrap over multiple lines and contribute to the total height so content dramatically exceeds the canvas." },
      { heading: "Make sense of your own data", body: "Still more wrapping body text to guarantee we blow past the available pixel budget by a wide margin on this stress slide." },
      { heading: "Ship a portfolio of real artefacts", body: "More long text to be sure the overflow is comfortably in the failing range that the template audit identified." },
      { heading: "Stay current after the course ends", body: "Final row with a long body, completing the six-row stress case that previously would have clipped on both edges." },
    ],
  },
  comparison: {
    kicker: "QA · fit stress",
    title: "Seven items a side, *all wrapping*.",
    leftTitle: "Most courses",
    leftItems: [
      "Hours of pre-recorded slide decks that you watch passively without ever producing anything you could show to another person",
      "A one-shot certificate PDF that ages from the day it is issued and proves nothing about current ability",
      "Quizzes about terminology rather than practical work with the tools professionals actually use",
      "No feedback loop of any kind once the cohort ends and the community channel goes quiet",
      "Content frozen at recording time while the tools change underneath it every quarter",
      "A curriculum built around what is easy to film rather than what learners need to do",
      "Marketing promises about outcomes with no artefact anywhere to back them up",
    ],
    rightTitle: "GWTH",
    rightItems: [
      "Real projects built week by week that accumulate into a portfolio someone else can actually inspect",
      "A verifiable credential that stays current because it decays when you stop refreshing updated lessons",
      "Practical work with the same tools professionals use, assessed by what you produce",
      "A visible progress trail that updates as your skill changes rather than a static certificate",
      "Lessons refreshed against the live tool landscape with refresh work tracked openly",
      "A curriculum built backwards from real applied capability at every level",
      "Every claim on the site sits next to the artefact that proves it",
    ],
    highlightSide: "right" as const,
  },
  dispatch: {
    kicker: "QA · fit stress",
    title: "Five pricing entries with long labels, *deliberately oversized*.",
    entries: [
      { value: "£0", label: "Free labs and sample lessons with no card required and no time limit on how long you take" },
      { value: "£29/mo", label: "Course access billed one course month at a time with the freedom to stop after any month" },
      { value: "£7.50/mo", label: "Optional Stay Current access after the course ends so the credential keeps its freshness" },
      { value: "£39", label: "A hypothetical future price point used purely to stress the grid with a fourth column" },
      { value: "£49", label: "A second hypothetical future price point used purely to stress the grid with a fifth column" },
    ],
    buttonLabel: "Try a free lab",
    url: "gwth.ai",
  },
};

/**
 * Remotion root. Registers:
 *  - `Explainer` — the composed homepage explainer (the deliverable).
 *  - `MotionOptions-*` — one reel per archetype for David's step-2a pick.
 *  - `Slide-*` — each template alone, default motion (a library contact sheet).
 *  - `QA-FitStress` — the three unbounded-content templates fed oversized
 *    content, proving the FitToFrame long-text guard (render stills to check).
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={TOTAL_FRAMES}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{ audioSrc: "audio/vo-david-draft.wav" }}
      />

      {/* ---- Step 2a: motion-option reels (David picks one per archetype) ---- */}
      <Composition
        id="MotionOptions-Title"
        component={() => (
          <VariantReel
            variants={titleVariants}
            onDark
            render={(v) => <TitleCover {...SAMPLE.title} surface="teal" motionVariant={v} />}
          />
        )}
        durationInFrames={OPTION_FRAMES * titleVariants.length}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="MotionOptions-Statement"
        component={() => (
          <VariantReel
            variants={statementVariants}
            onDark={false}
            render={(v) => <SingleStatement {...SAMPLE.statement} surface="paper" motionVariant={v} />}
          />
        )}
        durationInFrames={OPTION_FRAMES * statementVariants.length}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="MotionOptions-Feature"
        component={() => (
          <VariantReel
            variants={featureVariants}
            onDark={false}
            render={(v) => <Feature {...SAMPLE.feature} surface="paper" motionVariant={v} />}
          />
        )}
        durationInFrames={OPTION_FRAMES * featureVariants.length}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="MotionOptions-Comparison"
        component={() => (
          <VariantReel
            variants={comparisonVariants}
            onDark={false}
            render={(v) => <ComparisonTwoUp {...SAMPLE.comparison} surface="paper" motionVariant={v} />}
          />
        )}
        durationInFrames={OPTION_FRAMES * comparisonVariants.length}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="MotionOptions-Dispatch"
        component={() => (
          <VariantReel
            variants={dispatchVariants}
            onDark
            render={(v) => <CtaDispatch {...SAMPLE.dispatch} surface="tealDeep" motionVariant={v} />}
          />
        )}
        durationInFrames={OPTION_FRAMES * dispatchVariants.length}
        fps={fps}
        width={width}
        height={height}
      />

      {/* ---- Library contact sheet: each template alone, default motion ---- */}
      <Composition
        id="Slide-TitleCover"
        component={() => <TitleCover {...SAMPLE.title} surface="teal" motionVariant="frame-draw" />}
        durationInFrames={OPTION_FRAMES}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Slide-SingleStatement"
        component={() => <SingleStatement {...SAMPLE.statement} surface="paper" motionVariant="line-fade" />}
        durationInFrames={OPTION_FRAMES}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Slide-Feature"
        component={() => <Feature {...SAMPLE.feature} surface="paper" motionVariant="stagger" />}
        durationInFrames={OPTION_FRAMES}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Slide-ComparisonTwoUp"
        component={() => <ComparisonTwoUp {...SAMPLE.comparison} surface="paper" motionVariant="divider-first" />}
        durationInFrames={OPTION_FRAMES}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Slide-CtaDispatch"
        component={() => <CtaDispatch {...SAMPLE.dispatch} surface="tealDeep" motionVariant="stagger" />}
        durationInFrames={OPTION_FRAMES}
        fps={fps}
        width={width}
        height={height}
      />

      {/* ---- QA: long-text guard proof (not a deliverable) ---- */}
      <Composition
        id="QA-FitStress"
        component={() => (
          <Series>
            <Series.Sequence durationInFrames={OPTION_FRAMES}>
              <Feature {...STRESS.feature} surface="paper" motionVariant="stagger" />
            </Series.Sequence>
            <Series.Sequence durationInFrames={OPTION_FRAMES}>
              <ComparisonTwoUp {...STRESS.comparison} surface="paper" motionVariant="divider-first" />
            </Series.Sequence>
            <Series.Sequence durationInFrames={OPTION_FRAMES}>
              <CtaDispatch {...STRESS.dispatch} surface="tealDeep" motionVariant="stagger" />
            </Series.Sequence>
          </Series>
        )}
        durationInFrames={OPTION_FRAMES * 3}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
