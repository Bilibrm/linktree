"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { getAnalytics, type AnalyticsRange, type AnalyticsResult } from "@/lib/actions/analytics"
import { InkPlot } from "@/components/charts/ink-plot"
import { Button } from "@/components/ui/button"
import { blockTypeInfo } from "@/components/dashboard/editor/block-types"
import { pageUrl } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { BlockType } from "@/types"

const RANGES: { days: AnalyticsRange; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
]
const number = new Intl.NumberFormat("en-US")
const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

/**
 * Stats (DESIGN_SYSTEM.md §8.6): one large plot, views in ink and taps in pink, drawn on
 * when the data arrives; a 7/30/90-day toggle; taps per block in page order. Plain tables,
 * tabular numbers. With nothing counted yet, it says why and offers the link to share.
 */
export function AnalyticsClient({ pageId, username }: { pageId: string; username: string }) {
  const [range, setRange] = useState<AnalyticsRange>(30)
  const [data, setData] = useState<AnalyticsResult | null>(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let live = true
    getAnalytics(pageId, range)
      .then((result) => {
        if (!live) return
        setData(result)
        setFailed(false)
      })
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [pageId, range, attempt])

  function pick(days: AnalyticsRange) {
    if (days === range) return
    setLoading(true)
    setRange(days)
  }

  // Stable per result, so the plot draws once per load, not on every render.
  const plot = useMemo(
    () => data?.daily.map((d) => ({ day: dayLabel.format(new Date(`${d.date}T00:00:00Z`)), views: d.views, taps: d.taps })) ?? [],
    [data],
  )
  const empty = data && data.totals.views === 0 && data.totals.taps === 0

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="type-title-1">Stats</h1>
          <p className="type-small mt-2 text-ink-soft">Views of your page and taps on its blocks. Counted without cookies.</p>
        </div>
        <div role="group" aria-label="Time range" className="flex rounded-label border border-rule-strong p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              aria-pressed={r.days === range}
              onClick={() => pick(r.days)}
              className={cn(
                "type-small min-h-11 rounded-[1px] px-3 font-semibold transition-colors duration-150 ease-press md:min-h-9",
                r.days === range ? "bg-ink text-paper" : "text-ink-soft hover:bg-tint hover:text-ink",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {failed && !data ? (
        <div role="alert" className="mt-12 border-t border-rule pt-8">
          <p className="type-title-3">Stats could not be loaded.</p>
          <p className="type-small mt-2 text-ink-soft">Check your connection, then try again.</p>
          <Button variant="outline" className="mt-4 h-11 px-4" onClick={() => {
              setFailed(false)
              setLoading(true)
              setAttempt((n) => n + 1)
            }}>
            Try again
          </Button>
        </div>
      ) : !data ? (
        <StatsSkeleton />
      ) : (
        <div aria-busy={loading || undefined} className={cn("transition-opacity duration-200", loading && "opacity-60")}>
          <dl className="mt-10 flex flex-wrap gap-x-16 gap-y-6 border-t border-rule pt-8">
            <div>
              <dt className="type-small flex items-center gap-2 text-ink-soft">
                <span className="h-0.5 w-5 bg-ink" aria-hidden="true" />
                Views, last {data.range} days
              </dt>
              <dd className="type-title-1 tabular mt-2">{number.format(data.totals.views)}</dd>
            </div>
            <div>
              <dt className="type-small flex items-center gap-2 text-ink-soft">
                <span className="h-1 w-5 bg-pink" aria-hidden="true" />
                Taps, last {data.range} days
              </dt>
              <dd className="type-title-1 tabular mt-2">{number.format(data.totals.taps)}</dd>
            </div>
          </dl>

          {empty ? (
            <EmptyStats username={username} />
          ) : (
            <InkPlot
              className="mt-10"
              data={plot}
              height={300}
              draw="mount"
              label={`Line chart of the last ${data.range} days: ${number.format(data.totals.views)} views and ${number.format(data.totals.taps)} taps.`}
            />
          )}

          <table className="type-small mt-12 w-full border-collapse text-left">
            <caption className="type-title-3 pb-3 text-left">Taps by block</caption>
            <thead>
              <tr className="border-b border-ink text-ink-soft">
                <th scope="col" className="py-2 pr-4 font-semibold">Block</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Type</th>
                <th scope="col" className="py-2 text-right font-semibold">Taps</th>
              </tr>
            </thead>
            <tbody>
              {data.blocks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-ink-soft">
                    Your page has no blocks yet. Add some on the Page tab.
                  </td>
                </tr>
              ) : (
                data.blocks.map((b) => {
                  const type = blockTypeInfo(b.type as BlockType).label
                  return (
                    <tr key={b.blockId} className="border-b border-rule">
                      <th scope="row" className="max-w-0 truncate py-3 pr-4 font-semibold sm:w-1/2">
                        {b.text || type}
                        {!b.isActive && <span className="ml-2 font-normal text-ink-soft">(hidden)</span>}
                      </th>
                      <td className="py-3 pr-4 text-ink-soft">{type}</td>
                      <td className="tabular py-3 text-right">{number.format(b.taps)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="mt-10 border-t border-rule pt-8" aria-busy="true" aria-label="Loading stats">
      <div className="flex gap-16">
        <div className="h-16 w-36 rounded-label bg-tint" />
        <div className="h-16 w-36 rounded-label bg-tint" />
      </div>
      <div className="mt-10 h-[300px] rounded-panel bg-tint" />
    </div>
  )
}

function EmptyStats({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageUrl(username))
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-10 flex flex-col items-start gap-4 rounded-panel border border-dashed border-rule-strong p-8">
      <span className="h-1 w-10 bg-sun" aria-hidden="true" />
      <div>
        <p className="type-title-3">Nothing counted yet</p>
        <p className="type-small mt-1 max-w-[52ch] text-ink-soft">
          Views appear here once people open your page. Share your link in your bio, a post or a message to get the first ones.
        </p>
      </div>
      <Button variant="outline" className="h-11 px-4" onClick={copy}>
        {copied ? <Check className="press-tick" aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Link copied" : "Copy your link"}
      </Button>
    </div>
  )
}
