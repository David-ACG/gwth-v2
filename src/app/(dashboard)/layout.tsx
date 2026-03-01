import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/header"
import { SearchPalette } from "@/components/search/search-palette"
import { getCurrentUser } from "@/lib/auth"

/**
 * Layout for authenticated dashboard pages.
 * Includes collapsible sidebar and dashboard header with breadcrumbs.
 * Fetches the current user and passes name/email to the header.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={user?.name} userEmail={user?.email} userAvatarUrl={user?.avatarUrl} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
      <SearchPalette />
    </div>
  )
}
