"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/actions/auth"

const navLinks = [
  { href: "/labs", label: "Free Labs" },
  { href: "/lessons", label: "Lessons" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for-teams", label: "For Teams" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
]

interface PublicNavProps {
  /** Authenticated user info, or null if not logged in */
  user: { name: string; email: string } | null
}

/**
 * Navigation bar for public-facing pages.
 * Shows logo, nav links, theme toggle, and login/signup CTAs.
 * When authenticated, shows user avatar with dropdown instead of login buttons.
 * Responsive: hamburger menu on mobile.
 */
export function PublicNav({ user }: PublicNavProps) {
  const pathname = usePathname()

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : ""

  return (
    <header
      data-testid="public-nav"
      data-section="nav"
      className="sticky top-0 z-50 border-b border-[#E5DFD2] bg-[#FBF9F4]/95 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="GWTH.ai home" className="flex items-center">
          <BrandWordmark />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[#22301F]"
                  : "text-[#6F7569] hover:text-[#22301F]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            /* Authenticated: show avatar dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
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
          ) : (
            /* Not authenticated: show login + signup buttons */
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden rounded-[4px] text-[#3F4A3B] hover:bg-[#F5F0E6] hover:text-[#22301F] sm:inline-flex"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-[4px] bg-[#22301F] text-[#FBF9F4] hover:bg-[#2A5D69]"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-[4px] text-[#22301F] hover:bg-[#F5F0E6]"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      pathname === link.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 border-t" />
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Dashboard
                    </Link>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => signOut()}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Log in
                    </Link>
                    <Button asChild className="mt-2">
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

/**
 * GWTH.ai wordmark for the public nav. Renders the inline `<LogoGwth />`
 * SVG component which auto-flips between light- and dark-mode wordmark
 * colours via the locked `--logo-wordmark` / `--logo-accent` CSS vars
 * defined in `globals.css`. No theme-detection JS / hydration dance
 * required, and no bitmap fetch.
 */
function BrandWordmark() {
  return (
    <LogoGwth
      width={160}
      wordmarkColor="#22301F"
      accentColor="#A94C2E"
      className="h-7 w-auto sm:h-8"
    />
  )
}
