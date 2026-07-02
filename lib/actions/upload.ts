"use server"

import { auth } from "@/lib/auth"

export async function uploadToCloudinary(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return { error: "Cloudinary not configured" }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadFormData = new FormData()
  uploadFormData.append("file", new Blob([buffer]), file.name)
  uploadFormData.append("upload_preset", uploadPreset)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    })

    const data = await res.json()
    if (data.error) return { error: data.error.message }

    return { success: true, url: data.secure_url, publicId: data.public_id }
  } catch {
    return { error: "Upload failed" }
  }
}
