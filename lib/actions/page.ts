"use server"

import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { User } from "@/lib/models/user"
import { pageSettingsSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

async function getOwnedPageOrThrow(userId: string) {
  const page = await Page.findOne({ userId })
  if (!page) throw new Error("Page not found")
  return page
}

export async function getMyPage() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) throw new Error("Page not found")

  return {
    ...page,
    _id: page._id.toString(),
    userId: page.userId.toString(),
  }
}

export async function updateMyPage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  const raw = Object.fromEntries(formData)

  const parsed = pageSettingsSchema.safeParse({
    ...raw,
    isPublished: raw.isPublished === "true" ? true : raw.isPublished === "false" ? false : undefined,
    visibility: raw.visibility || undefined,
    theme: raw.theme ? JSON.parse(raw.theme as string) : undefined,
    seo: raw.seo ? JSON.parse(raw.seo as string) : undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await connectDB()
  const page = await getOwnedPageOrThrow(userId)

  const updates: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) updates.title = parsed.data.title
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio
  if (parsed.data.isPublished !== undefined) updates.isPublished = parsed.data.isPublished
  if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme
  if (parsed.data.seo !== undefined) updates.seo = parsed.data.seo
  if (parsed.data.visibility !== undefined) updates.visibility = parsed.data.visibility
  if (parsed.data.password) {
    updates.passwordHash = await bcrypt.hash(parsed.data.password, 10)
  }

  await Page.findByIdAndUpdate(page._id, updates)
  revalidatePath("/dashboard")
  revalidatePath(`/${session.user.username}`)
  return { success: true }
}

export async function getMyUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await connectDB()
  const user = await User.findById(session.user.id).select("-passwordHash").lean()
  if (!user) throw new Error("User not found")

  return {
    ...user,
    _id: user._id.toString(),
  }
}

export async function updateMyProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  const raw = Object.fromEntries(formData)

  await connectDB()
  const updates: Record<string, unknown> = {}
  if (raw.name) updates.name = raw.name
  if (raw.avatarUrl) updates.avatarUrl = raw.avatarUrl

  await User.findByIdAndUpdate(userId, updates)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function verifyPagePassword(pageId: string, password: string) {
  await connectDB()
  const page = await Page.findById(pageId).select("passwordHash").lean()
  if (!page?.passwordHash) return { ok: false }
  const match = await bcrypt.compare(password, page.passwordHash)
  if (!match) return { ok: false }
  return { ok: true }
}
