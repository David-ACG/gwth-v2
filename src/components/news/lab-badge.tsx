import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { FlaskConical } from "lucide-react"

interface LabBadgeProps {
  /** Slug of the lab created from this article */
  labSlug: string
}

/**
 * Badge linking a news article to the lab that was created from it.
 * Only rendered when an article's labSlug is set.
 */
export function LabBadge({ labSlug }: LabBadgeProps) {
  return (
    <Link href={`/labs/${labSlug}`}>
      <Badge className="gap-1 border-0 bg-success/10 text-success hover:bg-success/20">
        <FlaskConical className="size-3" />
        Now a Lab!
      </Badge>
    </Link>
  )
}
