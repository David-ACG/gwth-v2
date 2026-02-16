import Link from "next/link"

/**
 * Layout for auth pages (login, signup, forgot-password).
 * Centered card layout with a logo link back to the landing page.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold text-gradient"
      >
        GWTH.ai
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
