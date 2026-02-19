import { ThemeProvider } from "@/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DevStateSwitcher } from "@/components/dev/state-switcher"

/**
 * Composes all application-level providers.
 * Add new providers here as the app grows (e.g., auth, query client).
 */
export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        {children}
        <DevStateSwitcher />
      </TooltipProvider>
    </ThemeProvider>
  )
}
