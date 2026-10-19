"use client"

export function PrintButton({ className, label }: { className?: string; label: string }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {label}
    </button>
  )
}
