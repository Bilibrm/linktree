"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { day: "Mon", clicks: 42 },
  { day: "Tue", clicks: 58 },
  { day: "Wed", clicks: 87 },
  { day: "Thu", clicks: 63 },
  { day: "Fri", clicks: 94 },
  { day: "Sat", clicks: 72 },
  { day: "Sun", clicks: 51 },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8DA89E", fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8DA89E", fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <Tooltip contentStyle={{ backgroundColor: "#17332C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#E7DFC9", fontSize: "14px" }} />
        <Line type="monotone" dataKey="clicks" stroke="#D2A24C" strokeWidth={2} dot={{ fill: "#D2A24C", r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
