"use client"

import { useState, useEffect } from "react"

export function CountdownBlock({ data }: { data: any }) {
  const targetDate = data.targetDate ? new Date(data.targetDate).getTime() : 0
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(targetDate - Date.now())

    if (!targetDate) return
    const interval = setInterval(() => {
      setTimeLeft(targetDate - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!mounted) {
    return (
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-sm font-medium">{data.title || "Countdown"}</p>
        <div className="flex justify-center gap-3 mt-3">
          {["Days", "Hours", "Min", "Sec"].map((label) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">00</div>
              <span className="text-[10px] text-muted-foreground mt-1 block">{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!targetDate || timeLeft <= 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-lg">{data.emoji || "🎉"}</p>
        <p className="text-sm font-medium">{data.title || "Countdown"}</p>
        <p className="text-xs text-muted-foreground mt-1">Time&apos;s up!</p>
      </div>
    )
  }

  const days = Math.floor(timeLeft / 86400000)
  const hours = Math.floor((timeLeft % 86400000) / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      {data.emoji && <p className="text-lg mb-1">{data.emoji}</p>}
      <p className="text-sm font-medium mb-3">{data.title || "Countdown"}</p>
      <div className="flex justify-center gap-3">
        {[
          { value: days, label: "Days" },
          { value: hours, label: "Hours" },
          { value: minutes, label: "Min" },
          { value: seconds, label: "Sec" },
        ].map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">
              {String(unit.value).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
