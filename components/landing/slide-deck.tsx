"use client"

import { useEffect, useRef, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { cn } from "@/lib/utils"
import { SlideActiveProvider } from "./slide-motion"
import { SlideBackdrop, type BackdropVariant } from "./slide-backdrop"
import { useMotionProfile } from "./hooks/use-motion-profile"

type SlideProps = {
  children: React.ReactNode
  id?: string
  className?: string
  backdrop?: React.ReactNode | null
  backdropVariant?: BackdropVariant
}

/** One full-viewport slide in the snap deck. */
export function Slide({
  children,
  id,
  className,
  backdrop,
  backdropVariant = "default",
}: SlideProps) {
  const ref = useRef<HTMLElement>(null)
  const nearRef = useRef(false)
  const [active, setActive] = useState(false)
  const [near, setNear] = useState(false)
  const profile = useMotionProfile()

  const [{ opacity, contentY }, api] = useSpring(() => ({
    opacity: 1,
    contentY: 0,
    config: { tension: profile.lowPower ? 170 : 120, friction: 28 },
  }))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNear = entry.isIntersecting
        nearRef.current = isNear
        setNear(isNear)
        setActive(entry.intersectionRatio > 0.45)
        if (!isNear && !profile.reduceMotion) {
          api.start({ opacity: 0.35, contentY: 0 })
        }
      },
      { threshold: [0.01, 0.45, 0.6, 0.75], rootMargin: "15% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [api, profile.reduceMotion])

  useEffect(() => {
    if (profile.reduceMotion) {
      api.start({ opacity: 1, contentY: 0, immediate: true })
      return
    }
    if (!near) return

    const el = ref.current
    if (!el) return
    const deck = el.closest("[data-slide-deck]") as HTMLElement | null
    if (!deck) return

    let raf = 0
    const drift = (profile.lowPower ? 28 : 52) * profile.intensity

    function update() {
      if (!nearRef.current) return
      const rect = el!.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const offset = (viewH * 0.5 - (rect.top + rect.height * 0.5)) / viewH
      const clamped = Math.max(-1.15, Math.min(1.15, offset))
      api.start({
        opacity: active ? 1 : 0.55,
        contentY: clamped * -drift,
      })
    }

    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    deck.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      cancelAnimationFrame(raf)
      deck.removeEventListener("scroll", onScroll)
    }
  }, [active, api, near, profile.intensity, profile.lowPower, profile.reduceMotion])

  const resolvedBackdrop =
    backdrop === null ? null : backdrop === undefined ? <SlideBackdrop variant={backdropVariant} /> : backdrop

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "relative flex h-dvh w-full shrink-0 snap-start snap-always flex-col justify-center overflow-hidden bg-ink [content-visibility:auto] [contain-intrinsic-size:100vw_100dvh]",
        className
      )}
    >
      {resolvedBackdrop}
      <SlideActiveProvider active={active}>
        <animated.div
          style={{ opacity, y: contentY }}
          className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-5 py-16 will-change-transform md:px-8 md:py-14"
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
  const profile = useMotionProfile()
  const ticking = useRef(false)

  useEffect(() => {
    const el = deckRef.current
    if (!el) return

    function update() {
      ticking.current = false
      const deck = deckRef.current
      if (!deck) return
      const max = deck.scrollHeight - deck.clientHeight
      const progress = max > 0 ? deck.scrollTop / max : 0
      const index = Math.round(deck.scrollTop / Math.max(deck.clientHeight, 1))
      onProgress?.(progress, index)
    }

    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(update)
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => el.removeEventListener("scroll", onScroll)
  }, [onProgress])

  return (
    <div
      ref={deckRef}
      data-slide-deck
      data-low-power={profile.lowPower ? "true" : "false"}
      className={cn(
        "h-dvh touch-pan-y snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain",
        // scroll-smooth feels nice on desktop but causes jank on low-end / coarse pointers
        !profile.lowPower && !profile.coarsePointer && "scroll-smooth",
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
  return (
    <div
      className={cn(
        "w-1.5 rounded-full bg-gold transition-[height,opacity] duration-300",
        active ? "h-5 opacity-100" : "h-1.5 opacity-35"
      )}
    />
  )
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
