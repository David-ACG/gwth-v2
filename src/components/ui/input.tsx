/* A field well is the QUIET fill, in both modes.
 *
 * bead gwth-launch-88z.32.15, bible paper-first-tokens. David, on /contact in
 * dark mode: "it needs some light colour as well, like maybe a lighter
 * background to the boxes." The hand-written fields were fixed one file at a
 * time; these shared primitives were not. Three routes reach them today, and a
 * route reaching them is how they get on a page David sees: /settings, /news
 * and /access. Eight other components import them and are not currently
 * rendered by any route.
 *
 * What was here was shadcn's default, and it was wrong in both modes rather
 * than in one: `bg-transparent` means a field on a card is the CARD, so in
 * light mode the box had no fill of its own at all, and `dark:bg-input/30`
 * means --v-line at 30%, which in dark mode landed on a fill that belonged to
 * no token and sat lighter than every hand-written field beside it.
 *
 * Placeholder ink is --v-soft, not --v-muted: --v-muted on the quiet fill
 * measures 4.31:1 light and 4.05:1 dark, under the 4.5:1 text bar
 * (src/app/paper-first-tokens.test.ts).
 */
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[var(--v-soft)] selection:bg-primary selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-md border bg-[var(--v-quiet)] px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
