import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LabNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl font-bold text-muted-foreground/30">404</div>
      <h1 className="mt-4 text-2xl font-semibold">Lab not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        This lab doesn&apos;t exist or has been removed.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/labs">Browse Labs</Link>
      </Button>
    </div>
  )
}
