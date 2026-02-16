import { PublicNav } from "@/components/layout/public-nav"
import { Footer } from "@/components/layout/footer"

/**
 * Layout for public-facing pages (landing, pricing, about).
 * Includes the public navigation bar and site footer.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
