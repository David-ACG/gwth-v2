"use client"

import { Info, AlertTriangle, Lightbulb, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { CollapsibleSection } from "./collapsible-section"

/** Callout variant type */
export type CalloutVariant = "note" | "warning" | "tip" | "deep-dive"

interface CalloutBoxProps {
  /** Which callout style to render */
  variant: CalloutVariant
  /** Optional custom title (deep-dive variant uses this) */
  title?: string
  /** Content inside the callout */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/** Style config per variant */
const variantConfig: Record<
  CalloutVariant,
  {
    icon: React.ElementType
    label: string
    containerClass: string
    iconClass: string
  }
> = {
  note: {
    icon: Info,
    label: "Note",
    containerClass: "border border-primary/25 bg-primary/5",
    iconClass: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    containerClass: "border border-warning/35 bg-warning/5",
    iconClass: "text-warning",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    containerClass: "border border-success/25 bg-success/5",
    iconClass: "text-success",
  },
  "deep-dive": {
    icon: BookOpen,
    label: "Deep Dive",
    containerClass: "border border-accent/25 bg-accent/5",
    iconClass: "text-accent",
  },
}

/**
 * Styled callout box with 4 variants: note, warning, tip, deep-dive.
 * The deep-dive variant is collapsible — click the title to toggle.
 */
export function CalloutBox({
  variant,
  title,
  children,
  className,
}: CalloutBoxProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.label

  if (variant === "deep-dive") {
    return (
      <div
        className={cn(
          "my-5 rounded-lg",
          config.containerClass,
          className,
        )}
      >
        <CollapsibleSection
          title={
            <span className="flex items-center gap-2">
              <Icon className={cn("size-4 shrink-0", config.iconClass)} />
              <span className="text-sm font-semibold">{displayTitle}</span>
            </span>
          }
          className="px-4 py-3"
        >
          <div className="pb-3 pl-6 pr-1 text-sm leading-relaxed">
            {children}
          </div>
        </CollapsibleSection>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "my-5 rounded-lg px-5 py-4",
        config.containerClass,
        className,
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className={cn("size-4 shrink-0", config.iconClass)} />
        <span className="text-sm font-semibold">{displayTitle}</span>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}
