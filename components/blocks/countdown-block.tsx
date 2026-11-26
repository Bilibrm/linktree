"use client"

import { useEffect, useState } from "react"
import type { BlockComponentProps } from "./block-props"

const UNITS = [
  { label: "Days", ms: 86_400_000, mod: Infinity },
  { label: "Hours", ms: 3_600_000, mod: 24 },
  { label: "Minutes", ms: 60_000, mod: 60 },
  { label: "Seconds", ms: 1000, mod: 60 },
]

/** Client island: ticks once a second. The server renders the time left at render. */
export function CountdownBlock({ data }: BlockComponentProps) {
  const target = data.targetDate ? new Date(data.targetDate).getTime() : NaN
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (Number.isNaN(target)) return
    const tick = () => setNow(Date.now())
    const raf = requestAnimationFrame(tick)
    const timer = setInterval(tick, 1000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [target])

  const title = data.title || "Countdown"
  const left = now === null ? null : target - now

  if (Number.isNaN(target) || (left !== null && left <= 0)) {
    return (
      <div className="lp-card">
        <h2 className="lp-card-title">{title}</h2>
        <p className="lp-card-note">{Number.isNaN(target) ? "No date set yet." : "It has started."}</p>
      </div>
    )
  }

  return (
    <div className="lp-card">
      <h2 className="lp-card-title">{title}</h2>
      {/* Before the first tick the numbers are blank, so server and client markup agree. */}
      <div className="lp-count" role="timer" aria-live="off">
        {UNITS.map((unit) => {
          const value = left === null ? null : Math.floor(left / unit.ms) % unit.mod
          return (
            <div key={unit.label} className="lp-count-unit">
              <span className="lp-count-num">{value === null ? "--" : String(value).padStart(2, "0")}</span>
              <span className="lp-count-label">{unit.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
