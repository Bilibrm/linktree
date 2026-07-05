import type { Metadata, Viewport } from "next"
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
})

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://linknest.app"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "LinkNest — Your corner of the web",
  description:
    "LinkNest gives you one page to share everything you are. Add links, buttons, media galleries, videos, forms, countdown timers, and analytics — total design freedom, no code required.",
  openGraph: {
    title: "LinkNest — Your corner of the web",
    description:
      "One page to share everything you are. Links, media, forms, countdowns, analytics — total design freedom.",
    url: baseUrl,
    siteName: "LinkNest",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
