import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Lesson UI Demos | GWTH.ai",
  description: "Demo lesson page variants exploring different visual treatments.",
}

/**
 * Minimal layout for demo pages — no dashboard sidebar.
 * Just a top bar with back link and theme toggle.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link
            href="/demo"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All Variants
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
