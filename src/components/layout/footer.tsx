import Link from "next/link"
import { APP_NAME } from "@/lib/config"

const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/for-teams", label: "For Teams" },
      { href: "/tech-radar", label: "Tech Radar" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/labs", label: "Free Labs" },
      { href: "/why-gwth", label: "Why GWTH" },
      { href: "/news", label: "News" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/about", label: "About GWTH" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
]

/**
 * Site footer for public pages.
 * Shows logo, tagline, organized link columns, and copyright.
 */
export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-gradient">
              {APP_NAME}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Learn to build apps, automate workflows, and solve real problems
              using AI — all in plain English. No coding required.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Independent. No sponsors. No ads. No vendor partnerships.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
