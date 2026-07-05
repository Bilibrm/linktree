"use client"

import { useState, useEffect } from "react"
import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle } from "@/lib/theme-utils"

export function CountdownBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const targetDate = data.targetDate ? new Date(data.targetDate).getTime() : 0
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const cardRadius = getCardRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const surfaceStyle = getSurfaceStyle(theme)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(targetDate - Date.now())

    if (!targetDate) return
    const interval = setInterval(() => {
      setTimeLeft(targetDate - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const unitBox = (value: string | number, label: string) => (
    <div key={label} className="text-center">
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-lg sm:text-xl font-bold font-mono ${cardRadius} ${shadow}`}
        style={{ backgroundColor: "var(--page-accent)", color: "var(--page-button-text)" }}
      >
        {value}
      </div>
      <span className="text-[10px] mt-1 block" style={{ color: "var(--page-accent)", opacity: 0.6 }}>{label}</span>
    </div>
  )

  if (!mounted) {
    return (
      <div className={`border theme-surface p-4 text-center ${cardRadius} ${anim}`} style={{ ...surfaceStyle, opacity: 0.6, ...delayStyle } as React.CSSProperties}>
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>{data.title || "Countdown"}</p>
        <div className="flex justify-center gap-3 mt-3">
          {["Days", "Hours", "Min", "Sec"].map((label) => unitBox("00", label))}
        </div>
      </div>
    )
  }

  if (!targetDate || timeLeft <= 0) {
    return (
      <div className={`border theme-surface p-4 text-center ${cardRadius} ${anim}`} style={{ ...surfaceStyle, ...delayStyle } as React.CSSProperties}>
        <p className="text-lg">{data.emoji || "🎉"}</p>
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>{data.title || "Countdown"}</p>
        <p className="text-xs mt-1" style={{ color: "var(--page-accent)", opacity: 0.6 }}>Time&apos;s up!</p>
      </div>
    )
  }

  const days = Math.floor(timeLeft / 86400000)
  const hours = Math.floor((timeLeft % 86400000) / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  return (
    <div className={`border theme-surface p-4 text-center ${cardRadius} ${anim}`} style={{ ...surfaceStyle, ...delayStyle } as React.CSSProperties}>
      {data.emoji && <p className="text-lg mb-1">{data.emoji}</p>}
      <p className="text-sm font-semibold mb-3" style={{ color: "var(--page-accent)" }}>{data.title || "Countdown"}</p>
      <div className="flex justify-center gap-3">
        {unitBox(String(days).padStart(2, "0"), "Days")}
        {unitBox(String(hours).padStart(2, "0"), "Hours")}
        {unitBox(String(minutes).padStart(2, "0"), "Min")}
        {unitBox(String(seconds).padStart(2, "0"), "Sec")}
      </div>
    </div>
  )
}
