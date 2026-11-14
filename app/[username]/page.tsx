import { pageUrl } from "@/lib/site"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { PublicPageClient } from "./public-page-client"
import { pageThemeToConfig, serializeBlockLean } from "@/lib/serialize-block"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) return { title: "Not Found" }

  const page = await Page.findOne({ userId: user._id }).lean()
  if (!page) return { title: user.name || user.username }

  const hideFromRobots = page.visibility && page.visibility !== "public"

  return {
    title: page.seo?.title || `${user.name || user.username} | LinkNest`,
    description: page.seo?.description || page.bio || `${user.name || user.username}'s LinkNest page`,
    robots: hideFromRobots ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.seo?.title || `${user.name || user.username} | LinkNest`,
      description: page.seo?.description || page.bio,
      images: page.seo?.ogImageUrl ? [{ url: page.seo.ogImageUrl }] : undefined,
    },
  }
}

export default async function UserPage({ params }: Props) {
  const { username } = await params

  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) notFound()

  const page = await Page.findOne({ userId: user._id, isPublished: true }).lean()
  if (!page) notFound()

  const blocks = await Block.find({ pageId: page._id, isActive: true }).sort({ order: 1 }).lean()

  const now = new Date()
  const activeBlocks = blocks.filter((b) => {
    if (b.startAt && b.startAt > now) return false
    if (b.endAt && b.endAt < now) return false
    return true
  })

  const serializedBlocks = activeBlocks.map((b) => serializeBlockLean(b))

  const publicUrl = pageUrl(username)

  return (
    <PublicPageClient
      username={username}
      displayName={user.name || username}
      avatarUrl={user.avatarUrl}
      bio={page.bio}
      title={page.title}
      theme={pageThemeToConfig(page.theme)}
      blocks={serializedBlocks}
      pageId={page._id.toString()}
      pageUrl={publicUrl}
      visibility={page.visibility || "public"}
      pageHasPassword={!!page.passwordHash}
    />
  )
}
