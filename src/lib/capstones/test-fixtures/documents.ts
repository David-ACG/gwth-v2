/**
 * Tiny real documents for the hand-in tests (bead gwth-launch-9289.3): a PDF
 * whose pages carry text, a PDF with an empty page (what a scan looks like to
 * a text reader), and a .docx. Built in code so no binary fixture is checked in.
 */
import { strToU8, zipSync } from "fflate"

function escapePdf(text: string): string {
  return text.replace(/[\\()]/g, (c) => `\\${c}`)
}

/** A valid PDF with one page per entry; an empty string gives a page with no text. */
export function makePdf(pages: string[]): Uint8Array {
  const objects: string[] = []
  const pageIds = pages.map((_, i) => 4 + i * 2)
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>"
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  pages.forEach((text, i) => {
    const lines = text.split("\n")
    const stream = text
      ? `BT /F1 12 Tf 14 TL 72 720 Td ${lines.map((l) => `(${escapePdf(l)}) Tj T*`).join(" ")} ET`
      : ""
    objects[pageIds[i]!] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageIds[i]! + 1} 0 R >>`
    objects[pageIds[i]! + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  })
  let out = "%PDF-1.4\n"
  const offsets: number[] = []
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = out.length
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const xref = out.length
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objects.length; id++) out += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return strToU8(out)
}

/** A minimal .docx with one paragraph per entry. */
export function makeDocx(paragraphs: string[]): Uint8Array {
  const body = paragraphs
    .map((p) => `<w:p><w:r><w:t xml:space="preserve">${p.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</w:t></w:r></w:p>`)
    .join("")
  return zipSync({
    "[Content_Types].xml": strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'),
    "word/document.xml": strToU8(
      `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`,
    ),
  })
}
