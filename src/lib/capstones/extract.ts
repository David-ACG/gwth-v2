/**
 * Turns a PDF or Word file into plain text so its private details can be
 * hidden like any text file (David, 2026-10-30, option A: "Pull the text out
 * of PDFs and Word files and redact it like any other text file").
 *
 * The marker then reads the redacted TEXT; the original document is never
 * stored or sent. A document with no readable text (a scan, or a page that is
 * only a picture) cannot be checked by the learner or redacted by us, so it is
 * reported as unreadable and left out of the hand-in.
 */
import "server-only"

import { unzipSync, strFromU8 } from "fflate"

/** What {@link extractDocumentText} found. */
export type Extracted =
  | { kind: "text"; text: string }
  | { kind: "unreadable" }

/** Extensions converted to text before redaction. */
export const CONVERTED_EXTENSIONS = new Set(["pdf", "docx"])

/** Fewer letters than this and a document counts as having no readable text. */
const MIN_LETTERS = 20

function letters(text: string): number {
  return (text.match(/\p{L}/gu) ?? []).length
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&")
}

/**
 * The text of a .docx: every paragraph of the body, headers, footers,
 * footnotes and comments, one paragraph per line, tabs and breaks kept.
 */
export function docxText(bytes: Uint8Array): string {
  const parts = unzipSync(bytes, {
    filter: (f) => /^word\/(document|header\d*|footer\d*|footnotes|endnotes|comments)\.xml$/.test(f.name),
  })
  const order = (name: string) => (name === "word/document.xml" ? 0 : 1)
  return Object.keys(parts)
    .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
    .map((name) => {
      const xml = strFromU8(parts[name]!)
      return decodeXmlEntities(
        xml
          .replace(/<w:tab\/>/g, "\t")
          .replace(/<w:(br|cr)\/>/g, "\n")
          .replace(/<\/w:p>/g, "\n")
          .replace(/<[^>]+>/g, ""),
      )
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** The text of a PDF, page by page. */
export async function pdfText(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf")
  // pdf.js takes ownership of the buffer it is given, so hand it a copy.
  const pdf = await getDocumentProxy(new Uint8Array(bytes))
  try {
    const { text } = await extractText(pdf, { mergePages: false })
    return (Array.isArray(text) ? text : [text]).map((page) => page.trim()).join("\n\n").trim()
  } finally {
    // Frees pdf.js's worker state; the proxy's own method name varies by release.
    await (pdf as { destroy?: () => Promise<void> }).destroy?.().catch(() => undefined)
  }
}

/**
 * Text from a PDF or Word file, `unreadable` when it holds no text we can
 * read, or null when the file is not one we convert.
 */
export async function extractDocumentText(path: string, bytes: Uint8Array): Promise<Extracted | null> {
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  if (!CONVERTED_EXTENSIONS.has(ext)) return null
  let text: string
  try {
    text = ext === "pdf" ? await pdfText(bytes) : docxText(bytes)
  } catch {
    // A damaged or password-protected file reads as no text, so it is left out rather than sent.
    return { kind: "unreadable" }
  }
  return letters(text) >= MIN_LETTERS ? { kind: "text", text } : { kind: "unreadable" }
}
