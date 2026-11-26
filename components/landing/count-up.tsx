"use client"

import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "./motion"

const number = new Intl.NumberFormat("en-US")

/**
 * A number that counts up once when it first scrolls into view (DESIGN_SYSTEM.md §6.1).
 * The server renders the final value, so without scripts or with reduced motion it is
 * simply there; a number already on screen at load is left alone.
 */
export function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return
    const box = el.getBoundingClientRect()
    if (box.top < window.innerHeight && box.bottom > 0) return

    let frame = 0
    const hold = requestAnimationFrame(() => setShown(0))
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          setShown(Math.round(value * (1 - Math.pow(1 - t, 4))))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { rootMargin: "0px 0px -20% 0px" },
    )
    observer.observe(el)
    return () => {
      cancelAnimationFrame(hold)
      cancelAnimationFrame(frame)
      observer.disconnect()
      setShown(value)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="tabular">
      {number.format(shown)}
    </span>
  )
}
