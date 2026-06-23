import React from "react";
import { AbsoluteFill } from "remotion";
import { FDE, SURFACES, SurfaceName, TYPE, PAGE_PADDING } from "../theme/fde-theme";
import { FONT_FAMILY } from "../theme/fonts";

/**
 * Full-bleed surface for one slide. Sets the FDE background for the chosen
 * treatment and centres a single page measure. Square corners, no shadow, no
 * grid — the register is flat paper or a drenched band.
 */
export const Frame: React.FC<{
  surface: SurfaceName;
  children: React.ReactNode;
  /** Vertical alignment of the page measure. */
  align?: "center" | "flex-start";
}> = ({ surface, children, align = "center" }) => {
  const s = SURFACES[surface];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: s.bg,
        fontFamily: FONT_FAMILY.serif,
        display: "flex",
        flexDirection: "column",
        justifyContent: align,
        padding: `0 ${PAGE_PADDING}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Mono metadata label (DESIGN_FDE §3). Uppercase, tracked, small. Functional
 * only — never decorative slide numbers or dates (the no-clutter rule).
 */
export const Mono: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <span
    style={{
      fontFamily: FONT_FAMILY.mono,
      fontSize: TYPE.size.mono,
      fontWeight: TYPE.weight.medium,
      letterSpacing: TYPE.trackingMono,
      textTransform: "uppercase",
      color: color ?? FDE.muted,
      ...style,
    }}
  >
    {children}
  </span>
);

/**
 * Renders a display string with `*emphasis*` markup converted to the register's
 * signature italic-`em` accent (weight 500, ochre on paper / ochre-bright on
 * teal). At most one emphasis per heading — authored in the copy, not forced.
 *
 * Example: `<EmText text="Learn to *build*." accent={s.accent} />`
 */
export const EmText: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em
            key={i}
            style={{ fontStyle: "italic", fontWeight: TYPE.weight.medium, color: accent }}
          >
            {part.slice(1, -1)}
          </em>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};
