"use client"

import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Compact inline newsletter signup form for embedding in other pages.
 * Horizontal layout: email input + subscribe button on one row.
 */
export function NewsletterInline() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Get the GWTH Weekly — one practical AI tip, every week.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            No spam. No sales pressure. Unsubscribe any time.
          </p>
        </div>
        <form
          action="#"
          method="POST"
          className="flex gap-2 sm:min-w-[340px]"
        >
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="flex-1"
          />
          <Button type="submit" size="sm" className="gap-1.5 whitespace-nowrap">
            <Mail className="size-3.5" />
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  )
}
