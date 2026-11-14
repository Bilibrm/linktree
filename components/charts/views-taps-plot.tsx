"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type TrafficPoint = { day: string; views: number; taps: number }

const tick = { fill: "var(--ink-soft)", fontSize: 12, fontFamily: "var(--font-body)" }

/**
 * Views and taps over time, drawn as ink on paper: views in ink, taps in pink
 * (DESIGN_SYSTEM.md §8.6). The two series also differ in weight and are named in the
 * legend beside the plot, so color is never the only cue.
 */
export function ViewsTapsPlot({ data, height = 320 }: { data: TrafficPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid vertical={false} stroke="var(--rule)" />
        <XAxis dataKey="day" axisLine={{ stroke: "var(--ink)" }} tickLine={false} tick={tick} interval={4} tickMargin={8} />
        <YAxis axisLine={false} tickLine={false} tick={tick} width={48} />
        <Tooltip
          cursor={{ stroke: "var(--ink)", strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: "var(--sheet)",
            border: "1px solid var(--ink)",
            borderRadius: "var(--radius-label)",
            boxShadow: "var(--shadow-offset)",
            color: "var(--ink)",
            fontSize: 14,
            fontVariantNumeric: "tabular-nums",
          }}
          labelFormatter={(label) => "Day " + label}
        />
        <Line type="linear" dataKey="views" name="Views" stroke="var(--ink)" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line type="linear" dataKey="taps" name="Taps" stroke="var(--pink)" strokeWidth={3.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
