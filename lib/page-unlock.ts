import { createHash, createHmac, timingSafeEqual } from "crypto"
import { Block } from "@/lib/models/block"
import { serializeBlockLean } from "@/lib/serialize-block"
import type { IBlock } from "@/types"

/**
 * Server-only helpers for password-protected pages. The public route never renders a
 * locked page's blocks; a visitor gets them from `lib/actions/unlock.ts` after the
 * password is checked, and keeps access through a signed, httpOnly cookie that names
 * one page and dies when the owner changes the password.
 */

/** How long one unlock lasts. */
export const UNLOCK_TTL_SECONDS = 60 * 60 * 12

export function unlockCookieName(pageId: string) {
  return `ln_unlock_${pageId}`
}

/**
 * The signing key: derived from the existing AUTH_SECRET with a fixed purpose string, so
 * no new environment variable is needed and an unlock cookie can never pass for anything
 * else signed with that secret.
 */
function secret() {
  const value = process.env.AUTH_SECRET
  // Fail closed: without a secret no cookie can be issued or trusted.
  if (!value) throw new Error("AUTH_SECRET is not set")
  return createHmac("sha256", value).update("linknest:page-unlock:v1").digest()
}

/** A short fingerprint of the stored hash, so a new password revokes old cookies. */
function hashTag(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16)
}

function sign(pageId: string, expires: number, passwordHash: string) {
  return createHmac("sha256", secret()).update(`${pageId}.${expires}.${hashTag(passwordHash)}`).digest("base64url")
}

export function createUnlockToken(pageId: string, passwordHash: string, now = Date.now()) {
  const expires = Math.floor(now / 1000) + UNLOCK_TTL_SECONDS
  return `${expires}.${sign(pageId, expires, passwordHash)}`
}

export function verifyUnlockToken(token: string | undefined, pageId: string, passwordHash: string, now = Date.now()) {
  if (!token) return false
  const [rawExpires, signature] = token.split(".")
  const expires = Number(rawExpires)
  if (!Number.isInteger(expires) || !signature || expires * 1000 < now) return false
  const expected = Buffer.from(sign(pageId, expires, passwordHash))
  const given = Buffer.from(signature)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** The blocks a visitor may see right now: shown, and inside their schedule. */
export async function loadVisibleBlocks(pageId: string): Promise<IBlock[]> {
  const now = new Date()
  return (await Block.find({ pageId, isActive: true }).sort({ order: 1 }).lean())
    .filter((b) => !(b.startAt && b.startAt > now) && !(b.endAt && b.endAt < now))
    .map((b) => serializeBlockLean(b))
}

/**
 * Wrong-password backoff, per visitor and page. In memory, so it resets with the server
 * instance; enough to make guessing slow without a store. Three free tries, then the wait
 * doubles from 2s up to 5 minutes.
 */
const failures = new Map<string, { count: number; until: number; last: number }>()
const FREE_TRIES = 3
const MAX_WAIT_MS = 5 * 60_000
/** A visitor who stops guessing for this long starts over with free tries. */
const FORGET_MS = 15 * 60_000

export function unlockWaitSeconds(key: string, now = Date.now()) {
  const entry = failures.get(key)
  if (!entry || entry.until <= now) return 0
  return Math.ceil((entry.until - now) / 1000)
}

export function recordUnlockFailure(key: string, now = Date.now()) {
  if (failures.size > 10_000) {
    for (const [k, v] of failures) if (v.last + FORGET_MS < now) failures.delete(k)
  }
  const previous = failures.get(key)
  const count = (previous && previous.last + FORGET_MS > now ? previous.count : 0) + 1
  const wait = count < FREE_TRIES ? 0 : Math.min(2000 * 2 ** (count - FREE_TRIES), MAX_WAIT_MS)
  failures.set(key, { count, until: now + wait, last: now })
  return Math.ceil(wait / 1000)
}

export function clearUnlockFailures(key: string) {
  failures.delete(key)
}
