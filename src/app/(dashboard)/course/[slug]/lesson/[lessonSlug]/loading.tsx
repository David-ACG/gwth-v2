import { Spinner } from "@/components/shared/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export default function LessonLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Spinner size={24} />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
      </div>
    </div>
  )
}
