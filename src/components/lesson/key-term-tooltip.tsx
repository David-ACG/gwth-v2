"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KeyTermTooltipProps {
  /** The term displayed inline */
  term: string
  /** Definition shown in the tooltip */
  definition: string
}

/**
 * Inline key term with a dotted underline and tooltip definition.
 * Accessible via keyboard (tabIndex 0) and aria-describedby.
 * Uses shadcn Tooltip component under the hood.
 */
export function KeyTermTooltip({ term, definition }: KeyTermTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="cursor-help rounded-sm border-b border-dashed border-accent/50 bg-accent/5 px-0.5"
          >
            {term}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-sm"
        >
          {definition}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
