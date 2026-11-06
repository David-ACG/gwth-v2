/**
 * Start Here's Markdown as HTML (bead gwth-launch-xw6s).
 *
 * The same pipeline as a lesson part (remark-gfm, no raw HTML, so nothing
 * but Markdown reaches the page), plus the three things a whole lesson on one
 * page needs: the `:::tip` and `:::note` boxes the lesson is written with,
 * each picture after the heading it was drawn for, and tables that scroll
 * inside their own box on a phone instead of widening the page.
 */
import "server-only"

import { toHtml } from "hast-util-to-html"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import type { Element, ElementContent, Root, RootContent } from "hast"
import type { StartHereImage } from "./media"

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype)

type Segment = { kind: "md"; text: string } | { kind: "box"; label: string; text: string }

const BOX_LABEL: Record<string, string> = { tip: "Tip", note: "Note" }

/** Splits out `:::tip` / `:::note` fenced boxes; anything else stays Markdown. */
export function splitBoxes(markdown: string): Segment[] {
  const out: Segment[] = []
  let md: string[] = []
  let box: { label: string; lines: string[] } | null = null
  for (const line of markdown.split("\n")) {
    const label = BOX_LABEL[/^:::(\w+)\s*$/.exec(line)?.[1] ?? ""]
    if (!box && label) {
      if (md.length) out.push({ kind: "md", text: md.join("\n") })
      md = []
      box = { label, lines: [] }
    } else if (box && /^:::\s*$/.test(line)) {
      out.push({ kind: "box", label: box.label, text: box.lines.join("\n") })
      box = null
    } else if (box) {
      box.lines.push(line)
    } else {
      md.push(line)
    }
  }
  if (box) md.push(`:::${box.label.toLowerCase()}`, ...box.lines)
  if (md.length) out.push({ kind: "md", text: md.join("\n") })
  return out
}

function el(tagName: string, properties: Element["properties"], children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}

function textOf(node: RootContent | ElementContent): string {
  if (node.type === "text") return node.value
  if ("children" in node) return (node.children as ElementContent[]).map(textOf).join("")
  return ""
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function figure(img: StartHereImage): Element {
  const pic = (src: string, cls: string): Element =>
    el("img", { src, alt: img.alt, className: [cls], loading: "lazy", decoding: "async", width: 1536, height: 1024 }, [])
  return el("figure", { className: ["sh-figure"] }, [pic(img.light, "sh-light"), pic(img.dark, "sh-dark")])
}

function polish(node: Root | RootContent): void {
  if (node.type !== "element" && node.type !== "root") return
  if (node.type === "element" && node.tagName === "a") {
    const href = String(node.properties?.href ?? "")
    if (/^https?:\/\//.test(href)) {
      node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" }
    }
  }
  node.children.forEach((c) => polish(c as RootContent))
}

export type RenderOptions = {
  /** Pictures keyed by the exact text of the `##` heading they follow. */
  images?: Record<string, StartHereImage>
  /** Shift every heading down this many levels (the project's `#` becomes `##`). */
  demote?: number
}

export type RenderedDoc = { html: string; headings: { id: string; text: string }[] }

export function renderStartHere(markdown: string, options: RenderOptions = {}): RenderedDoc {
  const children: RootContent[] = []
  for (const seg of splitBoxes(markdown)) {
    const tree = processor.runSync(processor.parse(seg.text)) as Root
    if (seg.kind === "md") {
      children.push(...tree.children)
    } else {
      children.push(
        el("aside", { className: ["sh-box"], dataKind: seg.label.toLowerCase() }, [
          el("p", { className: ["sh-box-label"] }, [{ type: "text", value: seg.label }]),
          ...(tree.children as ElementContent[]),
        ])
      )
    }
  }

  const demote = options.demote ?? 0
  const headings: RenderedDoc["headings"] = []
  const out: RootContent[] = []
  for (const node of children) {
    if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
      const level = Math.min(6, Number(node.tagName[1]) + demote)
      node.tagName = `h${level}`
      const text = textOf(node).trim()
      if (level === 2) {
        const id = headingId(text)
        node.properties = { ...node.properties, id }
        headings.push({ id, text })
      }
      out.push(node)
      const img = level === 2 ? options.images?.[text] : undefined
      if (img) out.push(figure(img))
      continue
    }
    if (node.type === "element" && node.tagName === "table") {
      out.push(el("div", { className: ["sh-table"], tabIndex: 0, role: "region", ariaLabel: "Table" }, [node]))
      continue
    }
    out.push(node)
  }

  const root: Root = { type: "root", children: out }
  polish(root)
  return { html: toHtml(root), headings }
}
