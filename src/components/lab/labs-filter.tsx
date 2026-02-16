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
import { Search } from "lucide-react"

interface LabsFilterProps {
  /** Available lab categories */
  categories: string[]
  /** Available technologies */
  technologies: string[]
}

/**
 * Filter bar for the labs listing page.
 * Syncs filter state to URL search params.
 */
export function LabsFilter({ categories, technologies }: LabsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/labs?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search labs..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParams("q", e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        defaultValue={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParams("category", v)}
      >
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
      <Select
        defaultValue={searchParams.get("difficulty") ?? "all"}
        onValueChange={(v) => updateParams("difficulty", v)}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("technology") ?? "all"}
        onValueChange={(v) => updateParams("technology", v)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Technology" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Technologies</SelectItem>
          {technologies.map((tech) => (
            <SelectItem key={tech} value={tech}>
              {tech}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
