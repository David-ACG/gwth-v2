import { Spinner } from "@/components/shared/spinner"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for the news feed page.
 * Matches the header + filter bar + card list layout.
 */
export default function NewsLoading() {
  return (
    <>
      {/* Header skeleton */}
      <section className="border-b bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
      </section>

      {/* Feed skeleton */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
          {/* Filter bar skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-8 w-14" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Card skeletons */}
          <div className="flex items-center gap-2">
            <Spinner size={20} />
            <span className="text-sm text-muted-foreground">
              Loading articles...
            </span>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
