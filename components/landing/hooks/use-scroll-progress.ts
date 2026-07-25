"use client"

import { useEffect, useState } from "react"
import { useSpring } from "@react-spring/web"

/** Maps an element's scroll-through progress (0–1) as it moves through the viewport. */
export function useElementScrollProgress(ref: React.RefObject<HTMLElement | null>, smooth = true) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) {
        setProgress(0)
        return
      }
      setProgress(Math.min(Math.max(-rect.top / scrollable, 0), 1))
    }

    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    update()
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [ref])

  return useSpring({
    progress,
    immediate: !smooth,
    config: { tension: 120, friction: 14 },
  })
}
