import { SITE_URL } from "@/lib/site"
import type { Metadata, Viewport } from "next"
import { Archivo } from "next/font/google"
import "./globals.css"
import "./themes.css"
import { Toaster } from "@/components/ui/sonner"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

// One family, used through its width axis (DESIGN_SYSTEM.md §4).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
})

const baseUrl = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "LinkNest — One page for all of it",
  description:
    "LinkNest is a free, open-source link-in-bio page. Claim a name, stack links, images, forms and countdowns, and share one URL.",
  openGraph: {
    title: "LinkNest — One page for all of it",
    description:
      "Claim a name, stack links, images, forms and countdowns, and share one URL. Free and open source.",
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
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
