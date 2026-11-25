"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Which of a list's items is passing the middle of the viewport. For the sticky split
 * sections (DESIGN_SYSTEM.md §6.1): the narrative on the left names the card in the
 * centre on the right. Items carry `data-index`. Works with and without motion.
 */
export function useActiveItem<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index) || 0)
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    )
    el.querySelectorAll("[data-index]").forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return { ref, active }
}
