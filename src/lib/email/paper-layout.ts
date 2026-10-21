/**
 * Paper-first transactional email layout (bible item `paper-first-email`).
 *
 * The email-safe translation of the paper-first register, used first by the
 * gift and pass emails (bead gwth-launch-v1uj.5). The older FDE layout in
 * fde-layout.ts still serves the auth and waitlist emails until they move.
 *
 * - 600px single-column table on the light page ground #f2f4f3, a white card
 *   #ffffff with a 10px corner and a #dde2df hairline.
 * - Display type Georgia (stand-in for Bitter), body and labels in the system
 *   sans stack (stand-in for Public Sans). No Courier, no mono metadata.
 * - The button is the site button: fill #b5dbd0, label #17211d, sentence case,
 *   8px corner, as a bulletproof table button (Outlook shows it square).
 * - The hosted wordmark in the light colours. Single column, no images needed
 *   to read the message, British English, no emojis, no dashes as punctuation.
 * - Every email returns an HTML part AND a plain-text part.
 *
 * Email clients strip <style> blocks and ignore web fonts, so every style is
 * inline. Colours are hex because email has no CSS custom properties.
 */
import type { EmailParts } from "@/lib/email/fde-layout"

export type { EmailParts }

const COLOR = {
  ground: "#f2f4f3",
  card: "#ffffff",
  quiet: "#e6efeb",
  ink: "#17211d",
  soft: "#414b46",
  muted: "#67716b",
  hairline: "#dde2df",
  boundary: "#898e8a",
  button: "#b5dbd0",
  buttonText: "#17211d",
} as const

/**
 * The wordmark lives on the public media CDN, not on the site that sends the
 * email: an inbox fetches images through its own proxy, which cannot reach a
 * private preview (David, 2026-10-21: the logo did not show in a gift email
 * sent from hlab). Same image as public/logo-email-paper.png.
 */
export const EMAIL_LOGO_URL = "https://media.gwth.ai/email/logo-email-paper.png"

const DISPLAY = "Georgia, 'Times New Roman', serif"
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

export type PaperBlock =
  | { type: "p"; text: string }
  /** A quiet panel, e.g. the giver's message or a code. */
  | { type: "panel"; lines: string[]; large?: boolean }
  /** Label and value rows, e.g. a receipt. */
  | { type: "rows"; rows: [string, string][] }

export type PaperEmailInput = {
  /** Plain words shown by some inboxes beside the subject. */
  preheader?: string
  heading: string
  blocks: PaperBlock[]
  cta?: { label: string; href: string }
  /** Small closing lines under the card. */
  footer?: string[]
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function blockHtml(block: PaperBlock): string {
  if (block.type === "p") {
    return `<p style="margin:0 0 16px;color:${COLOR.soft};font-family:${SANS};font-size:16px;line-height:1.6;">${esc(block.text)}</p>`
  }
  if (block.type === "panel") {
    const size = block.large ? "22px" : "16px"
    const family = block.large ? DISPLAY : SANS
    const lines = block.lines
      .map(
        (line) =>
          `<p style="margin:0 0 6px;color:${COLOR.ink};font-family:${family};font-size:${size};line-height:1.5;">${esc(line)}</p>`
      )
      .join("")
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;margin:0 0 20px;"><tr><td style="background:${COLOR.quiet};border:1px solid ${COLOR.boundary};border-radius:8px;padding:16px 20px;">${lines}</td></tr></table>`
  }
  const rows = block.rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid ${COLOR.hairline};color:${COLOR.muted};font-family:${SANS};font-size:14px;line-height:1.5;vertical-align:top;">${esc(label)}</td><td style="padding:8px 0;border-bottom:1px solid ${COLOR.hairline};color:${COLOR.ink};font-family:${SANS};font-size:15px;line-height:1.5;text-align:right;vertical-align:top;">${esc(value)}</td></tr>`
    )
    .join("")
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rows}</table>`
}

function buttonHtml(cta: { label: string; href: string }): string {
  const href = esc(cta.href)
  const label = esc(cta.label)
  // Bulletproof button with a VML roundrect for Outlook on Windows.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin:8px 0 8px;"><tr><td align="left">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="17%" stroke="f" fillcolor="${COLOR.button}"><center style="color:${COLOR.buttonText};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a href="${href}" style="display:inline-block;background:${COLOR.button};border-radius:8px;padding:13px 26px;color:${COLOR.buttonText};font-family:${SANS};font-size:16px;font-weight:bold;line-height:20px;text-decoration:none;">${label}</a><!--<![endif]-->
</td></tr></table>`
}

export function renderPaperEmail(input: PaperEmailInput): EmailParts {
  const footer = input.footer ?? ["GWTH.ai is a practical AI course for people who aren't programmers."]
  const preheader = input.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLOR.ground};">${esc(input.preheader)}</div>`
    : ""

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.ground};">
${preheader}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:${COLOR.ground};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;border-collapse:collapse;">
        <tr>
          <td style="padding:0 4px 18px;">
            <img src="${esc(EMAIL_LOGO_URL)}" width="150" height="26" alt="GWTH.ai" style="display:block;border:0;outline:none;text-decoration:none;height:26px;width:150px;">
          </td>
        </tr>
        <tr>
          <td style="background:${COLOR.card};border:1px solid ${COLOR.hairline};border-radius:10px;padding:32px 28px 28px;">
            <h1 style="margin:0 0 18px;color:${COLOR.ink};font-family:${DISPLAY};font-size:26px;font-weight:bold;line-height:1.3;">${esc(input.heading)}</h1>
            ${input.blocks.map(blockHtml).join("\n            ")}
            ${input.cta ? buttonHtml(input.cta) : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 4px 0;">
            ${footer
              .map(
                (line) =>
                  `<p style="margin:0 0 4px;color:${COLOR.muted};font-family:${SANS};font-size:13px;line-height:1.6;">${esc(line)}</p>`
              )
              .join("\n            ")}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { html, text: renderPaperText(input, footer) }
}

function renderPaperText(input: PaperEmailInput, footer: string[]): string {
  const lines: string[] = ["GWTH.ai", "", input.heading, ""]
  for (const block of input.blocks) {
    if (block.type === "p") lines.push(block.text, "")
    else if (block.type === "panel") lines.push(...block.lines.map((l) => `  ${l}`), "")
    else {
      for (const [label, value] of block.rows) lines.push(`${label}: ${value}`)
      lines.push("")
    }
  }
  if (input.cta) lines.push(`${input.cta.label}: ${input.cta.href}`, "")
  lines.push("", ...footer)
  return lines.join("\n")
}
