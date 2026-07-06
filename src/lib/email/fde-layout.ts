/**
 * Shared FDE transactional-email layout (W17 — bible item email-register).
 *
 * One email-safe adaptation of the FDE journal register that every
 * transactional + nurture email is rebuilt onto:
 * - 600px single-column table, paper-cream ground (#faf6ef), ink text.
 * - Georgia / Times serif for display + body; Courier New mono for metadata.
 * - 1px ink hairlines for structure. Square corners. NO gradients, NO shadows,
 *   NO border-radius, NO images required to read the message.
 * - One solid-teal bulletproof table-button CTA, sentence case.
 * - Terracotta text logo on the light ground.
 * - British English, no emojis, no em dashes.
 *
 * Every builder returns BOTH an HTML part and a matching plain-text part
 * (`EmailParts`), so a plain-text alternative always ships alongside the HTML.
 *
 * Email clients strip <style> blocks and ignore web fonts, so all styling is
 * inline and the font stacks are system serif/mono only. Do not add external
 * CSS, web fonts, media queries relied on for legibility, or remote images.
 */

// Email-safe FDE palette (hex only — no CSS custom properties in email).
const COLOR = {
  ground: "#faf6ef", // paper cream — body + surface
  ink: "#1a1c18", // primary text, strong hairlines
  soft: "#3a3c34", // body copy
  muted: "#5a5c52", // metadata, footer
  line: "#c8c8b8", // soft hairline
  teal: "#2c4a47", // solid CTA background, brand
  terracotta: "#a94c2e", // two-ink logo accent on light ground
} as const

const SERIF = "Georgia, 'Times New Roman', Times, serif"
const MONO = "'Courier New', Courier, monospace"

/** An email's HTML part plus its plain-text alternative. */
export interface EmailParts {
  html: string
  text: string
}

/** A single bulletproof table-button CTA. */
export interface EmailCta {
  /** Sentence-case label, e.g. "See what's inside". */
  label: string
  href: string
}

export interface EmailLayoutInput {
  /** Mono kicker above the headline, e.g. "Waitlist confirmed". Optional. */
  kicker?: string
  /** Serif headline (H1). */
  heading: string
  /**
   * Body blocks, in order. A string renders as a paragraph. A list renders as
   * a plain hairline-free set of lines (checkmarks are added in HTML/text).
   */
  blocks: EmailBlock[]
  /** Optional single CTA. */
  cta?: EmailCta
  /** Footer note lines (rendered mono, muted). */
  footer?: string[]
}

export type EmailBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }

// --- HTML helpers -----------------------------------------------------------

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderBlockHtml(block: EmailBlock): string {
  if (block.type === "p") {
    return `<p style="margin:0 0 16px;color:${COLOR.soft};font-family:${SERIF};font-size:16px;line-height:1.6;">${esc(
      block.text,
    )}</p>`
  }
  // list — hairline-boxed set of ticked lines, still readable without images.
  const rows = block.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;color:${COLOR.soft};font-family:${SERIF};font-size:15px;line-height:1.5;">&#10003;&nbsp;&nbsp;${esc(
          item,
        )}</td></tr>`,
    )
    .join("")
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border:1px solid ${COLOR.line};margin:0 0 16px;"><tr><td style="padding:16px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">${rows}</table></td></tr></table>`
}

function renderCtaHtml(cta: EmailCta): string {
  // Bulletproof table button — square corners, solid teal, sentence case.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:24px 0 8px;"><tr><td style="background:${COLOR.teal};border:1px solid ${COLOR.teal};">
        <a href="${esc(
          cta.href,
        )}" style="display:inline-block;padding:12px 26px;color:${COLOR.ground};font-family:${SERIF};font-size:16px;font-weight:bold;text-decoration:none;">${esc(
          cta.label,
        )}</a>
      </td></tr></table>`
}

/**
 * Renders the full FDE email as HTML + plain-text parts. The HTML is a single
 * 600px table on a cream ground with a terracotta text logo, ink hairlines and
 * square corners; the plain-text part mirrors the same content.
 */
export function renderFdeEmail(input: EmailLayoutInput): EmailParts {
  const { kicker, heading, blocks, cta, footer } = input

  const kickerHtml = kicker
    ? `<p style="margin:0 0 10px;color:${COLOR.muted};font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">${esc(
        kicker,
      )}</p>`
    : ""

  const bodyHtml = blocks.map(renderBlockHtml).join("\n      ")
  const ctaHtml = cta ? renderCtaHtml(cta) : ""

  const footerLines = (
    footer ?? [
      "GWTH.ai. Independent AI education, updated every day.",
    ]
  )
    .map(
      (line) =>
        `<p style="margin:0 0 4px;color:${COLOR.muted};font-family:${MONO};font-size:11px;line-height:1.6;letter-spacing:0.04em;">${esc(
          line,
        )}</p>`,
    )
    .join("\n        ")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.ground};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:${COLOR.ground};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;border-collapse:collapse;background-color:${COLOR.ground};border:1px solid ${COLOR.ink};">
          <!-- Masthead -->
          <tr>
            <td style="padding:16px 24px;border-bottom:1px solid ${COLOR.ink};">
              <span style="font-family:${MONO};font-weight:bold;font-size:16px;color:${COLOR.terracotta};letter-spacing:0.02em;">GWTH.ai</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 24px 24px;">
              ${kickerHtml}
              <h1 style="margin:0 0 16px;color:${COLOR.ink};font-family:${SERIF};font-size:24px;font-weight:bold;line-height:1.3;letter-spacing:-0.01em;">${esc(
                heading,
              )}</h1>
              ${bodyHtml}
              ${ctaHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;border-top:1px solid ${COLOR.line};">
              ${footerLines}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = renderFdeText(input)
  return { html, text }
}

/** Renders the plain-text alternative for the same content. */
function renderFdeText(input: EmailLayoutInput): string {
  const { kicker, heading, blocks, cta, footer } = input
  const lines: string[] = ["GWTH.ai", ""]
  if (kicker) {
    lines.push(kicker.toUpperCase(), "")
  }
  lines.push(heading, "")
  for (const block of blocks) {
    if (block.type === "p") {
      lines.push(block.text, "")
    } else {
      for (const item of block.items) lines.push(`- ${item}`)
      lines.push("")
    }
  }
  if (cta) {
    lines.push(`${cta.label}: ${cta.href}`, "")
  }
  const footerLines = footer ?? [
    "GWTH.ai. Independent AI education, updated every day.",
  ]
  lines.push("--", ...footerLines)
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
}
