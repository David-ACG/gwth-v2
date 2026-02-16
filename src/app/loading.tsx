import { Skeleton } from "@/components/ui/skeleton"

/**
 * Root loading skeleton. Shown while the initial page content loads.
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  )
}
