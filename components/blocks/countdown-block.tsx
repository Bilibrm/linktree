"use client"

import { useState, useEffect } from "react"
import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle } from "@/lib/theme-utils"
import { Timer, Clock } from "lucide-react"

export function CountdownBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const targetDate = data.targetDate ? new Date(data.targetDate).getTime() : 0
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const cardRadius = getCardRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const surfaceStyle = getSurfaceStyle(theme)
  const accent = theme.accentColor || "#16302A"

  useEffect(() => {
    setMounted(true)
    setTimeLeft(targetDate - Date.now())
    if (!targetDate) return
    const interval = setInterval(() => {
      setTimeLeft(targetDate - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const unitBox = (value: string | number, label: string, isLast: boolean) => (
    <div key={label} className="flex items-center gap-1.5 sm:gap-2">
      <div className="text-center">
        <div
          className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-lg sm:text-xl font-bold font-mono overflow-hidden ${cardRadius} ${shadow || "shadow-md"}`}
          style={{
            background: `linear-gradient(155deg, ${accent}, color-mix(in srgb, ${accent} 70%, black))`,
            color: "var(--page-button-text)",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          <span className="absolute inset-0 ring-1 ring-inset ring-white/[0.08] rounded-inherit pointer-events-none" />
          <span className="relative z-[1] tabular-nums">{value}</span>
        </div>
        <span className="text-[10px] mt-1.5 block font-medium tracking-wide" style={{ color: "var(--page-accent)", opacity: 0.5 }}>{label}</span>
      </div>
      {!isLast && <span className="text-lg font-bold pb-4" style={{ color: "var(--page-accent)", opacity: 0.2 }}>:</span>}
    </div>
  )

  if (!mounted) {
    return (
      <div className={`border theme-surface p-5 text-center ${cardRadius} ${anim}`} style={{ ...surfaceStyle, opacity: 0.6, ...delayStyle } as React.CSSProperties}>
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--page-accent)" }}>{data.title || "Countdown"}</p>
        <div className="flex justify-center">
          {unitBox("00", "Days", false)}
          {unitBox("00", "Hours", false)}
          {unitBox("00", "Min", false)}
          {unitBox("00", "Sec", true)}
        </div>
      </div>
    )
  }

  if (!targetDate || timeLeft <= 0) {
    return (
      <div className={`border theme-surface p-6 text-center ${cardRadius} ${anim}`} style={{ ...surfaceStyle, ...delayStyle } as React.CSSProperties}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
          {data.emoji ? (
            <span className="text-2xl">{data.emoji}</span>
          ) : (
            <Clock className="w-5 h-5" style={{ color: accent, opacity: 0.5 }} />
          )}
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>{data.title || "Countdown"}</p>
        <p className="text-xs mt-1" style={{ color: "var(--page-accent)", opacity: 0.55 }}>Time&apos;s up!</p>
      </div>
    )
  }

  const days = Math.floor(timeLeft / 86400000)
  const hours = Math.floor((timeLeft % 86400000) / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  return (
    <div className={`border theme-surface p-5 text-center ${cardRadius} ${anim}`} style={{ ...surfaceStyle, ...delayStyle } as React.CSSProperties}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Timer className="w-4 h-4" style={{ color: accent, opacity: 0.5 }} />
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>{data.title || "Countdown"}</p>
      </div>
      <div className="flex justify-center">
        {unitBox(String(days).padStart(2, "0"), "Days", false)}
        {unitBox(String(hours).padStart(2, "0"), "Hours", false)}
        {unitBox(String(minutes).padStart(2, "0"), "Min", false)}
        {unitBox(String(seconds).padStart(2, "0"), "Sec", true)}
      </div>
    </div>
  )
}
