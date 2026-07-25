"use client"

import { useEffect, useRef, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { cn } from "@/lib/utils"
import { useMotionProfile } from "./hooks/use-motion-profile"

export type BackdropVariant = "hero" | "craft" | "default" | "cta"

const gridStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(231,223,201,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(231,223,201,0.055) 1px, transparent 1px)",
  backgroundSize: "72px 72px",
  maskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 35%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, #000 35%, transparent 100%)",
}

const dotStyle: React.CSSProperties = {
  backgroundImage: "radial-gradient(rgba(231,223,201,0.09) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
  maskImage: "radial-gradient(ellipse 55% 65% at 78% 48%, #000, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 55% 65% at 78% 48%, #000, transparent 100%)",
}

function LinkChips({
  style,
  lite,
}: {
  style?: React.ComponentProps<typeof animated.div>["style"]
  lite?: boolean
}) {
  const chips = [
    { label: "linknest.app/alex", top: "18%", side: "left" as const, inset: "5%", rotate: -5, delay: "0s", accent: true },
    { label: "New video", top: "22%", side: "right" as const, inset: "6%", rotate: 5, delay: "1.1s", accent: false },
    { label: "Newsletter", top: "68%", side: "right" as const, inset: "8%", rotate: -4, delay: "2.2s", accent: false },
    { label: "Shop the drop", top: "74%", side: "left" as const, inset: "7%", rotate: 4, delay: "0.6s", accent: true },
  ]

  return (
    <animated.div aria-hidden className="absolute inset-0 hidden md:block" style={style}>
      {chips.map((chip) => (
        <div
          key={chip.label}
          className={cn("absolute", !lite && "landing-float")}
          style={{
            top: chip.top,
            ...(chip.side === "left" ? { left: chip.inset } : { right: chip.inset }),
            animationDelay: lite ? undefined : chip.delay,
          }}
        >
          <div
            className={cn(
              "rounded-full border px-4 py-2 text-caption font-medium",
              !lite && "backdrop-blur-sm",
              chip.accent
                ? "border-gold/30 bg-gold/10 text-gold/70"
                : "border-white/10 bg-bone/[0.04] text-bone/40"
            )}
            style={{ transform: `rotate(${chip.rotate}deg)` }}
          >
            {chip.label}
          </div>
        </div>
      ))}
    </animated.div>
  )
}

type SlideBackdropProps = {
  variant?: BackdropVariant
  chips?: boolean
}

/**
 * Shared brand backdrop with visibility-gated parallax.
 * Low-power devices keep the look with cheaper layers + lighter motion.
 */
export function SlideBackdrop({ variant = "default", chips }: SlideBackdropProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const scrollRef = useRef(0)
  const nearRef = useRef(false)
  const rafRef = useRef(0)
  const [near, setNear] = useState(false)
  const profile = useMotionProfile()
  const showChips = (chips ?? variant === "hero") && !profile.coarsePointer
  const lite = profile.lowPower || profile.reduceMotion
  const intensity = profile.intensity

  const [{ gx, gy, ox, oy, cx, cy, scale }, api] = useSpring(() => ({
    gx: 0,
    gy: 0,
    ox: 0,
    oy: 0,
    cx: 0,
    cy: 0,
    scale: 1,
    config: { tension: lite ? 160 : 80, friction: lite ? 30 : 26 },
  }))

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const host = (el.closest("section") ?? el.parentElement) as HTMLElement | null
    if (!host) return

    // Only spend frames when this slide is near the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        const isNear = entry.isIntersecting
        nearRef.current = isNear
        setNear(isNear)
        if (!isNear) {
          mouseRef.current = { x: 0, y: 0 }
          api.start({ gx: 0, gy: 0, ox: 0, oy: 0, cx: 0, cy: 0, scale: 1 })
        }
      },
      { root: null, rootMargin: "20% 0px", threshold: 0.01 }
    )
    io.observe(host)
    return () => io.disconnect()
  }, [api])

  useEffect(() => {
    if (profile.reduceMotion) return
    if (!near) return

    const el = rootRef.current
    if (!el) return
    const host = (el.closest("section") ?? el.parentElement) as HTMLElement | null
    if (!host) return

    const deck =
      (host.closest("[data-slide-deck]") as HTMLElement | null) ?? document.documentElement

    const scrollAmp = lite ? 32 : 56
    const glowAmp = lite ? 48 : 90
    const chipAmp = lite ? 64 : 120
    const mouseAmp = lite ? 0.55 : 1

    function push() {
      if (!nearRef.current) return
      const mx = mouseRef.current.x * mouseAmp
      const my = mouseRef.current.y * mouseAmp
      const s = scrollRef.current * intensity
      api.start({
        gx: mx * -22 * intensity,
        gy: my * -14 * intensity + s * scrollAmp,
        ox: mx * 34 * intensity,
        oy: my * 24 * intensity + s * glowAmp,
        cx: mx * 48 * intensity,
        cy: my * 34 * intensity + s * chipAmp,
        scale: lite ? 1 : 1.04 + Math.abs(s) * 0.05,
      })
    }

    function onScroll() {
      if (!nearRef.current) return
      const rect = host!.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const centerOffset = (viewH * 0.5 - (rect.top + rect.height * 0.5)) / viewH
      scrollRef.current = Math.max(-1.1, Math.min(1.1, centerOffset))
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(push)
    }

    function onMove(e: MouseEvent) {
      if (profile.coarsePointer || lite) return
      if (!nearRef.current) return
      const rect = host!.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      }
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(push)
    }

    function onLeave() {
      mouseRef.current = { x: 0, y: 0 }
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(push)
    }

    deck.addEventListener("scroll", onScroll, { passive: true })
    host.addEventListener("mousemove", onMove, { passive: true })
    host.addEventListener("mouseleave", onLeave)
    onScroll()

    return () => {
      cancelAnimationFrame(rafRef.current)
      deck.removeEventListener("scroll", onScroll)
      host.removeEventListener("mousemove", onMove)
      host.removeEventListener("mouseleave", onLeave)
    }
  }, [api, intensity, lite, near, profile.coarsePointer, profile.reduceMotion])

  const goldPos =
    variant === "cta"
      ? "left-1/2 top-1/2 h-[95vh] w-[95vh] -translate-x-1/2 -translate-y-1/2"
      : variant === "craft"
        ? "-left-[8%] -top-[20%] h-[60vh] w-[60vh]"
        : variant === "hero"
          ? "-right-[15%] -top-[25%] h-[80vh] w-[80vh]"
          : "-right-[12%] -top-[18%] h-[70vh] w-[70vh]"

  const mistPos =
    variant === "cta"
      ? "hidden"
      : variant === "craft"
        ? "-bottom-[25%] -right-[8%] h-[60vh] w-[60vh]"
        : "-bottom-[28%] -left-[10%] h-[65vh] w-[65vh]"

  const blurClass = lite ? "blur-3xl" : "blur-[110px]"
  const showDots = !lite && (variant === "craft" || variant === "default" || variant === "hero")

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-ink contain-strict"
    >
      <animated.div
        className={cn("absolute rounded-full bg-gold/[0.13] will-change-transform", blurClass, goldPos)}
        style={{
          x: ox,
          y: oy,
          scale: lite ? 1 : scale,
          opacity: variant === "cta" ? 0.16 : 1,
        }}
      />
      {!lite && (
        <animated.div
          className={cn("absolute rounded-full bg-[#6B9E8C]/[0.09] will-change-transform", blurClass, mistPos)}
          style={{
            x: ox.to((v) => -v * 0.65),
            y: oy.to((v) => -v * 0.55),
          }}
        />
      )}

      <animated.div
        className="absolute -inset-[12%] will-change-transform"
        style={{ ...gridStyle, x: gx, y: gy, scale: lite ? 1 : scale }}
      />

      {showDots && (
        <animated.div
          className="absolute -inset-[10%] will-change-transform"
          style={{
            ...dotStyle,
            x: gx.to((v) => v * 1.45),
            y: gy.to((v) => v * 1.45),
          }}
        />
      )}

      {variant === "cta" && (
        <animated.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ x: gx.to((v) => v * 0.5), y: gy.to((v) => v * 0.5) }}
        >
          {[38, 58, 80].map((size) => (
            <div
              key={size}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.10]"
              style={{ height: `${size}vh`, width: `${size}vh` }}
            />
          ))}
        </animated.div>
      )}

      {showChips && (
        <LinkChips
          lite={lite}
          style={{
            x: cx,
            y: cy,
          }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(12,26,22,0.82)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[min(42%,28rem)] bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
    </div>
  )
}
