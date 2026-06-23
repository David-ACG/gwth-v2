/**
 * FDE-register reusable slide-template library.
 *
 * These five typed, props-driven components are the deliverable David keeps: a
 * small library in the FDE journal register, not a one-off timeline. Each takes
 * all copy via props, uses FDE tokens only (no raw hex), handles long text, and
 * animates with restrained motion that fits the register. Every archetype
 * exposes 2–3 `motionVariant`s so the entrance can be chosen per use.
 *
 * @see ../theme/fde-theme.ts — tokens
 * @see ../motion/presets.ts — motion vocabulary
 */
export { TitleCover } from "./TitleCover";
export type { TitleCoverProps, TitleMotion } from "./TitleCover";

export { SingleStatement } from "./SingleStatement";
export type { SingleStatementProps, StatementMotion } from "./SingleStatement";

export { Feature } from "./Feature";
export type { FeatureProps, FeaturePoint, FeatureMotion } from "./Feature";

export { ComparisonTwoUp } from "./ComparisonTwoUp";
export type { ComparisonTwoUpProps, ComparisonMotion } from "./ComparisonTwoUp";

export { CtaDispatch } from "./CtaDispatch";
export type { CtaDispatchProps, DispatchEntry, DispatchMotion } from "./CtaDispatch";
