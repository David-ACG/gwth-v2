import type { Metadata } from "next"
import { Bitter, JetBrains_Mono, Public_Sans } from "next/font/google"
import Script from "next/script"
import { RootProvider } from "@/providers/root-provider"
import { RouteProgress } from "@/components/shared/route-progress"
import { WebVitals } from "@/components/shared/web-vitals"
import { Toaster } from "sonner"
import "./globals.css"

// Paper-first register (N9 decision, annex 15; bible paper-first-register,
// 2026-09-03). Exactly two web faces: Bitter for headlines and the italic
// accent, Public Sans for body copy, labels, metadata and every control.
// Source Serif 4, Source Sans 3, Inter and the JetBrains Mono LABEL face are
// retired. globals.css maps these into --font-serif / --font-sans; every
// .shell inherits them, so removing a loader here silently drops the face
// on every page.
const bitter = Bitter({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bitter",
  display: "swap",
})

const publicSans = Public_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-public-sans",
  display: "swap",
})

// Monospaced CONTENT only (code blocks, terminal output): the bible keeps a
// monospace face for that and bans it as a label or metadata face.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "GWTH.ai | Applied AI Course for the UK",
    template: "%s | GWTH.ai",
  },
  description:
    "A UK-focused applied AI course for beginners moving from ChatGPT basics to practical research, building, automation, and verifiable AI capability.",
  metadataBase: new URL("https://gwth.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GWTH.ai | Applied AI Course for the UK",
    description:
      "A UK-focused applied AI course for beginners moving from ChatGPT basics to practical research, building, automation, and verifiable AI capability.",
    url: "https://gwth.ai",
    siteName: "GWTH.ai",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  // Pre-launch lockdown blocks indexing. ALLOW_INDEXING=1 (set by the
  // Lighthouse harness; will also drop in for production launch) inverts
  // the default so the SEO is-crawlable audit can pass.
  robots:
    process.env.ALLOW_INDEXING === "1"
      ? { index: true, follow: true }
      : { index: false, follow: false },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${bitter.variable} ${publicSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          defer
          data-domain="gwth.ai"
          src="https://analytics.gwth.ai/js/script.outbound-links.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        <RootProvider>
          <RouteProgress />
          <WebVitals />
          {children}
          <Toaster richColors position="bottom-right" />
        </RootProvider>
      </body>
    </html>
  )
}
