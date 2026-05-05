import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import QRCode from "qrcode"
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPublicCredentialByCode } from "@/lib/data/credentials"

type PageProps = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const credential = await getPublicCredentialByCode(code)
  if (!credential) return { title: "Credential Not Found" }

  return {
    title: `${credential.learnerName} GWTH Score`,
    description: `Verified GWTH credential for ${credential.learnerName}.`,
  }
}

export default async function VerifyCredentialPage({ params }: PageProps) {
  const { code } = await params
  const credential = await getPublicCredentialByCode(code)
  if (!credential) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gwth.ai"
  const verifyUrl = `${siteUrl}/verify/${credential.verificationCode}`
  const qrCode = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 180,
    color: {
      dark: "#143b37",
      light: "#f7f6f1",
    },
  })

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl flex-col justify-center px-4 py-12">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Public GWTH credential verification
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1">
              <CheckCircle2 className="size-3.5 text-[var(--status-completed)]" />
              Verified
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {credential.learnerName}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              This learner has a public GWTH Score for {credential.courseTitle}.
              Scores reflect completed lessons, Q&A performance, and current
              applied AI progress.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  GWTH Score
                </p>
                <p className="mt-1 text-3xl font-bold text-primary">
                  {credential.gwthScore}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Benchmark
                </p>
                <p className="mt-1 font-semibold">{credential.percentileLabel}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Trajectory
                </p>
                <p className="mt-1 font-semibold">{credential.trajectoryLabel}</p>
              </div>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Last updated{" "}
              {credential.updatedAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <Image
              src={qrCode}
              alt={`QR code for ${credential.learnerName}'s GWTH verification URL`}
              width={176}
              height={176}
              unoptimized
              className="size-44 rounded-lg border bg-muted p-2"
            />
            <Button variant="outline" size="sm" asChild>
              <a href={verifyUrl}>
                Open verification URL
                <ExternalLink className="ml-2 size-3.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
