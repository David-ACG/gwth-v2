import React from "react";
import { useCurrentFrame } from "remotion";
import { SURFACES, SurfaceName, TYPE } from "../theme/fde-theme";
import { Frame, Mono, EmText } from "../components/primitives";
import { fadeUp, fadeIn, hairlineDraw, TIMING } from "../motion/presets";

/** Motion treatments offered for the feature archetype (David picks — 2a). */
export type FeatureMotion = "stagger" | "rule-rows" | "settle";

export interface FeaturePoint {
  /** Short serif heading for the point. */
  heading: string;
  /** Optional one-line body under the heading. */
  body?: string;
}

export interface FeatureProps {
  /** Mono section kicker (the category). */
  kicker?: string;
  /** Section title; use `*word*` for the ochre italic-em accent. */
  title: string;
  /** Optional standfirst under the title. */
  lead?: string;
  /** Feature points, rendered as hairline-separated rows. */
  points: FeaturePoint[];
  /** Visual treatment. Feature is a paper beat in the mixed treatment. */
  surface?: SurfaceName;
  /** Entrance motion (David's choice). */
  motionVariant?: FeatureMotion;
}

/**
 * FEATURE slide — a section head (title + mono kicker, closed by an ink rule)
 * over a list of hairline-separated feature rows (DESIGN_FDE §5.2, §4.8). The
 * register's substitute for an icon grid: serif headings + hairlines, no icons,
 * no cards-with-shadows. Handles 2–5 points; rows wrap gracefully.
 */
export const Feature: React.FC<FeatureProps> = ({
  kicker,
  title,
  lead,
  points,
  surface = "paper",
  motionVariant = "stagger",
}) => {
  const frame = useCurrentFrame();
  const s = SURFACES[surface];

  const rowDelay = (i: number) => TIMING.slow + i * 12;

  return (
    <Frame surface={surface} align="center">
      <div style={{ maxWidth: 1500, width: "100%" }}>
        {/* Section head */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 48,
            paddingBottom: 28,
            ...fadeUp(frame, 0, TIMING.slow, 18),
          }}
        >
          <h2
            style={{
              margin: 0,
              color: s.ink,
              fontSize: TYPE.size.title,
              fontWeight: TYPE.weight.display,
              lineHeight: 1.08,
              letterSpacing: TYPE.trackingDisplay,
              maxWidth: 1100,
            }}
          >
            <EmText text={title} accent={s.accent} />
          </h2>
          {kicker && <Mono color={s.mono}>{kicker}</Mono>}
        </div>
        <div
          style={{
            height: 1,
            backgroundColor: s.ink,
            ...hairlineDraw(frame, TIMING.fast, TIMING.slow),
          }}
        />

        {lead && (
          <p
            style={{
              margin: "32px 0 0",
              maxWidth: 1080,
              color: s.soft,
              fontSize: TYPE.size.lead,
              lineHeight: TYPE.lineHeight.lead,
              ...fadeUp(frame, TIMING.normal, TIMING.slow, 16),
            }}
          >
            {lead}
          </p>
        )}

        {/* Feature rows */}
        <div style={{ marginTop: 56 }}>
          {points.map((point, i) => {
            const rowMotion: React.CSSProperties =
              motionVariant === "settle"
                ? { opacity: fadeIn(frame, rowDelay(i), TIMING.verySlow) }
                : fadeUp(frame, rowDelay(i), TIMING.slow, 22);
            return (
              <div key={i}>
                <div
                  style={{
                    height: 1,
                    backgroundColor: s.line,
                    ...(motionVariant === "rule-rows"
                      ? hairlineDraw(frame, rowDelay(i) - TIMING.fast, TIMING.normal)
                      : {}),
                  }}
                />
                <div style={{ padding: "30px 0", ...rowMotion }}>
                  <h3
                    style={{
                      margin: 0,
                      color: s.ink,
                      fontSize: TYPE.size.heading,
                      fontWeight: TYPE.weight.display,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {point.heading}
                  </h3>
                  {point.body && (
                    <p
                      style={{
                        margin: "12px 0 0",
                        maxWidth: 1200,
                        color: s.soft,
                        fontSize: TYPE.size.body,
                        lineHeight: TYPE.lineHeight.body,
                      }}
                    >
                      {point.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
};

export default Feature;
