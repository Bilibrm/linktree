"use server"

import { connectDB } from "@/lib/db/mongoose"
import { ClickEvent } from "@/lib/models/click-event"
import { Block } from "@/lib/models/block"
import { auth } from "@/lib/auth"
import { trackClickSchema } from "@/lib/validation"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60
const WINDOW_MS = 60_000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function trackClick(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = trackClickSchema.safeParse(raw)

  if (!parsed.success) return { error: "Invalid data" }

  const ipKey = "click_" + (raw.ip || "anonymous")
  if (!checkRateLimit(ipKey)) return { error: "Rate limited" }

  await connectDB()
  await ClickEvent.create({
    blockId: parsed.data.blockId,
    pageId: parsed.data.pageId,
    referrer: parsed.data.referrer || null,
  })

  return { success: true }
}

export async function trackPageView(pageId: string) {
  const ipKey = "view_" + (pageId || "unknown")
  if (!checkRateLimit(ipKey)) return

  await connectDB()
  await ClickEvent.create({
    blockId: "pageview",
    pageId,
  })
}

export type AnalyticsRange = 7 | 30 | 90

export type AnalyticsResult = {
  range: AnalyticsRange
  totals: { views: number; taps: number }
  /** One row per day of the range, oldest first, UTC dates (YYYY-MM-DD); empty days are 0. */
  daily: { date: string; views: number; taps: number }[]
  /** Every block on the page, in page order, with its taps in the range. */
  blocks: { blockId: string; type: string; text: string; isActive: boolean; taps: number }[]
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Stats for the owner's page (DESIGN_SYSTEM.md §8.6): views and taps per day over the last
 * 7, 30 or 90 days, and taps per block in page order.
 */
export async function getAnalytics(pageId: string, rangeInput: number = 30): Promise<AnalyticsResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await connectDB()

  const page = await (await import("@/lib/models/page")).Page.findOne({ _id: pageId, userId: session.user.id })
  if (!page) throw new Error("Unauthorized")

  const range: AnalyticsRange = rangeInput === 7 || rangeInput === 90 ? rangeInput : 30
  const today = new Date()
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const since = new Date(startOfToday - (range - 1) * DAY_MS)
  const id = page._id.toString()

  const [perDay, perBlock, blocks] = await Promise.all([
    ClickEvent.aggregate<{ _id: string; views: number; taps: number }>([
      { $match: { pageId: id, timestamp: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "UTC" } },
          taps: { $sum: { $cond: [{ $ne: ["$blockId", "pageview"] }, 1, 0] } },
          views: { $sum: { $cond: [{ $eq: ["$blockId", "pageview"] }, 1, 0] } },
        },
      },
    ]),
    ClickEvent.aggregate<{ _id: string; count: number }>([
      { $match: { pageId: id, blockId: { $ne: "pageview" }, timestamp: { $gte: since } } },
      { $group: { _id: "$blockId", count: { $sum: 1 } } },
    ]),
    Block.find({ pageId: page._id }).sort({ order: 1 }).select("type data isActive").lean(),
  ])

  const byDay = new Map(perDay.map((d) => [d._id, d]))
  const daily = Array.from({ length: range }, (_, i) => {
    const date = new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10)
    const row = byDay.get(date)
    return { date, views: row?.views ?? 0, taps: row?.taps ?? 0 }
  })
  const tapsByBlock = new Map(perBlock.map((b) => [b._id, b.count]))

  return {
    range,
    totals: {
      views: daily.reduce((sum, d) => sum + d.views, 0),
      taps: daily.reduce((sum, d) => sum + d.taps, 0),
    },
    daily,
    blocks: blocks.map((b) => {
      const data = (b.data ?? {}) as Record<string, unknown>
      const text = [data.title, data.label, data.text, data.content, data.caption].find((v) => typeof v === "string" && v.trim())
      return {
        blockId: b._id.toString(),
        type: b.type,
        text: typeof text === "string" ? text.slice(0, 80) : "",
        isActive: b.isActive,
        taps: tapsByBlock.get(b._id.toString()) ?? 0,
      }
    }),
  }
}
