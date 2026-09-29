/**
 * A lesson part's Markdown as HTML, split after its first block so the
 * part's diagram can sit beside the opening (bead gwth-launch-hqyp).
 *
 * Rendered on the server so the browser gets a plain HTML string it can wrap
 * word by word for read-along without fighting React's reconciliation.
 * Raw HTML in the source is dropped (remark-rehype without
 * allowDangerousHtml), so nothing but Markdown reaches the page.
 */
import "server-only"

import { toHtml } from "hast-util-to-html"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import type { Root, RootContent } from "hast"
import { markdownImageUrl } from "@/lib/media/url"

export interface PartHtml {
  /** The first block (usually the opening paragraph). */
  lead: string
  /** Everything after it. */
  rest: string
}

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype)

/**
 * Images onto the media CDN; task-list checkboxes (read-only in a lesson)
 * become a plain box glyph so there is no unlabelled form control; code
 * blocks that scroll sideways get tabindex so a keyboard can scroll them.
 */
function rewriteNodes(node: Root | RootContent): void {
  if (node.type === "element") {
    if (node.tagName === "img" && typeof node.properties?.src === "string") {
      node.properties.src = markdownImageUrl(node.properties.src) ?? node.properties.src
      node.properties.loading = "lazy"
    }
    if (node.tagName === "input" && node.properties?.type === "checkbox") {
      const checked = Boolean(node.properties.checked)
      Object.assign(node, {
        tagName: "span",
        properties: { ariaHidden: "true" },
        children: [{ type: "text", value: checked ? "☑" : "☐" }],
      })
    }
    if (node.tagName === "pre") node.properties = { ...node.properties, tabIndex: 0 }
  }
  if ("children" in node) node.children.forEach((c) => rewriteNodes(c as RootContent))
}

export function renderPartHtml(markdown: string): PartHtml {
  const tree = processor.runSync(processor.parse(markdown)) as Root
  rewriteNodes(tree)
  const blocks = tree.children.filter((c) => !(c.type === "text" && !c.value.trim()))
  const firstIndex = blocks.findIndex((c) => c.type === "element")
  if (firstIndex === -1) return { lead: "", rest: toHtml(tree) }
  const lead: Root = { type: "root", children: blocks.slice(0, firstIndex + 1) }
  const rest: Root = { type: "root", children: blocks.slice(firstIndex + 1) }
  return { lead: toHtml(lead), rest: toHtml(rest) }
}
