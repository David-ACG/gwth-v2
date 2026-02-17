import { Spinner } from "@/components/shared/spinner"
import { Skeleton } from "@/components/ui/skeleton"

export default function LabDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Spinner size={24} />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mt-3 h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-full max-w-lg" />
      </div>
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  )
}
