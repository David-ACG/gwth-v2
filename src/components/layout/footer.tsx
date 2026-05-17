import Link from "next/link"
import { APP_NAME } from "@/lib/config"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"

const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/why-gwth", label: "Why GWTH" },
      { href: "/for-teams", label: "For Teams" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/labs", label: "Free Labs" },
      { href: "/lessons", label: "Lessons" },
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
 * Shows logo, tagline, organised link columns, and copyright.
 */
export function Footer() {
  return (
    <footer
      data-section="footer"
      className="border-t border-[#E5DFD2] bg-[#F5F0E6] text-[#22301F]"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label={`${APP_NAME} home`} className="inline-flex">
              <LogoGwth
                width={150}
                wordmarkColor="#22301F"
                accentColor="#A94C2E"
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#3F4A3B]">
              UK-focused applied AI training. Learn to build apps, automate
              workflows, research faster, analyse data, and prove your progress.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#948A76]">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#3F4A3B] transition-colors hover:text-[#2A5D69]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-[#D4CCBA] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[#6F7569]">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-xs text-[#6F7569]">
              Independent. UK-based. No sponsors. No ads. No vendor partnerships.
            </p>
            <p className="text-xs text-[#6F7569]">
              Based in the United Kingdom.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
