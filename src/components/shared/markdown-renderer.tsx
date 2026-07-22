"use client"

import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { markdownImageUrl } from "@/lib/media/url"
import { CalloutBox } from "@/components/lesson/callout-box"
import type { CalloutVariant } from "@/components/lesson/callout-box"
import { KeyTermTooltip } from "@/components/lesson/key-term-tooltip"
import type { Components } from "react-markdown"
import { useState, type ReactNode, type HTMLAttributes, type ImgHTMLAttributes } from "react"

const CodeBlock = dynamic(
  () =>
    import("@/components/lesson/code-block").then((mod) => mod.CodeBlock),
  { ssr: false },
)

interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string
  /** Additional CSS classes for the wrapper */
  className?: string
}

/**
 * Renders markdown content using react-markdown with remark-gfm (tables,
 * strikethrough, task lists) and rehype-raw (HTML passthrough).
 *
 * Content through this component is all first-party (lesson/lab/admin bodies
 * imported from our own Postgres), so it is NOT run through an HTML sanitiser
 * on the source string. An earlier `DOMPurify.sanitize()` pre-parse pass
 * silently broke Markdown: DOMPurify treats the source as HTML and, whenever
 * the body contains any `<` (every lesson carries `<!-- VERIFY -->` authoring
 * comments), re-serialises `>` as `&gt;`, which killed every `> blockquote`,
 * including the course's flagship rule "AI suggests. Humans decide." (bug
 * gwth-launch-5vh). `rehypeRaw` still strips HTML comments at the hast layer,
 * so the authoring comments never reach the DOM.
 *
 * Supports custom syntax:
 * - Callouts: `:::note`, `:::warning`, `:::tip`, `:::deep-dive[Title]`
 * - Key terms: `==term|definition==`
 *
 * Code blocks are rendered via Shiki-powered CodeBlock component.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Pre-process: expand custom callout and key-term syntax into HTML
  // that react-markdown + rehype-raw can handle
  const processed = preprocessMarkdown(content)

  return (
    <div className={cn("lesson-prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Pre-processes markdown to convert custom syntax to standard HTML elements
 * with data attributes that react-markdown can render via component overrides.
 */
function preprocessMarkdown(md: string): string {
  let result = md

  // Convert callout blocks: :::variant[optional title]\ncontent\n:::
  // Use <div data-callout="variant"> so the div component override handles it
  result = result.replace(
    /^:::(\w[-\w]*)(?:\[([^\]]*)\])?\s*\n([\s\S]*?)^:::\s*$/gm,
    (_match, variant: string, title: string | undefined, content: string) => {
      const titleAttr = title
        ? ` data-callout-title="${escapeHtmlAttr(title)}"`
        : ""
      return `<div data-callout="${variant}"${titleAttr}>\n\n${content.trim()}\n\n</div>`
    },
  )

  // Convert key terms: ==term|definition==
  // Use <span data-keyterm="term" data-definition="definition">term</span>
  result = result.replace(
    /==((?:(?!==).)+?)\|((?:(?!==).)+?)==/g,
    (_match, term: string, definition: string) => {
      return `<span data-keyterm="${escapeHtmlAttr(term)}" data-definition="${escapeHtmlAttr(definition)}">${escapeHtml(term)}</span>`
    },
  )

  return result
}

/** Escape string for use in an HTML attribute value */
function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** Escape string for use in HTML text content */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** Extract text content from react-markdown children */
function extractText(children: ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(extractText).join("")
  if (children && typeof children === "object" && "props" in children) {
    return extractText(
      (children as { props: { children?: ReactNode } }).props.children,
    )
  }
  return ""
}

/** Generate a URL-friendly id from heading text */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Renders a markdown image that hides itself if the source fails to load.
 * Lesson/lab bodies imported from the pipeline can reference figures whose
 * assets are not (yet) hosted on the site; rather than show a broken-image
 * icon, the element removes itself so the surrounding prose stays clean
 * (graceful fallback for missing media — W3). Uses a raw <img> because the
 * markdown source has no intrinsic dimensions for next/image.
 */
function GracefulImage({
  src,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  // Pipeline lesson bodies embed figures as bare R2 keys ("lessons/…", W16)
  // which markdownImageUrl resolves onto the media CDN; absolute and data/blob
  // URLs pass through, and any other relative ref (an unhosted file) resolves
  // to null so the surrounding prose stays clean instead of showing a broken
  // image. `onError` still hides a hosted image that fails at runtime.
  const resolved = markdownImageUrl(src)
  if (!resolved || failed) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt ?? ""}
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  )
}

/** Type for div props that may include our custom data attributes */
type DivProps = HTMLAttributes<HTMLDivElement> & {
  "data-callout"?: string
  "data-callout-title"?: string
  children?: ReactNode
  node?: unknown
}

/** Type for span props that may include our custom data attributes */
type SpanProps = HTMLAttributes<HTMLSpanElement> & {
  "data-keyterm"?: string
  "data-definition"?: string
  children?: ReactNode
  node?: unknown
}

/**
 * Custom react-markdown component overrides.
 * Maps standard markdown elements to styled components.
 * Detects custom data attributes on div/span to render lesson components.
 */
const markdownComponents: Components = {
  // Headings with generated IDs for TOC scroll-spy
  h1: ({ children, ...props }) => {
    const text = extractText(children)
    const id = headingId(text)
    return (
      <h1 id={id} {...props}>
        {children}
      </h1>
    )
  },
  h2: ({ children, ...props }) => {
    const text = extractText(children)
    const id = headingId(text)
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }) => {
    const text = extractText(children)
    const id = headingId(text)
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    )
  },

  // Code blocks → Shiki CodeBlock
  pre: ({ children }) => {
    // react-markdown wraps code in <pre><code>
    if (children && typeof children === "object" && "props" in children) {
      const codeElement = children as {
        props: { className?: string; children?: ReactNode }
      }
      const codeProps = codeElement.props
      const langMatch = codeProps.className?.match(/language-(\w+)/)
      const language = langMatch?.[1] ?? "text"
      const code = extractText(codeProps.children).replace(/\n$/, "")

      return <CodeBlock code={code} language={language} />
    }
    return <pre>{children}</pre>
  },

  // Inline code — don't pass through to CodeBlock
  code: ({ children, className }) => {
    if (className?.startsWith("language-")) {
      return <code className={className}>{children}</code>
    }
    return <code>{children}</code>
  },

  // Override div to detect callout data attributes
  div: (({ children, node, ...props }: DivProps) => {
    void node
    const calloutVariant = props["data-callout"]
    if (calloutVariant) {
      const title = props["data-callout-title"]
      return (
        <CalloutBox
          variant={calloutVariant as CalloutVariant}
          title={title}
        >
          {children}
        </CalloutBox>
      )
    }
    return <div {...props}>{children}</div>
  }) as Components["div"],

  // Images self-hide on load failure (graceful fallback for missing media).
  img: (({ node, ...props }) => {
    void node
    return <GracefulImage {...(props as ImgHTMLAttributes<HTMLImageElement>)} />
  }) as Components["img"],

  // Override span to detect key-term data attributes
  span: (({ children, node, ...props }: SpanProps) => {
    void node
    const term = props["data-keyterm"]
    const definition = props["data-definition"]
    if (term && definition) {
      return <KeyTermTooltip term={term} definition={definition} />
    }
    return <span {...props}>{children}</span>
  }) as Components["span"],
}
