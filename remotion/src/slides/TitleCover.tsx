import React from "react";
import { useCurrentFrame } from "remotion";
import { SURFACES, SurfaceName, TYPE } from "../theme/fde-theme";
import { Frame, Mono, EmText } from "../components/primitives";
import { fadeUp, fadeIn, hairlineDraw, maskWipeUp, TIMING } from "../motion/presets";

/** Motion treatments offered for the title/cover archetype (David picks — 2a). */
export type TitleMotion = "frame-draw" | "mask-wipe" | "settle";

export interface TitleCoverProps {
  /** Mono kicker above the title (functional label, not decoration). Optional. */
  kicker?: string;
  /** Stacked display lines; use `*word*` for the ochre italic-em accent. */
  lines: string[];
  /** Standfirst / lead sentence under the title. Optional. */
  standfirst?: string;
  /** Single mono facts row, fields separated by ` · ` (no commas/dashes). */
  facts?: string;
  /** Visual treatment. Title/cover is a teal beat in the mixed treatment. */
  surface?: SurfaceName;
  /** Entrance motion (David's choice). */
  motionVariant?: TitleMotion;
}

/**
 * TITLE / COVER slide — the drenched-teal opening beat.
 *
 * Stacked serif display lines with one ochre italic-em accent, an optional mono
 * kicker, standfirst, and a hairline-closed mono facts row (DESIGN_FDE §4.1).
 * All copy arrives via props; long lines wrap within the page measure.
 */
export const TitleCover: React.FC<TitleCoverProps> = ({
  kicker,
  lines,
  standfirst,
  facts,
  surface = "teal",
  motionVariant = "frame-draw",
}) => {
  const frame = useCurrentFrame();
  const s = SURFACES[surface];

  /** Per-line entrance, depending on the chosen motion treatment. */
  const lineStyle = (i: number): React.CSSProperties => {
    const delay = TIMING.normal + i * 8;
    if (motionVariant === "mask-wipe") return maskWipeUp(frame, delay, TIMING.slow);
    if (motionVariant === "settle") return { opacity: fadeIn(frame, delay, TIMING.verySlow) };
    // frame-draw: fade + small settle per line
    return fadeUp(frame, delay, TIMING.slow);
  };

  const showFrame = motionVariant === "frame-draw";

  return (
    <Frame surface={surface} align="center">
      <div style={{ maxWidth: 1380 }}>
        {showFrame && (
          <div
            style={{
              height: 1,
              backgroundColor: s.line,
              marginBottom: 56,
              ...hairlineDraw(frame, TIMING.fast, TIMING.slow),
            }}
          />
        )}

        {kicker && (
          <div style={{ marginBottom: 36, ...fadeUp(frame, TIMING.fast, TIMING.normal, 16) }}>
            <Mono color={s.mono}>{kicker}</Mono>
          </div>
        )}

        <h1
          style={{
            margin: 0,
            color: s.ink,
            fontSize: TYPE.size.hero,
            fontWeight: TYPE.weight.display,
            lineHeight: TYPE.lineHeight.display,
            letterSpacing: TYPE.trackingDisplay,
          }}
        >
          {lines.map((line, i) => (
            <span key={i} style={{ display: "block", ...lineStyle(i) }}>
              <EmText text={line} accent={s.accent} />
            </span>
          ))}
        </h1>

        {standfirst && (
          <p
            style={{
              margin: "44px 0 0",
              maxWidth: 980,
              color: s.soft,
              fontSize: TYPE.size.lead,
              fontWeight: TYPE.weight.body,
              lineHeight: TYPE.lineHeight.lead,
              ...fadeUp(frame, TIMING.slow + lines.length * 8, TIMING.slow, 20),
            }}
          >
            {standfirst}
          </p>
        )}

        {facts && (
          <div style={{ marginTop: 64 }}>
            <div
              style={{
                height: 1,
                backgroundColor: s.line,
                marginBottom: 22,
                ...hairlineDraw(frame, TIMING.verySlow, TIMING.slow),
              }}
            />
            <div style={{ opacity: fadeIn(frame, TIMING.verySlow + TIMING.fast) }}>
              <Mono color={s.mono}>{facts}</Mono>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
};

export default TitleCover;
