import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

/** Variant definition for the index page */
interface VariantInfo {
  slug: string
  name: string
  description: string
  status: "ready" | "coming"
}

const variants: VariantInfo[] = [
  {
    slug: "lesson-v1",
    name: "Documentation Clean",
    description: "react.dev inspired — flat background, left-border callouts, clean and minimal.",
    status: "ready",
  },
  {
    slug: "lesson-v2",
    name: "Card Sections",
    description: "Notion inspired — each section in a card, emoji callouts, block-based layout.",
    status: "ready",
  },
  {
    slug: "lesson-v3",
    name: "Magazine Layout",
    description: "Editorial design — wider content, full-bleed video, pull quotes, colourful callouts.",
    status: "ready",
  },
  {
    slug: "lesson-v4",
    name: "Linear Minimal",
    description: "Maximum whitespace, monochrome callouts, extreme spacing, minimal decoration.",
    status: "ready",
  },
  {
    slug: "lesson-v5",
    name: "Textbook Rich",
    description: "Card background, numbered sections, colour-coded callouts, progress breadcrumb.",
    status: "ready",
  },
  {
    slug: "lesson-v6",
    name: "Variant 6",
    description: "Coming soon.",
    status: "coming",
  },
  {
    slug: "lesson-v7",
    name: "Variant 7",
    description: "Coming soon.",
    status: "coming",
  },
  {
    slug: "lesson-v8",
    name: "Variant 8",
    description: "Coming soon.",
    status: "coming",
  },
  {
    slug: "lesson-v9",
    name: "Variant 9",
    description: "Coming soon.",
    status: "coming",
  },
  {
    slug: "lesson-v10",
    name: "Variant 10",
    description: "Coming soon.",
    status: "coming",
  },
]

/**
 * Demo index page listing all 10 lesson UI variants.
 * V1-V5 are active, V6-V10 are placeholders.
 */
export default function DemoIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Lesson UI Demo Variants
        </h1>
        <p className="mt-2 text-muted-foreground">
          Same content, different visual treatments. Each variant renders the
          &ldquo;Welcome to GWTH&rdquo; lesson using shared components with
          distinct styling.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {variants.map((v, i) => (
          <VariantCard key={v.slug} index={i + 1} variant={v} />
        ))}
      </div>
    </div>
  )
}

function VariantCard({ index, variant }: { index: number; variant: VariantInfo }) {
  const isReady = variant.status === "ready"

  const content = (
    <div
      className={`group relative rounded-lg border p-5 transition-colors ${
        isReady
          ? "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
          : "border-border/50 bg-muted/30 opacity-60"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index}
        </span>
        <h2 className="font-semibold">{variant.name}</h2>
        {!isReady && (
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{variant.description}</p>
      {isReady && (
        <ArrowRight className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  )

  if (isReady) {
    return <Link href={`/demo/${variant.slug}`}>{content}</Link>
  }

  return content
}
