"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Dashboard Error</h1>
      <p className="max-w-md text-muted-foreground">
        Something went wrong loading this page. Please try again.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-2 max-w-lg overflow-auto rounded bg-muted p-3 text-left text-xs">
          {error.message}
        </pre>
      )}
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
