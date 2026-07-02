"use server"

import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import { FormSubmission } from "@/lib/models/form-submission"
import { Block } from "@/lib/models/block"
import { formSubmissionSchema } from "@/lib/validation"

export async function submitForm(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = formSubmissionSchema.safeParse({
    blockId: raw.blockId,
    pageId: raw.pageId,
    data: raw.data ? JSON.parse(raw.data as string) : {},
  })

  if (!parsed.success) return { error: "Invalid submission" }

  await connectDB()
  await FormSubmission.create({
    blockId: parsed.data.blockId,
    pageId: parsed.data.pageId,
    data: parsed.data.data,
  })

  return { success: true }
}

export async function getFormSubmissions(blockId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await connectDB()

  const block = await Block.findById(blockId)
  if (!block) throw new Error("Block not found")

  const page = await (await import("@/lib/models/page")).Page.findOne({ _id: block.pageId, userId: session.user.id })
  if (!page) throw new Error("Unauthorized")

  const submissions = await FormSubmission.find({ blockId }).sort({ submittedAt: -1 }).lean()

  return submissions.map((s) => ({
    ...s,
    _id: s._id.toString(),
    blockId: s.blockId.toString(),
    pageId: s.pageId.toString(),
    submittedAt: s.submittedAt.toISOString(),
  }))
}
