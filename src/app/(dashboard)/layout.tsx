import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/header"
import { SearchPalette } from "@/components/search/search-palette"
import { ReportProblemLauncher } from "@/components/feedback/report-problem-launcher"
import { getCurrentUser } from "@/lib/auth"
import styles from "./dashboard-fde.module.css"

/**
 * Layout for authenticated dashboard pages.
 * Includes collapsible sidebar and dashboard header with breadcrumbs.
 * Fetches the current user and passes name/email to the header.
 *
 * The frame carries the FDE journal register shell (dashboard-fde.module.css):
 * it grounds the chrome on FDE paper and declares the scoped --v-* tokens
 * that descendant dashboard pages inherit (DESIGN_FDE.md §2/§8).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className={`${styles.shell} flex min-h-screen`}>
      <Sidebar />
      {/* min-w-0: without it this flex child keeps its default min-width:auto
          (= min-content of the widest descendant, e.g. a code block or the
          streak calendar), which balloons the whole page and produces the
          mobile horizontal scroll. min-w-0 lets it shrink so the inner
          overflow-x-auto scroll containers engage instead (gwth-launch-sg6). */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader userName={user?.name} userEmail={user?.email} userAvatarUrl={user?.avatarUrl} />
        <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
      <SearchPalette />
      <ReportProblemLauncher />
    </div>
  )
}
