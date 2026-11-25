"use client"

import { useEffect } from "react"
import { trackClick, trackPageView } from "@/lib/actions/analytics"

/**
 * Client island for counting (DESIGN_SYSTEM.md §8.6): one page view per load, and a tap
 * on any tile carrying `data-track` (links and buttons, rendered on the server). Renders
 * nothing.
 */
export function PageBeacon({ pageId }: { pageId: string }) {
  useEffect(() => {
    void trackPageView(pageId).catch(() => {})

    function onClick(event: MouseEvent) {
      const tile = (event.target as Element | null)?.closest?.<HTMLElement>("[data-track]")
      if (!tile?.dataset.track) return
      const fd = new FormData()
      fd.append("blockId", tile.dataset.track)
      fd.append("pageId", pageId)
      fd.append("referrer", document.referrer)
      void trackClick(fd).catch(() => {})
    }
    // Middle clicks open links too.
    document.addEventListener("click", onClick)
    document.addEventListener("auxclick", onClick)
    return () => {
      document.removeEventListener("click", onClick)
      document.removeEventListener("auxclick", onClick)
    }
  }, [pageId])

  return null
}
