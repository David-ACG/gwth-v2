import { cn } from "@/lib/utils"

/**
 * Placeholder block shown while a route segment loads.
 *
 * Uses `bg-muted`, NOT `bg-accent`. This theme's `--accent` is a saturated
 * green (`oklch(0.65 0.16 165)` light, `oklch(0.75 0.14 165)` dark), so the
 * shadcn default painted every route transition as a flash of bright green in
 * the shape of the incoming layout — visible on every dashboard, course and
 * lesson navigation. `--muted` is the neutral surface token and is what a
 * placeholder should read as in both themes.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
