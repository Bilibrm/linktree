"use client"

import { useEffect, useRef, useState } from "react"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { trackPageView } from "@/lib/actions/analytics"
import { verifyPagePassword } from "@/lib/actions/page"
import { QRCodeCanvas } from "qrcode.react"
import { Lock } from "lucide-react"
import { getAvatarRadius, getLayoutMaxWidth, getSpacingGap, getAccentColor, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

function getThemeStyle(theme: ThemeConfig): React.CSSProperties {
  const base: React.CSSProperties = {}

  if (theme.backgroundType === "gradient" && theme.backgroundValue) {
    base.background = theme.backgroundValue
  } else if (theme.backgroundType === "image" && theme.backgroundValue) {
    base.backgroundImage = `url(${theme.backgroundValue})`
    base.backgroundSize = "cover"
    base.backgroundPosition = "center"
  } else {
    base.backgroundColor = theme.backgroundColor || "#ffffff"
  }

  if (theme.backgroundBlur) {
    base.backdropFilter = "blur(12px)"
  }

  return base
}

/** Strip the one tag that would let custom CSS break out of its <style> element. */
function sanitizeCustomCSS(css: string): string {
  return css.replace(/<\/style/gi, "")
}

export function PublicPageClient({
  username,
  displayName,
  avatarUrl,
  bio,
  title,
  theme,
  blocks,
  pageId,
  pageUrl,
  visibility,
  pageHasPassword,
}: {
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  title?: string
  theme: ThemeConfig
  blocks: IBlock[]
  pageId: string
  pageUrl: string
  visibility: "public" | "unlisted" | "password"
  pageHasPassword: boolean
}) {
  const tracked = useRef(false)
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!tracked.current && unlocked) {
      tracked.current = true
      trackPageView(pageId)
    }
  }, [pageId, unlocked])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setError("")
    const res = await verifyPagePassword(pageId, password)
    if (res.ok) {
      setUnlocked(true)
    } else {
      setError("Incorrect password")
    }
    setChecking(false)
  }

  const locked = visibility === "password" && !unlocked

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-bone p-4">
        <div className="w-full max-w-sm mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">This page is locked</h1>
            <p className="text-caption text-muted-foreground mt-1">Enter the password to view this page.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full h-10 rounded-lg bg-surface border border-white/10 text-bone text-caption px-4 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-gold/50"
            />
            {error && <p className="text-coral text-small">{error}</p>}
            <button
              type="submit"
              disabled={checking || !password}
              className="w-full h-10 rounded-lg bg-gold text-ink font-medium text-caption disabled:opacity-50"
            >
              {checking ? "Checking..." : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const bgStyle = getThemeStyle(theme)
  const font = theme.font || "var(--font-body)"
  const accent = getAccentColor(theme)
  const avatarRadius = getAvatarRadius(theme)
  const maxWidth = getLayoutMaxWidth(theme)
  const gap = getSpacingGap(theme)
  const anim = getEntranceAnimClass(theme)

  const visibleBlocks = blocks.filter((b) => {
    if (!b.isActive) return false
    const now = new Date()
    if (b.startAt && new Date(b.startAt) > now) return false
    if (b.endAt && new Date(b.endAt) < now) return false
    return true
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center py-14 px-4"
      style={{ ...bgStyle, fontFamily: font }}
    >
      {theme.customCSS && (
        // eslint-disable-next-line react/no-danger
        <style dangerouslySetInnerHTML={{ __html: sanitizeCustomCSS(theme.customCSS) }} />
      )}

      <div className={`w-full ${maxWidth} mx-auto flex flex-col items-center ${anim}`} style={getEntranceDelayStyle(0)}>
        <div
          className={`w-24 h-24 flex items-center justify-center text-3xl font-display font-bold mb-4 overflow-hidden ${avatarRadius}`}
          style={{
            backgroundColor: avatarUrl ? "transparent" : accent,
            color: theme.buttonTextColor || "#fff",
            boxShadow: theme.shadow && theme.shadow !== "none" ? "0 8px 24px -8px rgba(0,0,0,0.25)" : undefined,
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        <h1 className="font-display text-xl font-bold text-center" style={{ color: accent }}>
          {displayName}
        </h1>

        {title && (
          <p className="text-sm text-center mt-1" style={{ color: accent, opacity: 0.7 }}>
            {title}
          </p>
        )}

        {bio && (
          <p className="text-sm text-center mt-3 leading-relaxed max-w-xs" style={{ color: accent, opacity: 0.6 }}>
            {bio}
          </p>
        )}

        <div className={`w-full mt-7 flex flex-col ${gap}`}>
          {visibleBlocks.map((block, i) => (
            <BlockRenderer key={block._id} block={block} theme={theme} index={i} />
          ))}
        </div>

        {visibleBlocks.length === 0 && (
          <p className="text-sm mt-8 text-center" style={{ color: accent, opacity: 0.5 }}>
            This page is still being set up.
          </p>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <QRCodeCanvas value={pageUrl} size={80} level="L" />
          </div>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: accent, opacity: 0.4 }}
          >
            {pageUrl}
          </a>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs hover:underline"
            style={{ color: accent, opacity: 0.4 }}
          >
            LinkNest
          </a>
        </div>
      </div>
    </div>
  )
}
