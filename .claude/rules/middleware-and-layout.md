---
paths:
  - "src/middleware.ts"
  - "src/app/layout.tsx"
---

<!-- SENTINEL: rule=middleware-and-layout, salt=ml-2H6r -->

# Middleware & Root Layout

Loaded automatically when editing `src/middleware.ts` or `src/app/layout.tsx`.

## Middleware

Protect dashboard routes from unauthenticated access:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth check will be implemented when backend is connected
  // For now, allow all requests through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/labs/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/bookmarks/:path*",
    "/notifications/:path*",
  ],
};
```

## Root Layout

The root layout wires up fonts, providers, and global UI:

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";
import { RootProvider } from "@/providers/root-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <RootProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </RootProvider>
      </body>
    </html>
  );
}
```
