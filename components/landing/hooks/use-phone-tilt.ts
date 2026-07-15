"use client"

import { useEffect } from "react"
import { useSpring } from "@react-spring/web"

export function usePhoneTilt(
  heroRef: React.RefObject<HTMLElement | null>,
  phoneRef: React.RefObject<HTMLDivElement | null>
) {
  const [{ rotateX, rotateY }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    config: { tension: 120, friction: 18 },
  }))

  useEffect(() => {
    const heroEl = heroRef.current
    const phone = phoneRef.current
    if (!heroEl || !phone) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(max-width: 767px)").matches) return

    function handleMouse(e: MouseEvent) {
      const rect = heroEl!.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width
      const relY = (e.clientY - rect.top) / rect.height
      api.start({
        rotateY: (relX - 0.5) * 18,
        rotateX: (0.5 - relY) * 12,
      })
    }

    heroEl.addEventListener("mousemove", handleMouse)
    return () => heroEl.removeEventListener("mousemove", handleMouse)
  }, [heroRef, phoneRef, api])

  return { rotateX, rotateY }
}
