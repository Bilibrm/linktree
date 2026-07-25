"use client"

import { createContext, useContext, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { cn } from "@/lib/utils"
import { useMotionProfile } from "./hooks/use-motion-profile"

const SlideActiveContext = createContext(true)

export function useSlideActive() {
  return useContext(SlideActiveContext)
}

export function SlideActiveProvider({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  return <SlideActiveContext.Provider value={active}>{children}</SlideActiveContext.Provider>
}

type From = "up" | "down" | "left" | "right" | "scale"

const OFFSETS: Record<From, { x: number; y: number; scale: number }> = {
  up: { x: 0, y: 40, scale: 0.97 },
  down: { x: 0, y: -28, scale: 0.97 },
  left: { x: 48, y: 0, scale: 0.97 },
  right: { x: -48, y: 0, scale: 0.97 },
  scale: { x: 0, y: 16, scale: 0.9 },
}

type SlideItemProps = {
  children: React.ReactNode
  /** Stagger order within the slide */
  index?: number
  from?: From
  className?: string
  staggerMs?: number
}

/** Springs in when the parent slide is active; eases out when you leave. */
export function SlideItem({
  children,
  index = 0,
  from = "up",
  className,
  staggerMs = 65,
}: SlideItemProps) {
  const active = useSlideActive()
  const profile = useMotionProfile()
  const reduceMotion = profile.reduceMotion
  const lite = profile.lowPower

  const off = OFFSETS[from]
  const show = reduceMotion || active
  const dist = lite ? 0.55 : 1

  const spring = useSpring({
    opacity: show ? 1 : 0,
    x: show ? 0 : off.x * dist,
    y: show ? 0 : off.y * dist,
    scale: show ? 1 : lite ? 0.99 : off.scale,
    delay: reduceMotion || lite ? 0 : show ? index * staggerMs : 0,
    config: show
      ? { tension: lite ? 280 : 260, friction: 24 }
      : { tension: 320, friction: 32 },
  })

  return (
    <animated.div style={spring} className={cn("will-change-transform", className)}>
      {children}
    </animated.div>
  )
}

type HoverLiftProps = {
  children: React.ReactNode
  className?: string
  lift?: number
}

/** Subtle hover lift for tiles / cards inside slides. */
export function HoverLift({ children, className, lift = 5 }: HoverLiftProps) {
  const [hovered, setHovered] = useState(false)
  const profile = useMotionProfile()
  const disabled = profile.reduceMotion || profile.lowPower || profile.coarsePointer

  const spring = useSpring({
    y: !disabled && hovered ? -lift : 0,
    scale: !disabled && hovered ? 1.025 : 1,
    config: { tension: 420, friction: 22 },
  })

  return (
    <animated.div
      style={spring}
      className={cn("will-change-transform", className)}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </animated.div>
  )
}
