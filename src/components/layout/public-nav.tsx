"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { ENABLE_NEWS } from "@/lib/config"
import styles from "./public-nav-fde.module.css"

const navLinks = [
  { href: "/labs", label: "Free Labs" },
  { href: "/lessons", label: "Lessons" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for-teams", label: "For Teams" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
].filter((link) => ENABLE_NEWS || link.href !== "/news")

interface PublicNavProps {
  /** Authenticated user info, or null if not logged in */
  user: { name: string; email: string } | null
  /**
   * Whether to show the Labs link (W25). Resolved on the server in
   * `(public)/layout.tsx` and passed down: this is a client component, so
   * `process.env.PRIVATE_CONTENT_MODE` is simply undefined here and reading it
   * would both hide the link forever and produce an SSR/hydration mismatch on
   * every marketing page.
   */
  showLabs: boolean
}

/**
 * Navigation bar for public-facing pages, in the FDE journal register
 * (DESIGN_FDE.md §5.9): solid sage bar, hairline bottom rule, mono links,
 * square §5.3 buttons. Shows logo, nav links, theme toggle, and
 * login/signup CTAs. When authenticated, shows user avatar with dropdown
 * instead of login buttons. Responsive: hamburger menu on mobile.
 */
export function PublicNav({ user, showLabs }: PublicNavProps) {
  const pathname = usePathname()

  // Hiding a link is presentation, not protection: /labs is gated in the proxy
  // and again inside the page. This only keeps a visitor who cannot open Labs
  // from being offered them.
  const links = showLabs
    ? navLinks
    : navLinks.filter((link) => link.href !== "/labs")

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
      className={cn(styles.shell, styles.header, "sticky top-0 z-50")}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="GWTH.ai home" className="flex items-center">
          <BrandWordmark />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                styles.navLink,
                pathname === link.href && styles.navLinkActive
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className={cn("size-9", styles.iconButton)} />
          {user ? (
            /* Authenticated: show avatar dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-8", styles.avatarButton)}
                >
                  <Avatar className={cn("size-8", styles.avatar)}>
                    <AvatarFallback className={styles.avatarFallback}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn("w-56", styles.shell, styles.menu)}
              >
                <div className="px-2 py-1.5">
                  <p className={styles.menuName}>{user.name}</p>
                  <p className={styles.menuMeta}>{user.email}</p>
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
                  className={cn("cursor-pointer", styles.menuDanger)}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Not authenticated: show login + signup buttons */
            <>
              <Link
                href="/login"
                className={cn(styles.buttonOutline, styles.ctaDesktopOnly)}
              >
                Log in
              </Link>
              <Link href="/signup" className={styles.buttonSolid}>
                Sign up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={styles.iconButton}
              >
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-describedby={undefined}
              className={cn("w-72 p-6", styles.shell, styles.sheet)}
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className={cn("mt-8", styles.sheetNav)}>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      styles.sheetLink,
                      pathname === link.href && styles.sheetLinkActive
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className={styles.sheetActions}>
                  {user ? (
                    <>
                      <Link href="/dashboard" className={styles.buttonOutline}>
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        className={styles.buttonSolid}
                        onClick={() => signOut()}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className={styles.buttonOutline}>
                        Log in
                      </Link>
                      <Link href="/signup" className={styles.buttonSolid}>
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
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
  return <LogoGwth width={160} className="h-7 w-auto sm:h-8" />
}
