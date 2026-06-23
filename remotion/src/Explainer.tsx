import React from "react";
import { AbsoluteFill, Series, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import {
  TitleCover,
  SingleStatement,
  Feature,
  ComparisonTwoUp,
  CtaDispatch,
} from "./slides";
import { Beat, BEATS, FPS } from "./explainer-content";
import { FDE } from "./theme/fde-theme";
import "./theme/fonts";

/** Renders one beat to its matching FDE slide template. */
const renderBeat = (beat: Beat): React.ReactNode => {
  switch (beat.kind) {
    case "title":
      return <TitleCover {...beat.props} />;
    case "statement":
      return <SingleStatement {...beat.props} />;
    case "feature":
      return <Feature {...beat.props} />;
    case "comparison":
      return <ComparisonTwoUp {...beat.props} />;
    case "dispatch":
      return <CtaDispatch {...beat.props} />;
  }
};

/**
 * A short cross-dissolve at the very start and end of each beat so cuts land on
 * a motion peak rather than a hard static jump (the kept "cut on the curve"
 * convention), while staying calm enough for the journal register.
 */
const BeatWrap: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const fade = 6;
  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export interface ExplainerProps {
  /**
   * Optional voiceover file in `public/` (e.g. "audio/vo-david.wav"). When set,
   * the slide timeline plays under David's approved voice. Left empty for the
   * silent draft so timing can be reviewed before the final VO exists.
   */
  audioSrc?: string;
}

/**
 * The composed homepage explainer: the five FDE slide templates sequenced to
 * the approved script beats. Slides are pure templates; all copy and timing
 * come from `explainer-content.ts`.
 */
export const Explainer: React.FC<ExplainerProps> = ({ audioSrc }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: FDE.bg }}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      <Series>
        {BEATS.map((beat, i) => {
          const durationInFrames = Math.round(beat.seconds * FPS);
          return (
            <Series.Sequence key={i} durationInFrames={durationInFrames}>
              <BeatWrap durationInFrames={durationInFrames}>{renderBeat(beat)}</BeatWrap>
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};

export default Explainer;
