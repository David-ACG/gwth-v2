import { Spinner } from "@/components/shared/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export default function LabsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Spinner size={24} />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}
