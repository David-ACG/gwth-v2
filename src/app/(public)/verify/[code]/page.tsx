import type { Metadata } from "next"
import { notFound } from "next/navigation"
import QRCode from "qrcode"
import { getPublicCredentialByCode } from "@/lib/data/credentials"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import {
  VerifyFde,
  VerifyFdeDisabled,
} from "@/components/marketing/verify-fde/verify-fde"

type PageProps = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  if (!ENABLE_GWTH_SCORE) {
    return {
      title: "Public Credential Verification Disabled",
      description: "Public credential verification is disabled for beta.",
    }
  }

  const credential = await getPublicCredentialByCode(code)
  if (!credential) return { title: "Credential Not Found" }

  return {
    title: `${credential.learnerName} GWTH Score`,
    description: `Verified GWTH credential for ${credential.learnerName}.`,
  }
}

export default async function VerifyCredentialPage({ params }: PageProps) {
  if (!ENABLE_GWTH_SCORE) {
    return <VerifyFdeDisabled />
  }

  const { code } = await params
  const credential = await getPublicCredentialByCode(code)

  if (!credential) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gwth.ai"
  const verifyUrl = `${siteUrl}/verify/${credential.verificationCode}`
  // QR module/background colours match the register's ink-teal on cream
  // paper (the QR is a generated raster, so it cannot read CSS tokens).
  const qrCode = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 180,
    color: {
      dark: "#1f3a37",
      light: "#ece8d2",
    },
  })

  return (
    <VerifyFde credential={credential} qrCode={qrCode} verifyUrl={verifyUrl} />
  )
}
