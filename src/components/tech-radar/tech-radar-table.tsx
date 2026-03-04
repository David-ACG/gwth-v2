"use client"

import { useState, useMemo } from "react"
import type { TechRadarTool } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExternalLink, Search, Flame, X } from "lucide-react"

/** Props for the TechRadarTable component */
interface TechRadarTableProps {
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

/**
 * Client-side searchable/filterable table view of Tech Radar tools.
 * Replaces the card grid with a denser, scannable layout.
 */
export function TechRadarTable({ tools, categories }: TechRadarTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const filteredTools = useMemo(() => {
    let results = tools

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (selectedCategory !== "all") {
      results = results.filter((t) => t.category === selectedCategory)
    }

    if (selectedStatus !== "all") {
      results = results.filter((t) => t.status === selectedStatus)
    }

    return results
  }, [tools, searchQuery, selectedCategory, selectedStatus])

  const hasActiveFilters =
    selectedCategory !== "all" || selectedStatus !== "all" || searchQuery.trim()

  function clearAllFilters() {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTools.length} of {tools.length} tools
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="size-3" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Cost</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.map((tool) => (
                <tr
                  key={tool.slug}
                  className="border-b transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {tool.name}
                      </a>
                      <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                      {tool.is_hot && (
                        <Flame
                          className="size-3.5 shrink-0 text-orange-500 dark:text-orange-400"
                          aria-label="Trending"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tool.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[tool.status]}`}
                    >
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COST_COLORS[tool.cost_tier]}`}
                    >
                      {COST_LABELS[tool.cost_tier]}
                    </span>
                  </td>
                  <td className="hidden max-w-xs truncate px-4 py-3 text-muted-foreground md:table-cell">
                    {tool.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
