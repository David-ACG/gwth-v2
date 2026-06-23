/**
 * Restrained motion vocabulary for the FDE journal register.
 *
 * DESIGN_FDE §4.9: one easing for everything — cubic-bezier(0.16, 1, 0.3, 1) —
 * and the register is "nearly static". For video we extend that spirit, not the
 * lesson-video look: fades, hairline draws, and mask wipes ONLY. No glows, no
 * lifts, no scale-pops, no neon, no dot grids. Every helper here respects that.
 *
 * Frame timings follow the kept lesson-video conventions (30fps base):
 * fast 10 / normal 20 / slow 30 / verySlow 45.
 */
import { interpolate, spring, Easing } from "remotion";

/** The single FDE easing curve, as a Remotion Easing. */
export const FDE_EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const TIMING: { fast: number; normal: number; slow: number; verySlow: number } = {
  fast: 10,
  normal: 20,
  slow: 30,
  verySlow: 45,
};

/** Linear-to-eased progress over [delay, delay+duration]. */
export const eased = (frame: number, delay: number, duration: number): number =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: FDE_EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Opacity-only fade in. */
export const fadeIn = (frame: number, delay = 0, duration = TIMING.normal): number =>
  eased(frame, delay, duration);

/** Fade + a small upward settle (max 28px) — the workhorse text entrance. */
export const fadeUp = (
  frame: number,
  delay = 0,
  duration = TIMING.slow,
  distance = 28
): { opacity: number; transform: string } => {
  const p = eased(frame, delay, duration);
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` };
};

/**
 * A 1px rule drawing in from the left. Returns a `transform: scaleX()` to apply
 * to an element with `transformOrigin: 'left'`. The register's signature move.
 */
export const hairlineDraw = (
  frame: number,
  delay = 0,
  duration = TIMING.slow
): { transform: string; transformOrigin: string } => ({
  transform: `scaleX(${eased(frame, delay, duration)})`,
  transformOrigin: "left",
});

/** A vertical rule drawing downward (e.g. comparison divider). */
export const ruleDrawDown = (
  frame: number,
  delay = 0,
  duration = TIMING.slow
): { transform: string; transformOrigin: string } => ({
  transform: `scaleY(${eased(frame, delay, duration)})`,
  transformOrigin: "top",
});

/**
 * Mask wipe — reveals content via clip-path from the bottom up. Pairs with a
 * still element (no transform on the text itself) for a typographic reveal.
 */
export const maskWipeUp = (
  frame: number,
  delay = 0,
  duration = TIMING.slow
): { clipPath: string } => {
  const p = eased(frame, delay, duration);
  return { clipPath: `inset(${(1 - p) * 100}% 0 0 0)` };
};

/** An ink underline growing left→right under a phrase. Returns a width %. */
export const underlineGrow = (frame: number, delay = 0, duration = TIMING.slow): string =>
  `${eased(frame, delay, duration) * 100}%`;

/**
 * Gentle settle used for whole-block paper entrances: a soft spring on opacity
 * with no transform, so paper beats feel calm rather than mechanical.
 */
export const settle = (frame: number, fps: number, delay = 0): number =>
  spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 80, mass: 1 } });

/**
 * Slide-out at the end of a sequence so cuts land on a motion peak rather than a
 * hard static cut (kept lesson-video convention: cut on the curve). Returns an
 * opacity that fades over the last `duration` frames before `endFrame`.
 */
export const fadeOutBefore = (
  frame: number,
  endFrame: number,
  duration = TIMING.fast
): number =>
  interpolate(frame, [endFrame - duration, endFrame], [1, 0], {
    easing: FDE_EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
