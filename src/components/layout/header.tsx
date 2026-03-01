"use client"

import { Search, Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useSidebar } from "@/hooks/use-sidebar"
import { useSearch } from "@/hooks/use-search"
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions/auth"

interface DashboardHeaderProps {
  /** Authenticated user's display name */
  userName?: string | null
  /** Authenticated user's email */
  userEmail?: string | null
  /** Authenticated user's avatar URL (from OAuth provider) */
  userAvatarUrl?: string | null
}

/**
 * Dashboard header with breadcrumb, search trigger, theme toggle, and user dropdown.
 */
export function DashboardHeader({ userName, userEmail, userAvatarUrl }: DashboardHeaderProps) {
  const { isMobile, open: openSidebar } = useSidebar()
  const { open: openSearch } = useSearch()

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

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

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-full">
              <Avatar className="size-8">
                {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName ?? "User"} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName ?? "User"}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/profile" className="cursor-pointer">
                <User className="mr-2 size-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
