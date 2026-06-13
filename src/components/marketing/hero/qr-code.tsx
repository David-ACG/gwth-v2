import QRCode from "qrcode"

/**
 * Demo URL for the personalised score-card mock. The credential ID
 * + fragment are opaque and visibly unique so the browser-frame URL
 * bar reads as a personal page, not a generic landing page. The
 * production verify-page pattern is `gwth.ai/verify/{credentialId}`
 * (memory `linkedin-add-to-profile-future-feature-deferred-to`); for
 * the marketing mock we keep it co-located at /score/{id}#{anchor}
 * so a single URL drives the browser bar AND the QR code.
 */
export const DEMO_SCORE_URL = "https://gwth.ai/score/c67sg#dde5"

/** Display form (no scheme) used in the browser-frame URL chip. */
export const DEMO_SCORE_URL_DISPLAY = "gwth.ai/score/c67sg#dde5"

export type QrCodeProps = {
  /** URL or text to encode. */
  value: string
  /** Rendered pixel size. Defaults to 64. */
  size?: number
  /** Optional accessible label. Defaults to a generic message. */
  title?: string
  className?: string
}

/**
 * Server-rendered SVG QR code. Uses the `qrcode` library's
 * synchronous matrix API so no client JS or async boundary is
 * needed — the SVG cells are emitted as theme-aware
 * `<rect fill="currentColor" />` elements, which means the colour
 * is inherited from the surrounding text colour and flips
 * automatically between light and dark mode.
 *
 * The default error-correction level is "M" (~15% recovery), which
 * gives a balance of payload density and resilience for a marketing
 * placement. The QR is `aria-label`ed for screen readers and the
 * URL text is duplicated as visible label by the caller.
 */
export function QrCode({
  value,
  size = 64,
  title = "QR code",
  className,
}: QrCodeProps) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" })
  const modules = qr.modules.size
  const cells: React.ReactNode[] = []
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (qr.modules.get(row, col)) {
        cells.push(
          <rect
            key={`${row}-${col}`}
            x={col}
            y={row}
            width={1}
            height={1}
            fill="currentColor"
            shapeRendering="crispEdges"
          />
        )
      }
    }
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox={`0 0 ${modules} ${modules}`}
      className={className}
    >
      <title>{title}</title>
      {cells}
    </svg>
  )
}
