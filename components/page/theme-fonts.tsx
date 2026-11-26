"use client"

import { useEffect } from "react"

/**
 * Font stylesheets for themes drawn inside the app (editor proof, Look panel, landing).
 * Appended to <head> once per href and kept: switching back to a theme is then instant,
 * and nothing suspends while a stylesheet loads. The public page renders its one
 * stylesheet on the server instead (see app/[username]/page.tsx).
 */
export function useThemeFonts(hrefs: (string | null | undefined)[]) {
  const key = [...new Set(hrefs.filter((h): h is string => !!h))].sort().join("\n")
  useEffect(() => {
    if (!key) return
    for (const href of key.split("\n")) {
      if (document.querySelector(`link[data-theme-font="${CSS.escape(href)}"]`)) continue
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.dataset.themeFont = href
      // A `text=` subset declares the same family as the full face. Whichever is declared
      // last wins for every glyph, so subsets go first and full faces after them.
      const first = document.head.querySelector("link[data-theme-font]")
      if (href.includes("&text=") && first) document.head.insertBefore(link, first)
      else document.head.appendChild(link)
    }
  }, [key])
}
