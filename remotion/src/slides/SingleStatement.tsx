import React from "react";
import { useCurrentFrame } from "remotion";
import { SURFACES, SurfaceName, TYPE } from "../theme/fde-theme";
import { Frame, Mono, EmText } from "../components/primitives";
import { fadeUp, fadeIn, maskWipeUp, underlineGrow, TIMING } from "../motion/presets";

/** Motion treatments offered for the single-statement archetype (David picks — 2a). */
export type StatementMotion = "line-fade" | "underline" | "crossfade";

export interface SingleStatementProps {
  /** Optional mono kicker (a functional label, e.g. "THE PROMISE"). */
  kicker?: string;
  /** The statement; use `*phrase*` for the ochre italic-em accent. */
  statement: string;
  /** Optional mono attribution / source line under the statement. */
  attribution?: string;
  /** Visual treatment. Statement is a paper beat in the mixed treatment. */
  surface?: SurfaceName;
  /** Entrance motion (David's choice). */
  motionVariant?: StatementMotion;
}

/**
 * SINGLE-STATEMENT slide — one large serif sentence on paper, the register's
 * pull-quote energy without the quote marks. One ochre italic-em accent carries
 * the emphasis. Long statements wrap within a generous measure and stay legible.
 */
export const SingleStatement: React.FC<SingleStatementProps> = ({
  kicker,
  statement,
  attribution,
  surface = "paper",
  motionVariant = "line-fade",
}) => {
  const frame = useCurrentFrame();
  const s = SURFACES[surface];

  const statementMotion: React.CSSProperties =
    motionVariant === "crossfade"
      ? { opacity: fadeIn(frame, TIMING.normal, TIMING.verySlow) }
      : motionVariant === "underline"
        ? { opacity: fadeIn(frame, TIMING.fast, TIMING.slow) }
        : fadeUp(frame, TIMING.fast, TIMING.slow, 24); // line-fade default

  return (
    <Frame surface={surface} align="center">
      <div style={{ maxWidth: 1440 }}>
        {kicker && (
          <div style={{ marginBottom: 40, ...fadeUp(frame, 0, TIMING.normal, 14) }}>
            <Mono color={s.mono}>{kicker}</Mono>
          </div>
        )}

        <p
          style={{
            margin: 0,
            color: s.ink,
            fontSize: TYPE.size.statement,
            fontWeight: TYPE.weight.display,
            lineHeight: TYPE.lineHeight.display,
            letterSpacing: TYPE.trackingDisplay,
            textWrap: "balance",
            ...(motionVariant === "crossfade" ? maskWipeUp(frame, TIMING.normal, TIMING.verySlow) : {}),
            ...statementMotion,
            position: "relative",
          }}
        >
          <EmText text={statement} accent={s.accent} />
          {motionVariant === "underline" && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                bottom: -18,
                height: 4,
                width: underlineGrow(frame, TIMING.slow, TIMING.slow),
                backgroundColor: s.accent,
              }}
            />
          )}
        </p>

        {attribution && (
          <div style={{ marginTop: 56, opacity: fadeIn(frame, TIMING.verySlow) }}>
            <Mono color={s.mono}>{attribution}</Mono>
          </div>
        )}
      </div>
    </Frame>
  );
};

export default SingleStatement;
