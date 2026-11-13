"use client"

import { useEffect, useRef, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { useSlideActive } from "./slide-motion"

type SpringCounterProps = {
  value: number
  suffix?: string
  label: string
}

export function SpringCounter({ value, suffix = "", label }: SpringCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const slideActive = useSlideActive()
  const [ioStarted, setIoStarted] = useState(false)
  const started = slideActive || ioStarted
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  useEffect(() => {
    const el = ref.current
    if (!el || slideActive) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIoStarted(true)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [slideActive])

  const { number } = useSpring({
    number: started ? value : 0,
    immediate: reduceMotion,
    config: { tension: 90, friction: 22 },
  })

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-none text-gold">
        <animated.span>{number.to((n) => `${Math.round(n)}${suffix}`)}</animated.span>
      </div>
      <div className="mt-1.5 text-small text-bone/70 md:text-caption">{label}</div>
    </div>
  )
}
