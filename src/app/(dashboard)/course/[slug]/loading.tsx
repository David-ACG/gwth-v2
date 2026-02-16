import { Skeleton } from "@/components/ui/skeleton"

export default function CourseLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-3 h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-full max-w-lg" />
        <Skeleton className="mt-4 h-2 w-64" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    </div>
  )
}
