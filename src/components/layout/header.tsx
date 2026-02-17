"use client"

import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useSidebar } from "@/hooks/use-sidebar"
import { useSearch } from "@/hooks/use-search"
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/**
 * Dashboard header with breadcrumb, search trigger, theme toggle, and user avatar.
 */
export function DashboardHeader() {
  const { isMobile, open: openSidebar } = useSidebar()
  const { open: openSearch } = useSearch()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg md:px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={openSidebar}
          aria-label="Open navigation"
          className="size-8"
        >
          <Menu className="size-5" />
        </Button>
      )}

      <BreadcrumbNav />

      <div className="ml-auto flex items-center gap-2">
        {/* Search trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={openSearch}
          className="hidden gap-2 text-muted-foreground sm:flex"
        >
          <Search className="size-4" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={openSearch}
          className="size-8 sm:hidden"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User avatar */}
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">D</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
