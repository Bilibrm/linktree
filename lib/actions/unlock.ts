"use server"

import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { cookies, headers } from "next/headers"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import {
  UNLOCK_TTL_SECONDS,
  clearUnlockFailures,
  createUnlockToken,
  loadVisibleBlocks,
  recordUnlockFailure,
  unlockCookieName,
  unlockWaitSeconds,
  verifyUnlockToken,
} from "@/lib/page-unlock"
import type { IBlock } from "@/types"

export type UnlockResult =
  | { ok: true; blocks: IBlock[] }
  | { ok: false; reason: "wrong" | "wait" | "locked"; waitSeconds?: number }

async function lockedPage(pageId: string) {
  if (typeof pageId !== "string" || !mongoose.isValidObjectId(pageId)) return null
  await connectDB()
  const page = await Page.findOne({ _id: pageId, isPublished: true, visibility: "password" }).select("passwordHash").lean()
  return page?.passwordHash ? { id: page._id.toString(), passwordHash: page.passwordHash } : null
}

async function visitorKey(pageId: string) {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  return `${ip}|${pageId}`
}

/**
 * Check a visitor's password for a locked page. On success the visitor gets a signed,
 * httpOnly cookie for this page only, and the page's blocks; until then the server has
 * sent none of them.
 */
export async function unlockPage(pageId: string, password: string): Promise<UnlockResult> {
  const key = await visitorKey(String(pageId))
  const wait = unlockWaitSeconds(key)
  if (wait > 0) return { ok: false, reason: "wait", waitSeconds: wait }

  const page = await lockedPage(pageId)
  if (!page) return { ok: false, reason: "locked" }

  const match = typeof password === "string" && password.length <= 200 && (await bcrypt.compare(password, page.passwordHash))
  if (!match) {
    const next = recordUnlockFailure(key)
    return next > 0 ? { ok: false, reason: "wait", waitSeconds: next } : { ok: false, reason: "wrong" }
  }

  clearUnlockFailures(key)
  ;(await cookies()).set(unlockCookieName(page.id), createUnlockToken(page.id, page.passwordHash), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UNLOCK_TTL_SECONDS,
  })
  return { ok: true, blocks: await loadVisibleBlocks(page.id) }
}

/** A returning visitor: their cookie, if still valid for this page and password, opens it. */
export async function openUnlockedPage(pageId: string): Promise<UnlockResult> {
  const page = await lockedPage(pageId)
  if (!page) return { ok: false, reason: "locked" }
  const token = (await cookies()).get(unlockCookieName(page.id))?.value
  if (!verifyUnlockToken(token, page.id, page.passwordHash)) return { ok: false, reason: "locked" }
  return { ok: true, blocks: await loadVisibleBlocks(page.id) }
}
