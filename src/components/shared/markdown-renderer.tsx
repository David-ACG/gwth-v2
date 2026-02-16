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

/** Basic markdown to HTML conversion */
function convertMarkdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities (except for allowed tags we generate)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Code blocks (triple backtick)
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_match, lang, code) =>
      `<pre><code class="language-${lang || "text"}">${code.trim()}</code></pre>`
  )

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

  // Italic
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

  // Tables (basic)
  html = html.replace(
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

  // Paragraphs (double newline)
  html = html.replace(/\n\n(?!<)/g, "</p><p>")
  html = `<p>${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "")
  html = html.replace(/<p>(<h[1-6]>)/g, "$1")
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1")
  html = html.replace(/<p>(<pre>)/g, "$1")
  html = html.replace(/(<\/pre>)<\/p>/g, "$1")
  html = html.replace(/<p>(<ul>)/g, "$1")
  html = html.replace(/(<\/ul>)<\/p>/g, "$1")

  return html
}
