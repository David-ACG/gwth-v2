import { PublicNav } from "@/components/layout/public-nav"
import { Footer } from "@/components/layout/footer"
import { getCurrentUser } from "@/lib/auth"

/**
 * Layout for public-facing pages (landing, pricing, about).
 * Includes the public navigation bar and site footer.
 * Passes auth state to the nav for login/avatar display.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav user={user ? { name: user.name, email: user.email } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
