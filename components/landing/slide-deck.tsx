"use client"

import { useEffect, useRef, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { cn } from "@/lib/utils"
import { SlideActiveProvider } from "./slide-motion"

type SlideProps = {
  children: React.ReactNode
  id?: string
  className?: string
  bgImage?: string
  bgPosition?: string
  tint?: string
}

/** One full-viewport slide in the snap deck. */
export function Slide({
  children,
  id,
  className,
  bgImage,
  bgPosition = "center",
  tint = "bg-ink/80",
}: SlideProps) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio > 0.45),
      { threshold: [0.45, 0.6, 0.75] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const shell = useSpring({
    opacity: reduceMotion ? 1 : active ? 1 : 0.4,
    config: { tension: 180, friction: 26 },
  })

  const bgSpring = useSpring({
    scale: reduceMotion ? 1 : active ? 1 : 1.06,
    config: { tension: 120, friction: 40 },
  })

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "relative flex h-dvh w-full shrink-0 snap-start snap-always flex-col justify-center overflow-hidden",
        !bgImage && "bg-ink",
        className
      )}
    >
      {bgImage && (
        <>
          <animated.div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundPosition: bgPosition,
              scale: bgSpring.scale,
            }}
          />
          <div className={cn("absolute inset-0", tint)} />
        </>
      )}
      <SlideActiveProvider active={active}>
        <animated.div
          style={shell}
          className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-5 py-16 md:px-8 md:py-14"
        >
          {children}
        </animated.div>
      </SlideActiveProvider>
    </section>
  )
}

type SlideDeckProps = {
  children: React.ReactNode
  onProgress?: (progress: number, index: number) => void
  className?: string
}

/** Vertical snap deck — scrolling feels like changing slides. */
export function SlideDeck({ children, onProgress, className }: SlideDeckProps) {
  const deckRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = deckRef.current
    if (!el) return

    function update() {
      const deck = deckRef.current
      if (!deck) return
      const max = deck.scrollHeight - deck.clientHeight
      const progress = max > 0 ? deck.scrollTop / max : 0
      const index = Math.round(deck.scrollTop / Math.max(deck.clientHeight, 1))
      onProgress?.(progress, index)
    }

    el.addEventListener("scroll", update, { passive: true })
    update()
    return () => el.removeEventListener("scroll", update)
  }, [onProgress])

  return (
    <div
      ref={deckRef}
      className={cn(
        "h-dvh touch-pan-y snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth",
        className
      )}
      style={{ scrollSnapType: "y mandatory" }}
    >
      {children}
    </div>
  )
}

type SlideDotsProps = {
  count: number
  active: number
}

function SlideDot({ active }: { active: boolean }) {
  const spring = useSpring({
    height: active ? 20 : 6,
    opacity: active ? 1 : 0.35,
    config: { tension: 300, friction: 22 },
  })

  return <animated.div style={spring} className="w-1.5 rounded-full bg-gold" />
}

export function SlideDots({ count, active }: SlideDotsProps) {
  return (
    <div
      className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 md:flex"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <SlideDot key={i} active={i === active} />
      ))}
    </div>
  )
}
