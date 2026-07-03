import React from "react";
import { useCurrentFrame } from "remotion";
import { SURFACES, SurfaceName, TYPE } from "../theme/fde-theme";
import { FitToFrame, Frame, Mono, EmText } from "../components/primitives";
import { fadeUp, fadeIn, hairlineDraw, TIMING } from "../motion/presets";

/** Motion treatments offered for the CTA/dispatch archetype (David picks — 2a). */
export type DispatchMotion = "stagger" | "button-draw" | "settle";

export interface DispatchEntry {
  /** Bold serif value (e.g. a price, a date, a number). */
  value: string;
  /** Small description under the value. */
  label: string;
}

export interface CtaDispatchProps {
  /** Mono kicker (e.g. "GET STARTED"). */
  kicker?: string;
  /** Dispatch title; use `*word*` for the italic-em accent. */
  title: string;
  /** Optional row of dispatch entries (price / commitment / cohort). */
  entries?: DispatchEntry[];
  /** Primary button label, authored in sentence case. */
  buttonLabel: string;
  /** The URL / call shown in mono beneath the button. */
  url?: string;
  /** Visual treatment. CTA is a deep-teal band in the mixed treatment. */
  surface?: SurfaceName;
  /** Entrance motion (David's choice). */
  motionVariant?: DispatchMotion;
}

/**
 * CTA / DISPATCH slide — the closing deep-teal band where commitment lives
 * (DESIGN_FDE §4.7). Mono kicker, serif title with ochre-bright em, an optional
 * hairline-bounded row of dispatch entries, and one solid square button (the
 * register's cream chip on teal). Button label authored sentence-case.
 */
export const CtaDispatch: React.FC<CtaDispatchProps> = ({
  kicker,
  title,
  entries,
  buttonLabel,
  url,
  surface = "tealDeep",
  motionVariant = "stagger",
}) => {
  const frame = useCurrentFrame();
  const s = SURFACES[surface];

  const buttonDelay = TIMING.slow + (entries?.length ?? 0) * 10;

  return (
    <Frame surface={surface} align="center">
      <FitToFrame style={{ maxWidth: 1400, width: "100%" }}>
        {kicker && (
          <div style={{ marginBottom: 34, ...fadeUp(frame, 0, TIMING.normal, 14) }}>
            <Mono color={s.mono}>{kicker}</Mono>
          </div>
        )}

        <h2
          style={{
            margin: 0,
            color: s.ink,
            fontSize: TYPE.size.dispatch,
            fontWeight: TYPE.weight.display,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            maxWidth: 1240,
            ...fadeUp(frame, TIMING.fast, TIMING.slow, 22),
          }}
        >
          <EmText text={title} accent={s.accent} />
        </h2>

        {entries && entries.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div
              style={{
                height: 1,
                backgroundColor: s.line,
                marginBottom: 36,
                ...hairlineDraw(frame, TIMING.normal, TIMING.slow),
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))`,
                gap: 56,
              }}
            >
              {entries.map((entry, i) => {
                const d = TIMING.slow + i * 10;
                const m =
                  motionVariant === "settle"
                    ? { opacity: fadeIn(frame, d, TIMING.verySlow) }
                    : fadeUp(frame, d, TIMING.normal, 16);
                return (
                  <div key={i} style={{ ...m }}>
                    <div
                      style={{
                        color: s.ink,
                        fontSize: TYPE.size.heading,
                        fontWeight: TYPE.weight.display,
                        letterSpacing: TYPE.trackingDisplay,
                      }}
                    >
                      {entry.value}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Mono color={s.mono}>{entry.label}</Mono>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Solid square button (cream chip on teal) */}
        <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              display: "inline-block",
              overflow: "hidden",
              ...(motionVariant === "button-draw"
                ? hairlineDraw(frame, buttonDelay, TIMING.normal)
                : { opacity: fadeIn(frame, buttonDelay, TIMING.normal) }),
            }}
          >
            <div
              style={{
                backgroundColor: s.ink, // cream chip
                color: surface === "paper" ? SURFACES.paper.bg : SURFACES.tealDeep.bg,
                fontFamily: TYPE.mono,
                fontSize: TYPE.size.mono,
                fontWeight: TYPE.weight.display,
                letterSpacing: TYPE.trackingMono,
                textTransform: "uppercase",
                padding: "22px 40px",
              }}
            >
              {buttonLabel}
            </div>
          </div>
          {url && (
            <div style={{ opacity: fadeIn(frame, buttonDelay + TIMING.fast, TIMING.normal) }}>
              <Mono color={s.mono}>{url}</Mono>
            </div>
          )}
        </div>
      </FitToFrame>
    </Frame>
  );
};

export default CtaDispatch;
