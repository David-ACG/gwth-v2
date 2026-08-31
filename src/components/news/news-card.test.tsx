import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { writeFileSync, mkdirSync } from "node:fs"
import { NewsCard } from "./news-card"
import type { NewsArticle } from "@/lib/types"

// NewsCard nests UpvoteButton, a client component that calls useRouter();
// jsdom has no Next.js app router mounted, so stub navigation.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

/**
 * Builds a NewsArticle fixture, overriding only the fields a test cares about.
 */
function makeArticle(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id: "1",
    slug: "anthropic-ships-claude",
    title: "Anthropic ships a new Claude model",
    excerpt: "A short summary of the article shown on the card.",
    content: "Full markdown content.",
    url: "https://www.anthropic.com/news",
    category: "ai-launch",
    tags: ["claude", "anthropic"],
    thumbnailUrl: null,
    author: "GWTH Team",
    voteCount: 42,
    commentCount: 7,
    labSlug: null,
    isFeatured: false,
    status: "published",
    publishedAt: new Date("2026-06-01T12:00:00Z"),
    hotnessScore: 100,
    createdAt: new Date("2026-06-01T12:00:00Z"),
    updatedAt: new Date("2026-06-01T12:00:00Z"),
    ...overrides,
  }
}

// This config runs without vitest globals, so testing-library's auto-cleanup
// afterEach is not registered; clean up manually to isolate each render.
afterEach(() => cleanup())

describe("NewsCard external-source icon accessibility", () => {
  it("exposes the external-link icon to assistive tech with role=img and an accessible label", () => {
    render(
      <NewsCard
        article={makeArticle({ url: "https://www.anthropic.com/news" })}
        hasVoted={false}
        isAuthenticated={false}
      />,
    )

    // The icon must be discoverable by its ARIA role and accessible name,
    // i.e. a screen reader announces "(has external source)" rather than skipping it.
    const icon = screen.getByRole("img", { name: "(has external source)" })
    expect(icon).toBeInTheDocument()
    expect(icon.tagName.toLowerCase()).toBe("svg")
    expect(icon).toHaveAttribute("aria-label", "(has external source)")
  })

  it("omits the external-link icon entirely for original content (no url)", () => {
    render(
      <NewsCard
        article={makeArticle({ url: null })}
        hasVoted={false}
        isAuthenticated={false}
      />,
    )

    expect(
      screen.queryByRole("img", { name: "(has external source)" }),
    ).not.toBeInTheDocument()
  })

  // Emits the real component output (both variants) as a static HTML fragment so
  // a headless browser can render a faithful screenshot + accessibility tree.
  it("emits rendered HTML for visual/a11y evidence capture", () => {
    const withUrl = render(
      <NewsCard
        article={makeArticle({
          title: "Anthropic ships a new Claude model",
          url: "https://www.anthropic.com/news",
        })}
        hasVoted={false}
        isAuthenticated={false}
      />,
    )
    const external = withUrl.container.innerHTML
    cleanup()

    const original = render(
      <NewsCard
        article={makeArticle({
          id: "2",
          slug: "gwth-original",
          title: "GWTH original: building an AI study workflow",
          url: null,
          category: "tutorial",
          tags: ["workflow", "study"],
        })}
        hasVoted={true}
        isAuthenticated={true}
      />,
    ).container.innerHTML

    const dir =
      ".no-mistakes/evidence/nm-trial/09-auto"
    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/news-card-external.fragment.html`, external)
    writeFileSync(`${dir}/news-card-original.fragment.html`, original)
    expect(external).toContain('aria-label="(has external source)"')
    expect(original).not.toContain('aria-label="(has external source)"')
  })
})
