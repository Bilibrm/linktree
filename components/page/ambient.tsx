"use client"

import { useEffect, useRef } from "react"

/**
 * Pauses a theme's ambient background (halftone drift, blob morph) while its page is off
 * screen (§6.3). Place it inside the `.lp` root it should watch; renders an empty marker.
 */
export function AmbientPause() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".lp")
    if (!root || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => {
      root.dataset.ambient = entry.isIntersecting ? "on" : "off"
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return <span ref={ref} hidden />
}
