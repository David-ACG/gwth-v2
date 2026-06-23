import React from "react";
import { useCurrentFrame } from "remotion";
import { SURFACES, SurfaceName, TYPE } from "../theme/fde-theme";
import { Frame, Mono, EmText } from "../components/primitives";
import { fadeUp, fadeIn, ruleDrawDown, TIMING } from "../motion/presets";

/** Motion treatments offered for the comparison archetype (David picks — 2a). */
export type ComparisonMotion = "divider-first" | "slide-in" | "sequential";

export interface ComparisonTwoUpProps {
  /** Optional mono section kicker. */
  kicker?: string;
  /** Optional title above the two columns; `*word*` for italic-em accent. */
  title?: string;
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  /** Which side is the favoured / forward column (ink) vs the muted one. */
  highlightSide?: "left" | "right";
  /** Visual treatment. Comparison is a paper beat in the mixed treatment. */
  surface?: SurfaceName;
  /** Entrance motion (David's choice). */
  motionVariant?: ComparisonMotion;
}

/**
 * COMPARISON / TWO-UP slide — two columns split by a hairline that draws down
 * (DESIGN_FDE §4.8). No neon ticks/crosses: the favoured column is rendered in
 * ink with an ochre marker, the other in muted soft. Lists wrap within columns.
 */
export const ComparisonTwoUp: React.FC<ComparisonTwoUpProps> = ({
  kicker,
  title,
  leftTitle,
  rightTitle,
  leftItems,
  rightItems,
  highlightSide = "right",
  surface = "paper",
  motionVariant = "divider-first",
}) => {
  const frame = useCurrentFrame();
  const s = SURFACES[surface];

  const column = (
    side: "left" | "right",
    colTitle: string,
    items: string[],
    baseDelay: number
  ) => {
    const favoured = highlightSide === side;
    const slide =
      motionVariant === "slide-in"
        ? { transform: `translateX(${(side === "left" ? -1 : 1) * (1 - fadeIn(frame, baseDelay, TIMING.slow)) * 36}px)` }
        : {};
    return (
      <div style={{ flex: 1, opacity: fadeIn(frame, baseDelay, TIMING.slow), ...slide }}>
        <h3
          style={{
            margin: "0 0 28px",
            color: favoured ? s.ink : s.soft,
            fontSize: TYPE.size.heading,
            fontWeight: TYPE.weight.display,
            letterSpacing: "-0.01em",
          }}
        >
          {colTitle}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {items.map((item, i) => {
            const d = baseDelay + TIMING.normal + i * 8;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 18,
                  alignItems: "baseline",
                  ...fadeUp(frame, d, TIMING.normal, 14),
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 14,
                    color: favoured ? s.accent : s.mono,
                    fontFamily: TYPE.mono,
                    fontSize: TYPE.size.body,
                    lineHeight: 1.4,
                  }}
                >
                  {favoured ? "+" : "·"}
                </span>
                <p
                  style={{
                    margin: 0,
                    color: favoured ? s.ink : s.soft,
                    fontSize: TYPE.size.body,
                    lineHeight: TYPE.lineHeight.body,
                  }}
                >
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const leftDelay = motionVariant === "sequential" ? TIMING.slow : TIMING.normal;
  const rightDelay =
    motionVariant === "sequential" ? TIMING.slow + 24 : TIMING.normal + (motionVariant === "slide-in" ? 6 : 0);

  return (
    <Frame surface={surface} align="center">
      <div style={{ maxWidth: 1520, width: "100%" }}>
        {(kicker || title) && (
          <div style={{ marginBottom: 44, ...fadeUp(frame, 0, TIMING.slow, 16) }}>
            {kicker && (
              <div style={{ marginBottom: 18 }}>
                <Mono color={s.mono}>{kicker}</Mono>
              </div>
            )}
            {title && (
              <h2
                style={{
                  margin: 0,
                  color: s.ink,
                  fontSize: TYPE.size.title,
                  fontWeight: TYPE.weight.display,
                  lineHeight: 1.08,
                  letterSpacing: TYPE.trackingDisplay,
                }}
              >
                <EmText text={title} accent={s.accent} />
              </h2>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 80, alignItems: "stretch" }}>
          {column("left", leftTitle, leftItems, leftDelay)}
          {/* Hairline divider draws down */}
          <div
            style={{
              width: 1,
              alignSelf: "stretch",
              backgroundColor: s.line,
              ...(motionVariant === "divider-first"
                ? ruleDrawDown(frame, TIMING.fast, TIMING.slow)
                : {}),
            }}
          />
          {column("right", rightTitle, rightItems, rightDelay)}
        </div>
      </div>
    </Frame>
  );
};

export default ComparisonTwoUp;
