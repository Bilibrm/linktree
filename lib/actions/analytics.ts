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

export async function getAnalytics(pageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await connectDB()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalClicks, totalViews, clicks7d, views7d, topBlocks, dailyData] = await Promise.all([
    ClickEvent.countDocuments({ pageId, blockId: { $ne: "pageview" } }),
    ClickEvent.countDocuments({ pageId, blockId: "pageview" }),
    ClickEvent.countDocuments({ pageId, blockId: { $ne: "pageview" }, timestamp: { $gte: sevenDaysAgo } }),
    ClickEvent.countDocuments({ pageId, blockId: "pageview", timestamp: { $gte: sevenDaysAgo } }),
    ClickEvent.aggregate([
      { $match: { pageId, blockId: { $ne: "pageview" } } },
      { $group: { _id: "$blockId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    ClickEvent.aggregate([
      { $match: { pageId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: { $cond: [{ $ne: ["$blockId", "pageview"] }, 1, 0] } },
          views: { $sum: { $cond: [{ $eq: ["$blockId", "pageview"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
  ])

  const blockIds = topBlocks.map((b: { _id: string }) => b._id)
  const blocks = blockIds.length > 0 ? await Block.find({ _id: { $in: blockIds } }).select("type data").lean() : []

  const blockMap = new Map(blocks.map((b) => [b._id.toString(), b]))
  const topLinks = topBlocks.map((b: { _id: string; count: number }) => ({
    blockId: b._id,
    title: (blockMap.get(b._id)?.data as any)?.title || (blockMap.get(b._id)?.data as any)?.text || "Unknown",
    type: blockMap.get(b._id)?.type || "unknown",
    clicks: b.count,
  }))

  return {
    totalClicks,
    totalViews,
    clicks7d,
    views7d,
    topLinks,
    dailyData,
  }
}
