"use client"

import { useEffect, useState } from "react"
import { getAnalytics } from "@/lib/actions/analytics"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"

type AnalyticsData = {
  totalClicks: number
  totalViews: number
  clicks7d: number
  views7d: number
  topLinks: { blockId: string; title: string; type: string; clicks: number }[]
  dailyData: { _id: string; clicks: number; views: number }[]
}

export function AnalyticsClient({ pageId, username }: { pageId: string; username: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAnalytics(pageId)
        setData(result as any)
      } catch {
        // handled by empty state
      }
      setLoading(false)
    }
    fetchData()
  }, [pageId])

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 bg-dashboard-surface" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-dashboard-surface" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-dashboard-surface" />
      </div>
    )
  }

  const chartData = data?.dailyData?.slice(-14).map((d) => ({
    day: d._id.slice(5),
    clicks: d.clicks,
    views: d.views,
  })) || []

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-display font-bold text-dashboard-text">Analytics</h1>
        <p className="text-caption text-muted-foreground mt-0.5">How your page is performing.</p>
      </div>

      {/* Top stats — prominent */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total clicks", value: data?.totalClicks || 0 },
          { label: "Total views", value: data?.totalViews || 0 },
          { label: "Clicks (7d)", value: data?.clicks7d || 0 },
          { label: "Views (7d)", value: data?.views7d || 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-dashboard-border bg-dashboard-surface/50 p-4">
            <p className="text-small text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-display font-bold text-dashboard-text font-mono">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-dashboard-border bg-dashboard-surface/30 p-4 md:p-6 mb-8">
          <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wider font-mono mb-4">Activity (14 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8DA89E", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8DA89E", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
              <Tooltip contentStyle={{ backgroundColor: "#17332C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#E7DFC9", fontSize: "13px", fontFamily: "IBM Plex Mono" }} />
              <Line type="monotone" dataKey="clicks" stroke="#D2A24C" strokeWidth={2} dot={false} name="Clicks" />
              <Line type="monotone" dataKey="views" stroke="#8DA89E" strokeWidth={1} dot={false} name="Views" opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top links + daily breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-dashboard-border bg-dashboard-surface/30 p-4 md:p-6">
          <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wider font-mono mb-4">Top links</h3>
          {data?.topLinks && data.topLinks.length > 0 ? (
            <div className="space-y-3">
              {data.topLinks.map((link, i) => (
                <div key={link.blockId} className="flex items-center gap-3">
                  <span className="text-small text-muted-foreground/30 font-mono w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium text-dashboard-text truncate">{link.title}</p>
                  </div>
                  <span className="text-caption font-bold text-gold font-mono">{link.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-caption text-muted-foreground py-8 text-center">No clicks yet. Share your page to get started.</p>
          )}
        </div>

        <div className="rounded-xl border border-dashboard-border bg-dashboard-surface/30 p-4 md:p-6">
          <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wider font-mono mb-4">Daily breakdown</h3>
          {data?.dailyData && data.dailyData.length > 0 ? (
            <div className="space-y-1.5">
              {data.dailyData.slice(-14).map((day) => (
                <div key={day._id} className="flex items-center gap-3 text-small">
                  <span className="w-20 text-muted-foreground font-mono">{day._id.slice(5)}</span>
                  <div className="flex-1 flex gap-1">
                    <div
                      className="h-2.5 rounded-sm bg-gold/80"
                      style={{ width: `${Math.min(100, (day.clicks / Math.max(...data!.dailyData.map((d) => d.clicks), 1)) * 100)}%` }}
                    />
                    <div
                      className="h-2.5 rounded-sm bg-bone/20"
                      style={{ width: `${Math.min(100, (day.views / Math.max(...data!.dailyData.map((d) => d.views), 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-muted-foreground font-mono">
                    {day.clicks}c / {day.views}v
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-caption text-muted-foreground py-8 text-center">No activity recorded yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <a
          href={`/${username}`}
          target="_blank"
          className="inline-flex items-center min-h-[44px] text-caption text-gold hover:text-gold/80 transition-colors"
        >
          View your public page
        </a>
      </div>
    </div>
  )
}
