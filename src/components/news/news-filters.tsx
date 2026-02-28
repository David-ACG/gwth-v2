"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { NEWS_CATEGORIES } from "@/lib/config"
import type { NewsSortOption } from "@/lib/types"
import { cn } from "@/lib/utils"

interface NewsFiltersProps {
  /** Available categories for the dropdown */
  categories: string[]
  /** Available tags (reserved for future use) */
  tags: string[]
}

const SORT_OPTIONS: { value: NewsSortOption; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
]

/**
 * Filter bar for the news listing page.
 * Includes sort tabs (Hot/New/Top), category dropdown, and search input.
 * Syncs all filter state to URL search params for shareable filtered views.
 */
export function NewsFilters({ categories }: NewsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = (searchParams.get("sort") as NewsSortOption) ?? "hot"

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filters change
    params.delete("page")
    router.push(`/news?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Sort tabs */}
      <div className="flex items-center gap-1">
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentSort === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateParams("sort", option.value === "hot" ? "" : option.value)}
            className={cn(
              "text-sm",
              currentSort === option.value && "font-semibold"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateParams("q", e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          defaultValue={searchParams.get("category") ?? "all"}
          onValueChange={(v) => updateParams("category", v)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {NEWS_CATEGORIES[cat as keyof typeof NEWS_CATEGORIES]?.label ??
                  cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
