"use server"

import mongoose from "mongoose"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import { Block } from "@/lib/models/block"
import { Page } from "@/lib/models/page"
import { ClickEvent } from "@/lib/models/click-event"
import { FormSubmission } from "@/lib/models/form-submission"
import { createBlockSchema, updateBlockSchema, reorderBlocksSchema } from "@/lib/validation"
import { serializeBlockLean, type LeanBlockDoc } from "@/lib/serialize-block"
import { revalidatePath } from "next/cache"

/** The editor route, and the owner’s public page so visitors get the change (it is statically cached). */
function revalidateEditorAndPublicPage(username?: string) {
  revalidatePath("/dashboard")
  if (username) revalidatePath(`/${username}`)
}

async function getOwnedPage(pageId: string, userId: string) {
  const page = await Page.findOne({ _id: pageId, userId })
  if (!page) throw new Error("Page not found or unauthorized")
  return page
}

export async function getBlocks(pageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  await connectDB()

  await getOwnedPage(pageId, userId)

  const blocks = await Block.find({ pageId }).sort({ order: 1 }).lean()
  return blocks.map((b) => {
    const lean = b as LeanBlockDoc & { createdAt?: Date; updatedAt?: Date }
    const serialized = serializeBlockLean(lean)
    return {
      ...serialized,
      createdAt: lean.createdAt?.toISOString(),
      updatedAt: lean.updatedAt?.toISOString(),
    }
  })
}

/**
 * Create a block. Without `position` it is appended, as before.
 * With `position` (0-based index in the page's current order) it is inserted there and the
 * page is renumbered around it. `restoreId` and `isActive` let an undo bring a deleted
 * block back under its original id, so its clicks and form entries stay attached.
 */
export async function createBlock(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  const raw = Object.fromEntries(formData)
  const { position: rawPosition, restoreId: rawRestoreId, isActive: rawIsActive, order: rawOrder, ...rest } = raw
  const parsed = createBlockSchema.safeParse({
    ...rest,
    order: typeof rawOrder === "string" && rawOrder !== "" ? Number(rawOrder) : undefined,
    data: raw.data ? JSON.parse(raw.data as string) : {},
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const position = typeof rawPosition === "string" && /^\d+$/.test(rawPosition) ? Number(rawPosition) : undefined
  const restoreId =
    typeof rawRestoreId === "string" && mongoose.isValidObjectId(rawRestoreId) ? rawRestoreId : undefined

  await connectDB()
  await getOwnedPage(parsed.data.pageId, userId)

  if (restoreId && (await Block.exists({ _id: restoreId }))) {
    return { error: { restoreId: ["That block already exists"] } }
  }
  if (restoreId) {
    // An id can only come back on the page it lived on: its clicks and form entries are
    // read by block id, so it must never be claimed by another page.
    const foreign = { blockId: restoreId, pageId: { $ne: parsed.data.pageId } }
    if ((await ClickEvent.exists(foreign)) || (await FormSubmission.exists(foreign))) {
      return { error: { restoreId: ["That block belongs to another page"] } }
    }
  }

  let order: number
  if (position !== undefined) {
    // Stored orders can have gaps, so renumber the whole page around the new slot.
    const existing = await Block.find({ pageId: parsed.data.pageId }).sort({ order: 1 }).select("_id").lean()
    const index = Math.min(position, existing.length)
    const operations = existing.map((b, i) => ({
      updateOne: {
        filter: { _id: b._id, pageId: parsed.data.pageId },
        update: { $set: { order: i < index ? i : i + 1 } },
      },
    }))
    if (operations.length > 0) await Block.bulkWrite(operations)
    order = index
  } else {
    const maxOrder = await Block.findOne({ pageId: parsed.data.pageId }).sort({ order: -1 }).select("order").lean()
    order = parsed.data.order ?? (maxOrder ? maxOrder.order + 1 : 0)
  }

  const block = await Block.create({
    ...(restoreId ? { _id: restoreId } : {}),
    pageId: parsed.data.pageId,
    type: parsed.data.type,
    data: parsed.data.data,
    order,
    startAt: parsed.data.startAt || null,
    endAt: parsed.data.endAt || null,
    ...(rawIsActive === "false" ? { isActive: false } : {}),
  })

  revalidateEditorAndPublicPage(session.user.username)
  const plain = block.toObject()
  return { success: true, block: serializeBlock(plain) }
}

function serializeBlock(b: Record<string, unknown>) {
  return {
    _id: String(b._id),
    pageId: String(b.pageId),
    type: b.type,
    order: b.order,
    data: b.data ?? {},
    startAt: b.startAt ? new Date(b.startAt as Date).toISOString() : null,
    endAt: b.endAt ? new Date(b.endAt as Date).toISOString() : null,
    isActive: b.isActive,
  }
}

export async function updateBlock(blockId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  const raw = Object.fromEntries(formData)
  const parsed = updateBlockSchema.safeParse({
    ...raw,
    // FormData only carries strings.
    isActive: raw.isActive === "true" ? true : raw.isActive === "false" ? false : undefined,
    data: raw.data ? JSON.parse(raw.data as string) : undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await connectDB()
  const block = await Block.findById(blockId)
  if (!block) throw new Error("Block not found")

  await getOwnedPage(block.pageId.toString(), userId)

  const updates: Record<string, unknown> = {}
  if (parsed.data.data !== undefined) updates.data = parsed.data.data
  if (parsed.data.order !== undefined) updates.order = parsed.data.order
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive
  if (parsed.data.startAt !== undefined) updates.startAt = parsed.data.startAt || null
  if (parsed.data.endAt !== undefined) updates.endAt = parsed.data.endAt || null

  await Block.findByIdAndUpdate(blockId, updates)

  revalidateEditorAndPublicPage(session.user.username)
  return { success: true }
}

export async function reorderBlocks(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData)
  const blocks = raw.blocks ? JSON.parse(raw.blocks as string) : []
  const parsed = reorderBlocksSchema.safeParse({ blocks })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await connectDB()

  // Only the caller's own page: a block id from someone else's page matches nothing.
  const page = await Page.findOne({ userId: session.user.id }).select("_id").lean()
  if (!page) throw new Error("Page not found or unauthorized")

  const operations = parsed.data.blocks.map((b) => ({
    updateOne: {
      filter: { _id: b._id, pageId: page._id },
      update: { $set: { order: b.order } },
    },
  }))

  if (operations.length > 0) await Block.bulkWrite(operations)
  revalidateEditorAndPublicPage(session.user.username)
  return { success: true }
}

export async function deleteBlock(blockId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  await connectDB()

  const block = await Block.findById(blockId)
  if (!block) throw new Error("Block not found")

  await getOwnedPage(block.pageId.toString(), userId)
  await Block.findByIdAndDelete(blockId)
  revalidateEditorAndPublicPage(session.user.username)
  return { success: true }
}
