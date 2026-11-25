import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { serializeBlockLean } from "@/lib/serialize-block"
import { resolveTheme, sanitizeCustomCSS, themeRootProps } from "@/lib/themes"
import { MadeWithLinkNest, ThemedPage } from "@/components/page/themed-page"
import { PageBeacon } from "@/components/page/page-beacon"
import { PasswordGate } from "@/components/page/password-gate"

interface Props {
  params: Promise<{ username: string }>
}

// Scheduled blocks start and end on their own: re-render at most once a minute.
export const revalidate = 60

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) return { title: "Page not found | LinkNest" }

  const page = await Page.findOne({ userId: user._id }).lean()
  if (!page) return { title: user.name || user.username }

  const name = user.name || user.username
  const hideFromRobots = page.visibility && page.visibility !== "public"

  return {
    title: page.seo?.title || `${name} | LinkNest`,
    description: page.seo?.description || page.bio || `${name}'s LinkNest page`,
    robots: hideFromRobots ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.seo?.title || `${name} | LinkNest`,
      description: page.seo?.description || page.bio,
      images: page.seo?.ogImageUrl ? [{ url: page.seo.ogImageUrl }] : undefined,
    },
  }
}

/**
 * The public page (DESIGN_SYSTEM.md §8.8). Rendered on the server in the owner's theme;
 * the only client code is the page beacon and the blocks that need it (form, countdown,
 * video) — plus the lock screen on a password-protected page.
 */
export default async function UserPage({ params }: Props) {
  const { username } = await params

  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) notFound()

  const page = await Page.findOne({ userId: user._id, isPublished: true }).lean()
  if (!page) notFound()

  const now = new Date()
  const blocks = (await Block.find({ pageId: page._id, isActive: true }).sort({ order: 1 }).lean())
    .filter((b) => !(b.startAt && b.startAt > now) && !(b.endAt && b.endAt < now))
    .map((b) => serializeBlockLean(b))

  const theme = resolveTheme(page.theme)
  const name = user.name || user.username
  const pageId = page._id.toString()
  const css = theme.customCSS ? sanitizeCustomCSS(theme.customCSS) : ""

  const content = (
    <ThemedPage
      theme={theme}
      header={{ name, title: page.title, bio: page.bio, avatarUrl: user.avatarUrl || undefined }}
      blocks={blocks}
      page
      footer={<MadeWithLinkNest />}
    />
  )

  return (
    <>
      {theme.font.href && (
        <>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={theme.font.href} precedence="theme-font" />
        </>
      )}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      {page.visibility === "password" ? (
        <PasswordGate pageId={pageId} name={name} root={themeRootProps(theme)}>
          <PageBeacon pageId={pageId} />
          {content}
        </PasswordGate>
      ) : (
        <>
          <PageBeacon pageId={pageId} />
          {content}
        </>
      )}
    </>
  )
}
