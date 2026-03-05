import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatDuration } from "@/lib/utils"
import type { Lab } from "@/lib/types"

interface LabCardProps {
  /** The lab to display */
  lab: Lab
  /** User's progress (0-1). Omit to hide the progress indicator. */
  progress?: number
}

/**
 * Card component for displaying a lab with thumbnail image,
 * difficulty badge, technology pills, and duration.
 */
export function LabCard({ lab, progress }: LabCardProps) {
  return (
    <Link href={`/labs/${lab.slug}`}>
      <Card className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        {lab.image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={lab.image}
              alt={lab.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div
            className="h-2 rounded-t-lg"
            style={{ backgroundColor: lab.color }}
          />
        )}
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {lab.difficulty}
            </Badge>
            {lab.isPremium && (
              <Badge className="text-xs">Pro</Badge>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold group-hover:text-primary transition-colors">
            {lab.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {lab.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lab.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-xs font-normal"
              >
                {tech}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {formatDuration(lab.duration)}
          </div>
          {progress !== undefined && progress > 0 && (
            <div className="mt-2 text-xs font-medium text-primary">
              {Math.round(progress * 100)}% complete
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
