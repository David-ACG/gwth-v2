/**
 * FDE Journal Register — video theme tokens.
 *
 * This is the single source of truth for colour in the explainer video. It is
 * transcribed verbatim from the platform's design authority
 * (`GWTH_V2/DESIGN_FDE.md` §2, the LIGHT palette) so the video matches the live
 * FDE homepage it sits on. NO raw hex may appear anywhere else in this project —
 * every slide references `FDE.<token>`.
 *
 * The video is rendered once in the LIGHT register (the canonical home default):
 * paper-cream content beats, drenched dark-teal title/CTA bands. There is no
 * runtime theme switch in a video, so only the light block is needed here.
 *
 * @see GWTH_V2/DESIGN_FDE.md — the canonical authority for all student surfaces.
 */
export const FDE = {
  /** Page ground — sage paper. */
  bg: "#e8e9de",
  /** Card / panel paper, one tonal step off the ground. */
  surface: "#f1ecdc",
  /** Primary text, strong hairlines, outline buttons. */
  ink: "#1a1c18",
  /** Body / secondary copy. */
  soft: "#3a3c34",
  /** Mono labels, captions, tertiary copy. */
  muted: "#5a5c52",
  /** Primary hairline (card borders, list rules). */
  line: "#c8c8b8",
  /** Internal dividers inside cards. */
  lineSoft: "#d8d4c4",
  /** Hero / masthead band, brand colour. */
  teal: "#2c4a47",
  /** Dispatch band, solid-button hover. */
  tealDeep: "#1f3a37",
  /** Text on teal / moss / rust bands. */
  cream: "#ece8d2",
  /** Standfirst / secondary text on teal. */
  creamMuted: "rgba(236,232,210,0.85)",
  /** Hairlines on teal bands. */
  heroLine: "rgba(236,232,210,0.25)",
  /** Accent: stats, hover titles, italic em on paper. */
  ochre: "#c08a36",
  /** Italic em accent on teal bands. */
  ochreBright: "#d4a062",
  /** Card flavour 2. */
  moss: "#2a4530",
  /** Card flavour 3. */
  rust: "#a87528",
  /** Solid button background. */
  action: "#2c4a47",
  /** Solid button text. */
  actionText: "#ffffff",
  /** Inactive progress dash. */
  dash: "rgba(26,28,24,0.18)",
  /** Active progress dash. */
  dashActive: "#2c4a47",
} as const;

export type FdeToken = keyof typeof FDE;

/**
 * Two visual treatments, one per beat-type, matching the chosen MIXED treatment
 * (David, 2026-06-17): teal bands for title/CTA/dispatch beats, paper for
 * statement/feature/comparison content beats.
 */
export const SURFACES = {
  /** Drenched dark-teal band, cream text, ochre-bright accent. */
  teal: {
    bg: FDE.teal,
    ink: FDE.cream,
    soft: FDE.creamMuted,
    line: FDE.heroLine,
    accent: FDE.ochreBright,
    mono: FDE.creamMuted,
  },
  /** Deeper teal band for the dispatch/CTA beat. */
  tealDeep: {
    bg: FDE.tealDeep,
    ink: FDE.cream,
    soft: FDE.creamMuted,
    line: FDE.heroLine,
    accent: FDE.ochreBright,
    mono: FDE.creamMuted,
  },
  /** Sage-paper content surface, ink text, ochre accent. */
  paper: {
    bg: FDE.bg,
    ink: FDE.ink,
    soft: FDE.soft,
    line: FDE.line,
    accent: FDE.ochre,
    mono: FDE.muted,
  },
} as const;

export type SurfaceName = keyof typeof SURFACES;

/**
 * Type scale for 1920x1080. The register is serif-first (Source Serif 4) with
 * mono metadata (JetBrains Mono). Sizes are scaled up from the web recipes in
 * DESIGN_FDE.md §3 for legibility at video distance, keeping the same ratios.
 */
export const TYPE = {
  serif: '"Source Serif 4", Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
  size: {
    /** Title-cover hero line. */
    hero: 132,
    /** Single-statement display. */
    statement: 96,
    /** Section / feature title. */
    title: 72,
    /** Dispatch (CTA) title. */
    dispatch: 80,
    /** Card / column heading. */
    heading: 46,
    /** Lead / standfirst. */
    lead: 40,
    /** Body copy. */
    body: 34,
    /** Big stat / number. */
    stat: 118,
    /** Mono metadata label. */
    mono: 26,
  },
  weight: { display: 600, medium: 500, body: 400 },
  /** Negative tracking on display serif (DESIGN_FDE §3). */
  trackingDisplay: "-0.02em",
  /** Mono tracking (DESIGN_FDE §3 — 0.16em uppercase). */
  trackingMono: "0.16em",
  lineHeight: { display: 1.06, body: 1.6, lead: 1.5 },
} as const;

/** Canonical 1080p, 30fps video frame. */
export const VIDEO = { width: 1920, height: 1080, fps: 30 } as const;

/**
 * Outer page measure — bands are full-bleed, their CONTENT sits in this measure
 * (mirrors `.page { width: min(1100px, 100% - 2.5rem) }` in DESIGN_FDE §5.1,
 * scaled to the 1920 canvas).
 */
export const PAGE_PADDING = 180;
