/**
 * Font loading for the FDE register. The two-family rule (DESIGN_FDE §3):
 * Source Serif 4 for display AND body, JetBrains Mono for metadata only.
 * No third font.
 *
 * Loaded via @remotion/google-fonts so the weights are bundled into the render
 * (no network flash mid-render). Call {@link ensureFdeFonts} once at module
 * scope so the families are registered before any frame paints.
 */
import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const serif = loadSerif("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const serifItalic = loadSerif("italic", { weights: ["500"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500", "600"], subsets: ["latin"] });

/** Family names to use in `fontFamily` once loading has been triggered. */
export const FONT_FAMILY = {
  serif: serif.fontFamily,
  mono: mono.fontFamily,
} as const;

/**
 * No-op accessor that guarantees the side-effecting loadFont() calls above have
 * run. Importing this module is enough; this export documents the intent.
 */
export const ensureFdeFonts = (): void => {
  void serif;
  void serifItalic;
  void mono;
};
