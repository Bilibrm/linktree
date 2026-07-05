"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { trackPageView } from "@/lib/actions/analytics"
import { verifyPagePassword } from "@/lib/actions/page"
import { QRCodeCanvas } from "qrcode.react"
import { Lock } from "lucide-react"
import { getAvatarRadius, getLayoutMaxWidth, getDesktopContentMaxWidth, getSpacingGap, getEntranceAnimClass, getEntranceDelayStyle, themeToCSSVars, getBackgroundStyle } from "@/lib/theme-utils"
import { DynamicFontLoader } from "@/components/dynamic-font-loader"

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

  const bgStyle = getBackgroundStyle(theme)
  const cssVars = useMemo(() => themeToCSSVars(theme), [theme])
  const avatarRadius = getAvatarRadius(theme)
  const maxWidth = getLayoutMaxWidth(theme)
  const desktopMaxWidth = getDesktopContentMaxWidth(theme)
  const gap = getSpacingGap(theme)
  const anim = getEntranceAnimClass(theme)
  const accent = theme.accentColor || "#16302A"

  const visibleBlocks = useMemo(() => blocks.filter((b) => {
    if (!b.isActive) return false
    const now = new Date()
    if (b.startAt && new Date(b.startAt) > now) return false
    if (b.endAt && new Date(b.endAt) < now) return false
    return true
  }), [blocks])

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

  // Ambient glow only makes sense on solid/gradient backgrounds — a custom image
  // or animated gradient already fills the space, so a tinted blur behind it would
  // just muddy what the user picked.
  const showAmbientGlow = theme.backgroundType === "solid" || !theme.backgroundType

  const avatar = (
    <div
      className={`w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center text-3xl lg:text-4xl font-display font-bold overflow-hidden ${avatarRadius}`}
      style={{
        backgroundColor: avatarUrl ? "transparent" : "var(--page-accent)",
        color: "var(--page-button-text)",
        boxShadow: theme.shadow && theme.shadow !== "none" ? "0 8px 24px -8px rgba(0,0,0,0.25)" : undefined,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
      ) : (
        displayName.charAt(0).toUpperCase()
      )}
    </div>
  )

  const qrBlock = (
    <div className="flex flex-col items-center lg:items-start gap-3">
      <div className="bg-white rounded-xl p-2 shadow-sm inline-block">
        <QRCodeCanvas value={pageUrl} size={80} level="L" />
      </div>
      <a
        href={pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:opacity-70 transition-opacity"
        style={{ color: "var(--page-accent)", opacity: 0.4 }}
      >
        {pageUrl}
      </a>
    </div>
  )

  return (
    <div
      className="relative min-h-screen"
      style={{ ...bgStyle, ...cssVars, fontFamily: "var(--page-font-family)" }}
    >
      <DynamicFontLoader font={theme.font} />

      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCustomCSS(theme.customCSS) }} />
      )}

      {showAmbientGlow && (
        <div className="hidden lg:block pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full blur-[120px] opacity-[0.14]"
            style={{ background: accent }}
          />
          <div
            className="absolute -bottom-48 -right-40 w-[620px] h-[620px] rounded-full blur-[130px] opacity-[0.1]"
            style={{ background: accent }}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">

          {/* Profile panel — becomes a sticky sidebar at lg+, stacked header on mobile */}
          <div
            className={`w-full lg:w-[300px] lg:shrink-0 lg:sticky lg:top-16 flex flex-col items-center lg:items-start text-center lg:text-left ${anim}`}
            style={getEntranceDelayStyle(0)}
          >
            {avatar}

            <h1 className="font-display text-xl lg:text-2xl font-bold mt-4" style={{ color: "var(--page-accent)" }}>
              {displayName}
            </h1>

            {title && (
              <p className="text-sm text-center lg:text-left mt-1" style={{ color: "var(--page-accent)", opacity: 0.7 }}>
                {title}
              </p>
            )}

            {bio && (
              <p className="text-sm text-center lg:text-left mt-3 leading-relaxed max-w-xs" style={{ color: "var(--page-accent)", opacity: 0.6 }}>
                {bio}
              </p>
            )}

            <div className="hidden lg:block mt-8">{qrBlock}</div>
          </div>

          {/* Content column */}
          <div className={`w-full ${maxWidth} ${desktopMaxWidth} mx-auto lg:mx-0 flex flex-col ${gap}`}>
            {visibleBlocks.map((block, i) => (
              <BlockRenderer key={block._id} block={block} theme={theme} index={i} />
            ))}

            {visibleBlocks.length === 0 && (
              <p className="text-sm mt-4 text-center lg:text-left" style={{ color: "var(--page-accent)", opacity: 0.5 }}>
                This page is still being set up.
              </p>
            )}

            <div className="pt-6 text-center lg:text-left">
              <Link
                href="/"
                className="text-xs hover:underline"
                style={{ color: "var(--page-accent)", opacity: 0.4 }}
              >
                LinkNest
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-10 flex flex-col items-center">{qrBlock}</div>
      </div>
    </div>
  )
}
