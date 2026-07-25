import Link from "next/link"
import { FOOTER_COLS } from "@/components/marketing/data"

/**
 * MarketingFooter — page-level footer for the marketing homepage. Uses
 * the FOOTER_COLS data array so the link set is a single source of
 * truth. The brand column carries the locked tagline; the bottom strip
 * shows a server-rendered copyright year masked for snapshot stability.
 *
 * This is intentionally separate from the global Footer used elsewhere
 * in the app — those pages have their own layout requirements.
 */
export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      data-section="footer"
      className="border-t border-border bg-card py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold text-foreground">GWTH.ai</p>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Grow With The Help of AI. A UK-first applied AI programme for
              working adults. Independent. UK-based. No sponsors. No ads. No vendor
              partnerships.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title} data-testid="footer-col">
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {col.title}
              </span>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-testid="footer-link"
                      className="text-sm text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            <span data-mask="date">© {year}</span> GWTH.ai · Based in the United
            Kingdom · Built in the UK. For the world.
          </span>
          <span className="font-mono">v1.0</span>
        </div>
      </div>
    </footer>
  )
}
