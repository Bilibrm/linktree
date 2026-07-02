"use server"

import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import { Block } from "@/lib/models/block"
import { Page } from "@/lib/models/page"
import { createBlockSchema, updateBlockSchema, reorderBlocksSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"

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
  return blocks.map((b) => ({
    _id: String(b._id),
    pageId: String(b.pageId),
    type: b.type,
    order: b.order,
    data: b.data,
    startAt: b.startAt ? new Date(b.startAt).toISOString() : null,
    endAt: b.endAt ? new Date(b.endAt).toISOString() : null,
    isActive: b.isActive,
    createdAt: (b as any).createdAt?.toISOString(),
    updatedAt: (b as any).updatedAt?.toISOString(),
  }))
}

export async function createBlock(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  const raw = Object.fromEntries(formData)
  const parsed = createBlockSchema.safeParse({
    ...raw,
    data: raw.data ? JSON.parse(raw.data as string) : {},
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await connectDB()
  await getOwnedPage(parsed.data.pageId, userId)

  const maxOrder = await Block.findOne({ pageId: parsed.data.pageId }).sort({ order: -1 }).select("order").lean()
  const order = parsed.data.order ?? (maxOrder ? (maxOrder as any).order + 1 : 0)

  const block = await Block.create({
    pageId: parsed.data.pageId,
    type: parsed.data.type,
    data: parsed.data.data,
    order,
    startAt: parsed.data.startAt || null,
    endAt: parsed.data.endAt || null,
  })

  revalidatePath("/dashboard")
  const plain = block.toObject()
  return { success: true, block: serializeBlock(plain) }
}

function serializeBlock(b: Record<string, unknown>) {
  return {
    _id: String(b._id),
    pageId: String(b.pageId),
    type: b.type,
    order: b.order,
    data: b.data,
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

  revalidatePath("/dashboard")
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

  const operations = parsed.data.blocks.map((b) => ({
    updateOne: {
      filter: { _id: b._id },
      update: { $set: { order: b.order } },
    },
  }))

  await Block.bulkWrite(operations)
  revalidatePath("/dashboard")
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
  revalidatePath("/dashboard")

  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleBlockActive(blockId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  await connectDB()

  const block = await Block.findById(blockId)
  if (!block) throw new Error("Block not found")

  await getOwnedPage(block.pageId.toString(), userId)
  block.isActive = !block.isActive
  await block.save()

  revalidatePath("/dashboard")
  return { success: true, isActive: block.isActive }
}
