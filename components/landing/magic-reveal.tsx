"use client"

import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getMagicKeyframes, magicFramesToCss, type MagicAnimationName } from "./magic-keyframes"
import { useMotionProfile } from "./hooks/use-motion-profile"

type MagicRevealProps = {
  children: React.ReactNode
  animation?: MagicAnimationName
  delay?: number
  duration?: number
  className?: string
  as?: keyof HTMLElementTagNameMap
}

export function MagicReveal({
  children,
  animation = "puffIn",
  delay = 0,
  duration = 0.7,
  className,
  as: Tag = "div",
}: MagicRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const uid = useId().replace(/:/g, "")
  const animName = `magic-${animation}-${uid}`
  const [visible, setVisible] = useState(false)
  const profile = useMotionProfile()
  const lite = profile.reduceMotion || profile.lowPower

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px 10% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (lite) return
    const css = magicFramesToCss(animName, getMagicKeyframes(animation))
    const style = document.createElement("style")
    style.textContent = css
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [animName, animation, lite])

  const style: React.CSSProperties = lite
    ? {
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        transition: `opacity ${duration * 0.7}s ease, transform ${duration * 0.7}s ease`,
        transitionDelay: `${delay}s`,
      }
    : visible
      ? {
          animationName: animName,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          animationFillMode: "both",
          animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      : { opacity: 0 }

  return (
    // @ts-expect-error dynamic tag ref
    <Tag ref={ref} className={cn(className)} style={style}>
      {children}
    </Tag>
  )
}
