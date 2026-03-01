"use client"

import { useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CodeBlockProps {
  /** The raw code string */
  code: string
  /** Language for syntax highlighting (e.g. "typescript", "python") */
  language?: string
  /** Optional filename label (top-left) */
  filename?: string
  /** Optional line numbers to highlight (1-based) */
  highlightLines?: number[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Syntax-highlighted code block using Shiki.
 * Features a copy button (top-right), optional filename label,
 * and optional line highlighting. Switches between light/dark
 * themes based on next-themes. Loaded via next/dynamic to avoid SSR issues.
 */
export function CodeBlock({
  code,
  language = "text",
  filename,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const [highlightedHtml, setHighlightedHtml] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki/bundle/web")
        const theme =
          resolvedTheme === "dark" ? "github-dark" : "github-light"

        const html = await codeToHtml(code, {
          lang: language,
          theme,
          transformers: highlightLines.length > 0
            ? [
                {
                  line(node, line) {
                    if (highlightLines.includes(line)) {
                      this.addClassToHast(node, "highlighted-line")
                    }
                  },
                },
              ]
            : [],
        })

        if (!cancelled) setHighlightedHtml(html)
      } catch {
        // Fallback: render without highlighting
        if (!cancelled) {
          const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
          setHighlightedHtml(
            `<pre class="shiki"><code>${escaped}</code></pre>`,
          )
        }
      }
    }

    highlight()
    return () => {
      cancelled = true
    }
  }, [code, language, resolvedTheme, highlightLines])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div
      className={cn(
        "group relative my-5 overflow-hidden rounded-[0.625rem] border border-border bg-muted dark:bg-card",
        className,
      )}
    >
      {/* Header bar with filename and copy button */}
      {(filename || true) && (
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-1.5">
          <span className="font-mono text-xs text-muted-foreground">
            {filename ?? language}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      )}

      {/* Code content */}
      <div
        className="overflow-x-auto px-5 py-4 font-mono text-sm leading-relaxed [&_.shiki]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent [&_code]:!p-0 [&_.highlighted-line]:bg-primary/10 [&_.highlighted-line]:block [&_.highlighted-line]:-mx-5 [&_.highlighted-line]:px-5"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  )
}
