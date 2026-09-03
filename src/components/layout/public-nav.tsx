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

/**
 * Nav order and labels are the N9 artboard David approved (annex 15,
 * FinalHome / HN2L): institutions first, sentence case throughout (the bible
 * bans title-case labels). "The course" is the lessons link; it resolves per
 * viewer (see `lessonsHref`).
 */
const navLinks = [
  { href: "/for-institutions", label: "For institutions" },
  { href: "/for-teams", label: "For teams" },
  { href: "/lessons", label: "The course" },
  { href: "/labs", label: "Labs" },
  { href: "/pricing", label: "Pricing" },
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
  /**
   * Where the "The course" link should point for THIS viewer. Anonymous
   * visitors get `/lessons`, the public marketing page. A signed-in learner
   * with course access gets their actual course instead: clicking the lessons
   * link while logged in and landing on an advert for the thing you already
   * bought is the defect David reported on 2026-07-26. Resolved on the server
   * in `(public)/layout.tsx` for the same reason as `showLabs`.
   */
  lessonsHref: string
}

/**
 * A link is "current" for its own path and anything beneath it, so
 * /for-institutions/anything still marks "For institutions". The old exact
 * match never highlighted nested routes.
 */
function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Navigation bar for public-facing pages in the paper-first register (N12):
 * paper ground, a load-bearing hairline boundary, Public Sans links, the M2
 * selected treatment, the one mint button. Shows logo, nav links, theme
 * toggle, and log-in / primary CTA. When authenticated, shows the user avatar
 * with a dropdown instead. Responsive: hamburger sheet on mobile.
 */
export function PublicNav({ user, showLabs, lessonsHref }: PublicNavProps) {
  const pathname = usePathname()

  // Hiding a link is presentation, not protection: /labs is gated in the proxy
  // and again inside the page. This only keeps a visitor who cannot open Labs
  // from being offered them.
  const links = (
    showLabs ? navLinks : navLinks.filter((link) => link.href !== "/labs")
  ).map((link) =>
    link.href === "/lessons" ? { ...link, href: lessonsHref } : link
  )

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
        {/* Desktop row from lg: with seven links plus the controls, 768 to 1024px
            cannot hold it, so tablets get the sheet (QA finding, N12). */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const current = isCurrent(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(styles.navLink, current && styles.navLinkActive)}
              >
                {link.label}
              </Link>
            )
          })}
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
            /* Not authenticated: log in as a text link, one primary button */
            <>
              <Link
                href="/login"
                className={cn(styles.buttonText, styles.ctaDesktopOnly)}
              >
                Log in
              </Link>
              {/* Below 640px the sheet carries both CTAs; the bar keeps only
                  the toggle and the hamburger so nothing scrolls sideways. */}
              <Link
                href="/contact"
                className={cn(styles.buttonSolid, styles.ctaDesktopOnly)}
              >
                Book a walkthrough
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
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
                {links.map((link) => {
                  const current = isCurrent(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        styles.sheetLink,
                        current && styles.sheetLinkActive
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
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
                      <Link href="/contact" className={styles.buttonSolid}>
                        Book a walkthrough
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
 * SVG component which flips between light- and dark-mode inks via the
 * `--logo-wordmark` / `--logo-accent` CSS vars in `globals.css` (site ink
 * and site accent since the 2026-09-02 re-cut, bible paper-first-logo).
 */
function BrandWordmark() {
  return <LogoGwth width={160} className="h-7 w-auto sm:h-8" />
}
