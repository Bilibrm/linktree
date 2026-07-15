"use client"

import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getMagicKeyframes, magicFramesToCss, type MagicAnimationName } from "./magic-keyframes"

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
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

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
    if (reduceMotion) return
    const css = magicFramesToCss(animName, getMagicKeyframes(animation))
    const style = document.createElement("style")
    style.textContent = css
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [animName, animation, reduceMotion])

  const style: React.CSSProperties = reduceMotion
    ? { opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }
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
