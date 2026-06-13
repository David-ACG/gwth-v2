import * as React from "react"

/**
 * Inline GWTH.ai vector logo. Two-colour: wordmark (G + WTH + ai)
 * and accent (the arrow inside the G + dot on the i + dot on the a).
 *
 * Defaults to the locked brand CSS variables `--logo-wordmark` and
 * `--logo-accent` (defined in `globals.css` for both light and dark
 * modes, decision recorded 2026-04-29 via /logo_picker). Consumers
 * can still override via the `wordmarkColor` / `accentColor` props
 * — used by the live colour explorer and any one-off contexts that
 * need a different treatment (mono print, OG images, etc.).
 *
 * The static `/logo-gwth.svg` keeps the original brand colours for
 * any non-React usage (favicons, OG images, emails).
 */
export type LogoGwthProps = {
  /** Hex/colour for the GWTH.ai wordmark glyphs. Defaults to `var(--logo-wordmark)`. */
  wordmarkColor?: string
  /** Hex/colour for the arrow inside the G plus the two accent dots. Defaults to `var(--logo-accent)`. */
  accentColor?: string
  /** Width in CSS units; height auto-scales (aspect ≈ 5.69:1). */
  width?: number | string
  /** Optional accessible label. Defaults to "GWTH.ai". */
  title?: string
  className?: string
}

export function LogoGwth({
  wordmarkColor = "var(--logo-wordmark)",
  accentColor = "var(--logo-accent)",
  width,
  title = "GWTH.ai",
  className,
}: LogoGwthProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 578.07 101.64"
      role="img"
      aria-label={title}
      width={width}
      className={className}
    >
      <title>{title}</title>
      {/* G */}
      <path
        fill={wordmarkColor}
        d="M60.79,1.33C28,.82,2.16,27.79,8.49,60.16s35.41,42.4,50.8,23.12c0,0-23.24.29-31.87-21.74S34.78,23.1,52.77,18.71s33.4,7,40.38,14.56l13.08-12.11S93.61,1.84,60.79,1.33Z"
      />
      {/* W */}
      <polygon
        fill={wordmarkColor}
        points="220.13 72.24 199.89 6.6 184.17 6.6 163.93 72.24 143.7 6.6 126.25 6.6 154.33 96.06 171.84 96.06 192.03 31.77 212.22 96.06 229.72 96.06 257.8 6.6 240.36 6.6 220.13 72.24"
      />
      {/* T */}
      <polygon
        fill={wordmarkColor}
        points="294.15 6.6 265.81 6.6 265.81 20.64 294.15 20.64 294.15 96.06 309.6 96.06 309.6 20.64 339.65 20.64 339.65 6.6 309.6 6.6 294.15 6.6"
      />
      {/* H */}
      <polygon
        fill={wordmarkColor}
        points="413.08 42.83 367.41 42.83 367.41 6.6 351.95 6.6 351.95 96.06 367.41 96.06 367.41 57.38 413.08 57.38 413.08 96.06 428.54 96.06 428.54 6.6 413.08 6.6 413.08 42.83"
      />
      {/* a */}
      <path
        fill={wordmarkColor}
        d="M511.83,29.25c-14.42-1.55-26.76,3.06-33.44,8.43l5.82,10.68a32.07,32.07,0,0,1,18.17-6.64c11.2-.57,18.79,3.15,18.79,15H497.39c-8,0-21.34,5.64-21.68,17.88s9.24,22,22.43,22.11c11.14.11,19.58-2.19,23.83-9,.18,4.73.31,8,.31,8h14.05V55.82C536.33,38.27,526.25,30.8,511.83,29.25Zm9.69,45.08s-3.66,11.78-17.43,10.94-14.78-10.11-10.76-14.38,11.25-4.06,16.59-4.06h11.4c.06,2.42.12,5,.2,7.5Z"
      />
      {/* i stem */}
      <rect
        fill={wordmarkColor}
        x="552.68"
        y="29.93"
        width="16.62"
        height="66.13"
      />
      {/* arrow inside the G */}
      <path
        fill={accentColor}
        d="M86.13,64.61h0S62.07,93.38,47.73,98.16c0,0,14.34,4.86,28.54,0,9.71-3.32,19.59-13,24.86-18.74L119,97.06V46.89H68.17Z"
      />
      {/* dot on i */}
      <ellipse
        fill={accentColor}
        cx="560.99"
        cy="11.01"
        rx="9.56"
        ry="9.25"
      />
      {/* dot after a (the period in .ai) */}
      <ellipse
        fill={accentColor}
        cx="454.29"
        cy="86.81"
        rx="10.77"
        ry="10.43"
      />
    </svg>
  )
}

export type LogoGwthMarkProps = {
  /** Hex/colour for the G outline. Defaults to `var(--logo-wordmark)`. */
  wordmarkColor?: string
  /** Hex/colour for the arrow inside the G. Defaults to `var(--logo-accent)`. */
  accentColor?: string
  /** Width in CSS units; height auto-scales (aspect ≈ 1.18:1). */
  width?: number | string
  /** Optional accessible label. Defaults to "GWTH". */
  title?: string
  className?: string
}

/**
 * G-only brand mark — the GWTH.ai logo's leading glyph plus the
 * accent arrow inside it. Reuses the path data from `LogoGwth` so
 * the geometry stays in lockstep with the wordmark.
 *
 * Defaults to the locked CSS variables `--logo-wordmark` and
 * `--logo-accent` so the icon auto-flips between light and dark
 * modes with no theme-detection JS / hydration dance. Use this for
 * favicons, score widgets, and any compact branded surface where
 * the full wordmark would be too dense.
 */
export function LogoGwthMark({
  wordmarkColor = "var(--logo-wordmark)",
  accentColor = "var(--logo-accent)",
  width,
  title = "GWTH",
  className,
}: LogoGwthMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 127 102"
      role="img"
      aria-label={title}
      width={width}
      className={className}
    >
      <title>{title}</title>
      {/* G outline */}
      <path
        fill={wordmarkColor}
        d="M60.79,1.33C28,.82,2.16,27.79,8.49,60.16s35.41,42.4,50.8,23.12c0,0-23.24.29-31.87-21.74S34.78,23.1,52.77,18.71s33.4,7,40.38,14.56l13.08-12.11S93.61,1.84,60.79,1.33Z"
      />
      {/* Arrow inside the G */}
      <path
        fill={accentColor}
        d="M86.13,64.61h0S62.07,93.38,47.73,98.16c0,0,14.34,4.86,28.54,0,9.71-3.32,19.59-13,24.86-18.74L119,97.06V46.89H68.17Z"
      />
    </svg>
  )
}
