"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  BarChart3,
  Bookmark,
  Bell,
  Settings,
  User,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/lib/config"

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/course/applied-ai-skills", label: "The Course", icon: BookOpen },
  { href: "/labs", label: "Labs", icon: FlaskConical },
  { href: "/progress", label: "Progress", icon: BarChart3 },
]

const secondaryNavItems = [
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

/**
 * Dashboard sidebar with collapsible navigation.
 * Shows as a persistent sidebar on desktop, Sheet overlay on mobile.
 */
export function Sidebar() {
  const { isOpen, isMobile, toggle, close } = useSidebar()
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo + collapse toggle */}
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen && (
          <Link href="/dashboard" className="text-lg font-bold text-gradient">
            GWTH.ai
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="size-8"
        >
          {isOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeft className="size-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4" aria-label="Main navigation">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? close : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="size-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Secondary navigation */}
      <nav className="space-y-1 px-2 py-4" aria-label="Secondary navigation">
        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? close : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="size-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: persistent sidebar
  return (
    <aside
      className="sticky top-0 h-screen shrink-0 border-r bg-sidebar transition-[width] duration-200"
      style={{ width: isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
    >
      {sidebarContent}
    </aside>
  )
}
