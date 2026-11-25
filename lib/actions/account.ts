"use server"

import { auth, signOut } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { ClickEvent } from "@/lib/models/click-event"
import { FormSubmission } from "@/lib/models/form-submission"
import { revalidatePath } from "next/cache"

/**
 * Delete the signed-in owner's account for good (DESIGN_SYSTEM.md §8.7): the user, their
 * page, its blocks, its counted views and taps, and its form answers. The owner must type
 * their username; it is checked here against the account, not trusted from the client.
 */
export async function deleteMyAccount(confirmUsername: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await connectDB()
  const user = await User.findById(session.user.id).select("username").lean()
  if (!user) throw new Error("Unauthorized")
  if (typeof confirmUsername !== "string" || confirmUsername.trim().toLowerCase() !== user.username.toLowerCase()) {
    return { error: "Type your username exactly as shown to confirm." }
  }

  const pages = await Page.find({ userId: user._id }).select("_id").lean()
  const pageIds = pages.map((p) => p._id)
  const pageIdStrings = pageIds.map((id) => id.toString())

  await Promise.all([
    ClickEvent.deleteMany({ pageId: { $in: pageIdStrings } }),
    FormSubmission.deleteMany({ pageId: { $in: pageIdStrings } }),
    Block.deleteMany({ pageId: { $in: pageIds } }),
  ])
  await Page.deleteMany({ userId: user._id })
  await User.deleteOne({ _id: user._id })

  revalidatePath(`/${user.username}`)
  await signOut({ redirectTo: "/" })
  return { success: true }
}
