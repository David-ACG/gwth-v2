interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string
}

/**
 * Renders markdown content as HTML.
 * Currently uses dangerouslySetInnerHTML with basic markdown-to-HTML conversion.
 * Will be enhanced with Shiki syntax highlighting for code blocks later.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Basic markdown processing — handles headers, code blocks, lists, bold, links
  const html = convertMarkdownToHtml(content)

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:rounded-lg
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Basic markdown to HTML conversion.
 * Extracts code blocks first to protect them from paragraph processing,
 * then handles inline elements, block elements, and finally paragraphs.
 */
function convertMarkdownToHtml(md: string): string {
  // Step 1: Extract fenced code blocks into placeholders to protect them
  const codeBlocks: string[] = []
  let processed = md.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_match, lang, code) => {
      const escaped = code
        .trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      const index = codeBlocks.length
      codeBlocks.push(
        `<pre><code class="language-${lang || "text"}">${escaped}</code></pre>`
      )
      return `\n\n%%CODEBLOCK_${index}%%\n\n`
    }
  )

  // Step 2: Escape remaining HTML entities
  processed = processed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Step 3: Inline code
  processed = processed.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Step 4: Headers
  processed = processed.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
  processed = processed.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  processed = processed.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  processed = processed.replace(/^# (.+)$/gm, "<h1>$1</h1>")

  // Step 5: Bold and italic
  processed = processed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  processed = processed.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  // Step 6: Lists — use distinct markers to avoid cross-contamination
  // Convert unordered items to %%ULI%% marker
  processed = processed.replace(/^- (.+)$/gm, "%%ULI%%$1%%/ULI%%")
  // Convert ordered items to %%OLI%% marker
  processed = processed.replace(/^\d+\. (.+)$/gm, "%%OLI%%$1%%/OLI%%")

  // Wrap consecutive unordered items in <ul>
  processed = processed.replace(
    /(%%ULI%%[\s\S]*?%%\/ULI%%\n?)+/g,
    (match) =>
      `<ul>${match.replace(/%%ULI%%([\s\S]*?)%%\/ULI%%/g, "<li>$1</li>")}</ul>`
  )
  // Wrap consecutive ordered items in <ol>
  processed = processed.replace(
    /(%%OLI%%[\s\S]*?%%\/OLI%%\n?)+/g,
    (match) =>
      `<ol>${match.replace(/%%OLI%%([\s\S]*?)%%\/OLI%%/g, "<li>$1</li>")}</ol>`
  )

  // Step 8: Tables (basic)
  processed = processed.replace(
    /^\|(.+)\|\s*$/gm,
    (match) => {
      const cells = match
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim())
      if (cells.every((c) => /^[-:]+$/.test(c))) return "" // separator row
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`
    }
  )

  // Step 9: Paragraphs — split on double newlines, wrap text segments in <p>
  const blocks = processed.split(/\n{2,}/)
  processed = blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ""
      // Don't wrap block-level elements in <p>
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<table") ||
        trimmed.startsWith("<tr") ||
        trimmed.startsWith("%%CODEBLOCK_")
      ) {
        return trimmed
      }
      // Replace single newlines with <br> for line breaks within a paragraph
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`
    })
    .join("\n")

  // Step 10: Restore code blocks from placeholders
  for (let i = 0; i < codeBlocks.length; i++) {
    processed = processed.replace(`%%CODEBLOCK_${i}%%`, codeBlocks[i])
  }

  // Clean up empty paragraphs
  processed = processed.replace(/<p>\s*<\/p>/g, "")

  return processed
}
