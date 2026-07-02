"use server"

import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { signupSchema, loginSchema, usernameSchema } from "@/lib/validation"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { revalidatePath } from "next/cache"
import { Page } from "@/lib/models/page"

export async function signupAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = signupSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, field: true }
  }

  const { email, password, username, name } = parsed.data

  await connectDB()

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  })

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return { error: "An account with this email already exists", field: "email" }
    }
    return { error: "This username is already taken", field: "username" }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    username: username.toLowerCase(),
    name: name || undefined,
    plan: "free",
  })

  await Page.create({
    userId: user._id,
    title: name || username,
    bio: "",
    theme: {
      preset: "minimal",
      backgroundType: "solid",
      buttonStyle: "rounded",
      linkStyle: "standard",
    },
    isPublished: true,
  })

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Authentication failed after signup. Please log in." }
    }
    throw error
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function loginAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: "Invalid email or password", field: true }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    throw error
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function logoutAction() {
  await signOut({ redirect: false })
  revalidatePath("/")
}

export async function checkUsername(username: string) {
  const parsed = usernameSchema.safeParse(username)
  if (!parsed.success) {
    return { available: false, error: parsed.error.issues[0]?.message || "Invalid username" }
  }

  await connectDB()
  const existing = await User.findOne({ username: username.toLowerCase() })
  return { available: !existing }
}

export async function loginActionRaw(values: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Invalid email or password" }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    throw error
  }

  revalidatePath("/dashboard")
  return { success: true }
}
