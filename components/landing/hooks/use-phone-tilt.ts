"use client"

import { useEffect } from "react"
import { useSpring } from "@react-spring/web"
import { useMotionProfile } from "./use-motion-profile"

export function usePhoneTilt(
  heroRef: React.RefObject<HTMLElement | null>,
  phoneRef: React.RefObject<HTMLDivElement | null>
) {
  const profile = useMotionProfile()
  const [{ rotateX, rotateY }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    config: { tension: 140, friction: 20 },
  }))

  useEffect(() => {
    const heroEl = heroRef.current
    const phone = phoneRef.current
    if (!heroEl || !phone) return
    if (profile.reduceMotion || profile.lowPower || profile.coarsePointer) return
    if (window.matchMedia("(max-width: 767px)").matches) return

    let raf = 0
    function handleMouse(e: MouseEvent) {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = heroEl!.getBoundingClientRect()
        const relX = (e.clientX - rect.left) / rect.width
        const relY = (e.clientY - rect.top) / rect.height
        api.start({
          rotateY: (relX - 0.5) * 10,
          rotateX: (0.5 - relY) * 7,
        })
      })
    }

    heroEl.addEventListener("mousemove", handleMouse, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      heroEl.removeEventListener("mousemove", handleMouse)
    }
  }, [heroRef, phoneRef, api, profile.reduceMotion, profile.lowPower, profile.coarsePointer])

  return { rotateX, rotateY }
}
