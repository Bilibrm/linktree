"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type TrafficPoint = { day: string; views: number; taps: number }

const W = 1000
const number = new Intl.NumberFormat("en-US")

/** A round top for the value axis: 1, 2 or 5 times a power of ten, at or above `max`. */
function niceMax(max: number) {
  if (max <= 4) return 4
  const step = 10 ** Math.floor(Math.log10(max))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= max) return m * step
  return 10 * step
}

function linePath(values: number[], top: number, height: number) {
  const n = values.length
  return values
    .map((v, i) => {
      const x = n === 1 ? W / 2 : (i / (n - 1)) * W
      const y = height - (v / top) * height
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

/**
 * Views and taps over time, as ink on paper (DESIGN_SYSTEM.md §8.6): views in ink, taps in
 * pink and heavier, so color is never the only cue. Plain SVG stretched to its box with
 * non-scaling strokes; the labels are HTML so they stay crisp.
 *
 * `draw` decides when the lines are inked in, left to right: `"mount"` each time the data
 * changes (Stats), `"view"` once when the plot first scrolls into view (landing), or
 * `"none"`. Without scripting, or with reduced motion, the lines are simply there.
 */
export function InkPlot({
  data,
  height = 320,
  draw = "mount",
  label,
  className,
}: {
  data: TrafficPoint[]
  height?: number
  draw?: "mount" | "view" | "none"
  /** Spoken summary of the plot; the numbers are also in a table beside it. */
  label: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<"wait" | "go" | "done">(draw === "none" ? "done" : "wait")
  const [hover, setHover] = useState<number | null>(null)
  const id = useId()

  const top = useMemo(() => niceMax(Math.max(1, ...data.map((d) => Math.max(d.views, d.taps)))), [data])
  const views = useMemo(() => linePath(data.map((d) => d.views), top, height), [data, top, height])
  const taps = useMemo(() => linePath(data.map((d) => d.taps), top, height), [data, top, height])
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f))
  const labelEvery = Math.max(1, Math.ceil(data.length / 6))

  useEffect(() => {
    if (draw === "none") return
    if (draw === "mount") {
      // Restart the draw for new data: back to "wait" for one frame, then "go".
      const frame = requestAnimationFrame(() => setState("go"))
      return () => {
        cancelAnimationFrame(frame)
        setState("wait")
      }
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState("go")
        observer.disconnect()
      },
      { rootMargin: "0px 0px -20% 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [draw, data])

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const f = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    setHover(Math.round(f * (data.length - 1)))
  }

  const point = hover !== null ? data[hover] : null
  const hoverLeft = hover !== null && data.length > 1 ? (hover / (data.length - 1)) * 100 : 50

  return (
    <div ref={ref} className={cn("ink-plot", className)} data-draw={state}>
      <div className="flex">
        {/* Value axis */}
        <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className="type-micro tabular absolute right-3 -translate-y-1/2 font-normal text-ink-soft"
              style={{ top: height - (t / top) * height }}
            >
              {number.format(t)}
            </span>
          ))}
        </div>

        <div
          className="relative min-w-0 flex-1"
          style={{ height }}
          role="img"
          aria-labelledby={`${id}-label`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <span id={`${id}-label`} className="sr-only">
            {label}
          </span>
          <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            {ticks.map((t) => {
              const y = height - (t / top) * height
              return (
                <line
                  key={t}
                  x1={0}
                  x2={W}
                  y1={y}
                  y2={y}
                  stroke={t === 0 ? "var(--ink)" : "var(--rule)"}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
          <div className="ink-plot-series absolute inset-0" aria-hidden="true">
            <svg className="size-full overflow-visible" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
              <path d={views} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="ink-plot-series ink-plot-series-2 absolute inset-0" aria-hidden="true">
            <svg className="size-full overflow-visible" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
              <path d={taps} fill="none" stroke="var(--pink)" strokeWidth={3.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {point && (
            <div className="pointer-events-none absolute inset-y-0" style={{ left: `${hoverLeft}%` }} aria-hidden="true">
              <span className="absolute inset-y-0 w-px bg-ink" />
              <span
                className={cn(
                  "type-small tabular absolute top-2 w-max rounded-label border border-ink bg-sheet px-2.5 py-1.5 text-ink shadow-offset",
                  hoverLeft > 60 ? "right-3" : "left-3",
                )}
              >
                <span className="block font-semibold">{point.day}</span>
                <span className="block">{number.format(point.views)} views</span>
                <span className="block">{number.format(point.taps)} taps</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Time axis */}
      <div className="relative ml-12 h-7" aria-hidden="true">
        {data.map((d, i) =>
          // Every label on wide screens; every other one on phones, where they would collide.
          i % labelEvery === 0 || (i === data.length - 1 && i % labelEvery >= labelEvery / 2) ? (
            <span
              key={i}
              className={cn(
                "type-micro tabular absolute top-2 font-normal whitespace-nowrap text-ink-soft",
                i !== 0 && (i % labelEvery !== 0 || (i / labelEvery) % 2 === 1) && "max-sm:hidden",
              )}
              style={{
                left: `${data.length > 1 ? (i / (data.length - 1)) * 100 : 50}%`,
                transform: i === 0 ? "none" : i === data.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {d.day}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}
