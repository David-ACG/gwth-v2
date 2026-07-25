"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, AlertCircle } from "lucide-react"
import { verifySitePassword } from "@/lib/actions/site-access"

/**
 * Site-password form. Rendered only when `SITE_PASSWORD` is set: the server
 * component in `page.tsx` calls `notFound()` otherwise, so this never appears
 * on a deploy that has no password gate (W25).
 */
export function AccessForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("from") || "/"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    startTransition(async () => {
      const result = await verifySitePassword(password)
      if (result.success) {
        router.push(redirectTo)
        router.refresh()
      } else {
        setError(result.error || "Incorrect password")
        setPassword("")
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">GWTH.ai Preview</CardTitle>
          <CardDescription>
            This site is currently in private preview. Enter the access password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter access password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending || !password}>
              {isPending ? "Verifying..." : "Enter Site"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
