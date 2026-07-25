"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useSearch } from "@/hooks/use-search"
import { BookOpen, FlaskConical, Newspaper, BarChart3, Settings, User } from "lucide-react"
import type { SearchIndex } from "@/lib/data/search-index"
import styles from "./search-palette-fde.module.css"

const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
]

/** Props for {@link SearchPalette}. */
export interface SearchPaletteProps {
  /**
   * Slim navigation index built on the server by `getSearchIndex()`. Passed as
   * a prop rather than imported: importing the content modules here bundled
   * 308 KB of real lab prose into a public `/_next/static` chunk that no
   * server-side gate can protect (W25).
   */
  index: SearchIndex
}

/**
 * Cmd+K search palette for finding courses, lessons, and labs.
 * Uses shadcn Command component with fuzzy matching.
 */
export function SearchPalette({ index }: SearchPaletteProps) {
  const { isOpen, close } = useSearch()
  const router = useRouter()
  const [, setQuery] = useState("")

  function navigateTo(href: string) {
    close()
    router.push(href)
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      className={`${styles.shell} ${styles.palette}`}
    >
      <CommandInput
        placeholder="Search lessons, labs, pages..."
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Course">
          {index.courses.map((entry) => (
            <CommandItem
              key={entry.id}
              value={entry.title}
              onSelect={() => navigateTo(entry.href)}
            >
              <BookOpen className="mr-2 size-4" />
              {entry.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Labs">
          {index.labs.map((entry) => (
            <CommandItem
              key={entry.id}
              value={entry.title}
              onSelect={() => navigateTo(entry.href)}
            >
              <FlaskConical className="mr-2 size-4" />
              {entry.title}
            </CommandItem>
          ))}
        </CommandGroup>

        {index.news.length > 0 && (
          <CommandGroup heading="News">
            {index.news.map((entry) => (
              <CommandItem
                key={entry.id}
                value={entry.title}
                onSelect={() => navigateTo(entry.href)}
              >
                <Newspaper className="mr-2 size-4" />
                {entry.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Quick links">
          {quickLinks.map((link) => (
            <CommandItem
              key={link.href}
              value={link.label}
              onSelect={() => navigateTo(link.href)}
            >
              <link.icon className="mr-2 size-4" />
              {link.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
