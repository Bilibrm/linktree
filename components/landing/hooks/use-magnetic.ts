"use client"

import { useEffect } from "react"
import { useSpring } from "@react-spring/web"

export function useMagnetic(ref: React.RefObject<HTMLElement | null>, strength = 0.3) {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0, config: { tension: 300, friction: 20 } }))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(pointer: coarse)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const relX = e.clientX - rect.left - rect.width / 2
      const relY = e.clientY - rect.top - rect.height / 2
      api.start({ x: relX * strength, y: relY * (strength + 0.15) })
    }
    function handleLeave() {
      api.start({ x: 0, y: 0, config: { tension: 180, friction: 12 } })
    }

    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)
    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
    }
  }, [ref, strength, api])

  return { x, y }
}
