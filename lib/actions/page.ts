"use server"

import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { User } from "@/lib/models/user"
import { pageSettingsSchema, themeSaveSchema, updateProfileSchema } from "@/lib/validation"
import { draftToStored } from "@/lib/themes/edit"
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

/**
 * Save the page's look (DESIGN_SYSTEM.md §8.5). Only `theme.preset`, `theme.v2` and
 * `theme.customCSS` are written; fields from before v2 stay in the document untouched,
 * and `resolveTheme` ignores them once a recipe exists.
 */
export async function updateMyTheme(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = themeSaveSchema.safeParse(input)
  if (!parsed.success) return { error: "That look could not be saved. Reload the page and try again." }

  const stored = draftToStored(parsed.data)

  await connectDB()
  const page = await getOwnedPageOrThrow(session.user.id)
  await Page.updateOne(
    { _id: page._id },
    { $set: { "theme.preset": stored.preset, "theme.v2": stored.v2, "theme.customCSS": stored.customCSS } }
  )
  revalidatePath("/dashboard", "layout")
  if (session.user.username) revalidatePath(`/${session.user.username}`)
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

  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await connectDB()
  await User.findByIdAndUpdate(userId, parsed.data)
  revalidatePath("/dashboard")
  // The public page shows the name and photo, and it is statically cached.
  if (session.user.username) revalidatePath(`/${session.user.username}`)
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
