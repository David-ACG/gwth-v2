import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
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

export const metadata: Metadata = {
  title: {
    default: "GWTH.ai | Learn to Build with AI",
    template: "%s | GWTH.ai",
  },
  description:
    "Master AI development with hands-on courses, labs, and real-world projects.",
  metadataBase: new URL("https://gwth.ai"),
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
  robots: { index: true, follow: true },
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
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
