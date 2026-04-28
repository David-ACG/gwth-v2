import type { Metadata } from "next"
import {
  Inter,
  JetBrains_Mono,
  Albert_Sans,
  Geist,
  Geist_Mono,
  Source_Serif_4,
  Manrope,
  Figtree,
} from "next/font/google"
import Script from "next/script"
import { RootProvider } from "@/providers/root-provider"
import { RouteProgress } from "@/components/shared/route-progress"
import { WebVitals } from "@/components/shared/web-vitals"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

// Redesign-only fonts. Loaded globally so any /redesign variant can
// swap typography by setting `--font-sans`/`--font-mono`/`--font-serif`
// inside its `[data-variant]` scope. Subsetted to latin to keep the
// payload small.
const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "GWTH.ai | Learn to Build with AI",
    template: "%s | GWTH.ai",
  },
  description:
    "Master AI development with hands-on courses, labs, and real-world projects.",
  metadataBase: new URL("https://gwth.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GWTH.ai | Learn to Build with AI",
    description:
      "Master AI development with hands-on courses, labs, and real-world projects.",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${albertSans.variable} ${geist.variable} ${geistMono.variable} ${sourceSerif.variable} ${manrope.variable} ${figtree.variable}`}
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
