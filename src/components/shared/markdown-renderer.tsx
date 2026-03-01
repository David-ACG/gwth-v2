"use client"

import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import DOMPurify from "isomorphic-dompurify"
import { cn } from "@/lib/utils"
import { CalloutBox } from "@/components/lesson/callout-box"
import type { CalloutVariant } from "@/components/lesson/callout-box"
import { KeyTermTooltip } from "@/components/lesson/key-term-tooltip"
import type { Components } from "react-markdown"
import type { ReactNode } from "react"

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
 * Sanitises HTML via DOMPurify before rendering.
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

  // Sanitise — allow our custom data attributes and elements
  const sanitised = DOMPurify.sanitize(processed, {
    ADD_TAGS: ["callout-box", "key-term"],
    ADD_ATTR: ["data-variant", "data-title", "data-term", "data-definition"],
  })

  return (
    <div className={cn("lesson-prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {sanitised}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Pre-processes markdown to convert custom syntax to HTML elements
 * that react-markdown can render with custom components.
 */
function preprocessMarkdown(md: string): string {
  let result = md

  // Convert callout blocks: :::variant[optional title]\ncontent\n:::
  result = result.replace(
    /^:::(\w+)(?:\[([^\]]*)\])?\s*\n([\s\S]*?)^:::\s*$/gm,
    (_match, variant: string, title: string | undefined, content: string) => {
      const titleAttr = title ? ` data-title="${escapeHtmlAttr(title)}"` : ""
      return `<callout-box data-variant="${variant}"${titleAttr}>\n\n${content.trim()}\n\n</callout-box>`
    },
  )

  // Convert key terms: ==term|definition==
  result = result.replace(
    /==((?:(?!==).)+?)\|((?:(?!==).)+?)==/g,
    (_match, term: string, definition: string) => {
      return `<key-term data-term="${escapeHtmlAttr(term)}" data-definition="${escapeHtmlAttr(definition)}"></key-term>`
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

/** Extract text content from react-markdown children */
function extractText(children: ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(extractText).join("")
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children?: ReactNode } }).props.children)
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
 * Custom react-markdown component overrides.
 * Maps standard markdown elements to styled components,
 * and custom HTML elements to lesson components.
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
    // Extract the code element's props
    if (
      children &&
      typeof children === "object" &&
      "props" in children
    ) {
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
    // If it has a language class, it's handled by the pre component
    if (className?.startsWith("language-")) {
      return <code className={className}>{children}</code>
    }
    return <code>{children}</code>
  },

  // Custom elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "callout-box": ((props: any) => {
    const variant = (props["data-variant"] as CalloutVariant) ?? "note"
    const title = props["data-title"] as string | undefined
    return (
      <CalloutBox variant={variant} title={title}>
        {props.children}
      </CalloutBox>
    )
  }) as Components["div"],

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "key-term": ((props: any) => {
    const term = (props["data-term"] as string) ?? ""
    const definition = (props["data-definition"] as string) ?? ""
    return <KeyTermTooltip term={term} definition={definition} />
  }) as Components["span"],
}
