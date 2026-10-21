/**
 * Markdown written by an AI model, as safe HTML (the Model Lab answers).
 *
 * The same server-side pipeline the lesson viewer uses for its parts
 * (`lib/lessons/parts-html.ts`: remark-parse, remark-gfm, remark-rehype WITHOUT
 * allowDangerousHtml, so any raw HTML in the source is dropped), with three
 * extra rules because this text is NOT first-party:
 *
 * - a link keeps its href only when it is http, https or mailto, and opens in a
 *   new tab with `rel="nofollow noopener noreferrer"`; anything else
 *   (`javascript:`, `data:`, relative paths into this site) loses its href and
 *   stays as plain text;
 * - images become their alt text in brackets, so a model cannot make a
 *   visitor's browser fetch an outside address;
 * - task-list checkboxes become a box glyph (no unlabelled form control), and
 *   code blocks get tabindex so a keyboard can scroll them, as in lessons.
 */
import "server-only"

import { toHtml } from "hast-util-to-html"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import type { Element, ElementContent, Root, RootContent } from "hast"

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype)

const SAFE_HREF = /^(https?:|mailto:)/i

function rewrite(node: Root | RootContent): void {
  if (node.type !== "element" && node.type !== "root") return
  if ("children" in node) {
    node.children = node.children.map((child): ElementContent => {
      if (child.type === "element" && child.tagName === "img") {
        const alt = typeof child.properties?.alt === "string" ? child.properties.alt : ""
        return { type: "text", value: alt ? `[${alt}]` : "[picture]" }
      }
      return child as ElementContent
    }) as typeof node.children
    node.children.forEach((c) => rewrite(c as RootContent))
  }
  if (node.type !== "element") return
  const el = node as Element
  if (el.tagName === "a") {
    const href = typeof el.properties?.href === "string" ? el.properties.href.trim() : ""
    if (SAFE_HREF.test(href)) {
      el.properties = { href, target: "_blank", rel: "nofollow noopener noreferrer" }
    } else {
      el.properties = {}
    }
  }
  if (el.tagName === "input" && el.properties?.type === "checkbox") {
    const checked = Boolean(el.properties.checked)
    Object.assign(el, {
      tagName: "span",
      properties: { ariaHidden: "true" },
      children: [{ type: "text", value: checked ? "☑" : "☐" }],
    })
  }
  if (el.tagName === "pre") el.properties = { ...el.properties, tabIndex: 0 }
}

/**
 * Renders model-written markdown to an HTML string that is safe to insert
 * into the page.
 */
export function renderAnswerMarkdown(markdown: string): string {
  const tree = processor.runSync(processor.parse(markdown)) as Root
  rewrite(tree)
  return toHtml(tree)
}
