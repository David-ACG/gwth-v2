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
import { mockCourses, mockLabs, mockNewsArticles } from "@/lib/data/mock-data"

const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
]

/**
 * Cmd+K search palette for finding courses, lessons, and labs.
 * Uses shadcn Command component with fuzzy matching.
 */
export function SearchPalette() {
  const { isOpen, close } = useSearch()
  const router = useRouter()
  const [, setQuery] = useState("")

  function navigateTo(href: string) {
    close()
    router.push(href)
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <CommandInput
        placeholder="Search lessons, labs, pages..."
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Course">
          {mockCourses.map((course) => (
            <CommandItem
              key={course.id}
              value={course.title}
              onSelect={() => navigateTo(`/course/${course.slug}`)}
            >
              <BookOpen className="mr-2 size-4" />
              {course.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Labs">
          {mockLabs.map((lab) => (
            <CommandItem
              key={lab.id}
              value={lab.title}
              onSelect={() => navigateTo(`/labs/${lab.slug}`)}
            >
              <FlaskConical className="mr-2 size-4" />
              {lab.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="News">
          {mockNewsArticles
            .filter((a) => a.status === "published")
            .map((article) => (
              <CommandItem
                key={article.id}
                value={article.title}
                onSelect={() => navigateTo(`/news/${article.slug}`)}
              >
                <Newspaper className="mr-2 size-4" />
                {article.title}
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandGroup heading="Quick Links">
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
