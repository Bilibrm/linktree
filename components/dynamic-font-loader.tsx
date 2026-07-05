"use client"

import { useEffect, useState } from "react"
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google"

/**
 * Font pairings that are NOT covered by the root layout's
 * Fraunces + Public Sans + IBM Plex Mono and therefore need
 * a dynamic Google Fonts stylesheet.
 */
const FONT_LINKS: Record<string, string> = {
  "geist-inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "dm-sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  "space-mono": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
  "serif-sans": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
}

/**
 * CSS variable overrides for each font pair so `var(--page-font-family)` resolves correctly.
 */
const FONT_VARS: Record<string, string> = {
  "geist-inter": "'Inter', 'Public Sans', sans-serif",
  "fraunces-publicsans": "'Fraunces', 'Public Sans', serif",
  "dm-sans": "'DM Sans', sans-serif",
  "space-mono": "'Space Grotesk', sans-serif",
  "serif-sans": "'Playfair Display', 'Inter', serif",
}

export function DynamicFontLoader({ font }: { font?: string }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!font || font === "fraunces-publicsans") {
      setLoaded(true)
      return
    }

    const href = FONT_LINKS[font]
    if (!href) {
      setLoaded(true)
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => setLoaded(true)
    link.onerror = () => setLoaded(true)
    document.head.appendChild(link)

    return () => {
      link.remove()
    }
  }, [font])

  useEffect(() => {
    if (!font) return
    const resolved = FONT_VARS[font]
    if (!resolved) return
    document.documentElement.style.setProperty("--page-font-family", resolved)
    return () => {
      document.documentElement.style.removeProperty("--page-font-family")
    }
  }, [font, loaded])

  return null
}
