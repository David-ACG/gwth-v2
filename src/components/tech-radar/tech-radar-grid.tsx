"use client"

import { useState, useMemo } from "react"
import type { TechRadarTool } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExternalLink, Search, Flame, Filter, X } from "lucide-react"

/** Props for the TechRadarGrid component */
interface TechRadarGridProps {
  /** All tools to display and filter */
  tools: TechRadarTool[]
  /** All available category names */
  categories: string[]
}

/** Maps tool status to a color scheme for the badge */
const STATUS_COLORS: Record<TechRadarTool["status"], string> = {
  GA: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Beta: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Alpha: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Deprecated:
    "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
  "Research Preview":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
}

/** Maps cost tier to a display label */
const COST_LABELS: Record<TechRadarTool["cost_tier"], string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  open_source: "Open Source",
}

/** Maps cost tier to a color scheme for the badge */
const COST_COLORS: Record<TechRadarTool["cost_tier"], string> = {
  free: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  freemium:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  paid: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  open_source:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
}

/** All possible status values for the filter */
const ALL_STATUSES: TechRadarTool["status"][] = [
  "GA",
  "Beta",
  "Alpha",
  "Research Preview",
  "Deprecated",
]

/** All possible cost tier values for the filter */
const ALL_COST_TIERS: TechRadarTool["cost_tier"][] = [
  "free",
  "freemium",
  "paid",
  "open_source",
]

/**
 * Client-side interactive grid of Tech Radar tools with search, category,
 * status, cost tier, and "hot" filters. All filtering happens locally.
 */
export function TechRadarGrid({ tools, categories }: TechRadarGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedCostTier, setSelectedCostTier] = useState<string | null>(null)
  const [showHotOnly, setShowHotOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredTools = useMemo(() => {
    let results = tools

    // Search by name, description, and tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (selectedCategory) {
      results = results.filter((t) => t.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus) {
      results = results.filter((t) => t.status === selectedStatus)
    }

    // Cost tier filter
    if (selectedCostTier) {
      results = results.filter((t) => t.cost_tier === selectedCostTier)
    }

    // Hot filter
    if (showHotOnly) {
      results = results.filter((t) => t.is_hot)
    }

    return results
  }, [tools, searchQuery, selectedCategory, selectedStatus, selectedCostTier, showHotOnly])

  const hasActiveFilters =
    selectedCategory || selectedStatus || selectedCostTier || showHotOnly

  function clearAllFilters() {
    setSearchQuery("")
    setSelectedCategory(null)
    setSelectedStatus(null)
    setSelectedCostTier(null)
    setShowHotOnly(false)
  }

  return (
    <div>
      {/* Search and filter controls */}
      <div className="mb-8 space-y-4">
        {/* Search bar row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tools, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="size-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Button
            variant={showHotOnly ? "default" : "outline"}
            onClick={() => setShowHotOnly(!showHotOnly)}
            className="gap-2"
            aria-pressed={showHotOnly}
            aria-label="Show trending tools only"
          >
            <Flame className="size-4" />
            <span className="hidden sm:inline">Hot</span>
          </Button>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="space-y-4">
              {/* Category filter */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category ? null : category
                        )
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((status) => (
                    <Button
                      key={status}
                      variant={
                        selectedStatus === status ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedStatus(
                          selectedStatus === status ? null : status
                        )
                      }
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Cost tier filter */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Cost
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_COST_TIERS.map((tier) => (
                    <Button
                      key={tier}
                      variant={
                        selectedCostTier === tier ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedCostTier(
                          selectedCostTier === tier ? null : tier
                        )
                      }
                    >
                      {COST_LABELS[tier]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="mt-4 border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2 text-muted-foreground"
                >
                  <X className="size-3" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredTools.length} of {tools.length} tools
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-2 text-primary underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* Tool card grid */}
      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Search className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-lg font-medium">No tools match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or clearing some filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={clearAllFilters}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Renders a single tool card with status, cost, tags, and external link */
function ToolCard({ tool }: { tool: TechRadarTool }) {
  const verifiedDate = new Date(tool.last_verified).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  )

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <CardContent className="p-5">
        {/* Top row: name + hot indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-bold">{tool.name}</h3>
              {tool.is_hot && (
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 text-orange-500 dark:text-orange-400"
                  title="Trending"
                  aria-label="Trending tool"
                >
                  <Flame className="size-4" />
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {tool.category}
            </p>
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Visit ${tool.name} website (opens in new tab)`}
          >
            <ExternalLink className="size-4" />
          </a>
        </div>

        {/* Badges: version, status, cost */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-xs">
            v{tool.version}
          </Badge>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[tool.status]}`}
          >
            {tool.status}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COST_COLORS[tool.cost_tier]}`}
          >
            {COST_LABELS[tool.cost_tier]}
          </span>
        </div>

        {/* Description (clamped to 2 lines) */}
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {tool.description}
        </p>

        {/* Tags */}
        {tool.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: last verified */}
        <p className="mt-3 text-xs text-muted-foreground/70">
          Verified {verifiedDate}
        </p>
      </CardContent>
    </Card>
  )
}
