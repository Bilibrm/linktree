"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { trackPageView } from "@/lib/actions/analytics"
import { verifyPagePassword } from "@/lib/actions/page"
import { QRCodeCanvas } from "qrcode.react"
import { Lock, Unlock } from "lucide-react"
import { getAvatarRadius, getLayoutMaxWidth, getDesktopContentMaxWidth, getSpacingGap, getEntranceAnimClass, getEntranceDelayStyle, getBlockSpanClass, themeToCSSVars, getBackgroundStyle } from "@/lib/theme-utils"
import { DynamicFontLoader } from "@/components/dynamic-font-loader"

function sanitizeCustomCSS(css: string): string {
  return css
    .replace(/<[^>]*>/g, "")
    .replace(/@import\s[^;]+;/gi, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/expression\s*\(/gi, "")
    .trim()
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
  const totalActive = visibleBlocks.length

  if (locked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ ...bgStyle, ...cssVars, fontFamily: "var(--page-font-family)" }}
      >
        <div className="w-full max-w-sm mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl border border-white/[0.08] flex items-center justify-center mx-auto"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)` }}>
            <Lock className="w-7 h-7" style={{ color: accent }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: "var(--page-accent)" }}>This page is locked</h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--page-accent)", opacity: 0.6 }}>Enter the password to view this page.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-[260px] mx-auto">
            <label className="sr-only" htmlFor="page-password">Password</label>
            <input
              id="page-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full h-11 rounded-xl text-sm px-4 text-center placeholder:opacity-40 focus:outline-none focus:ring-2 transition-shadow"
              style={{
                backgroundColor: `color-mix(in srgb, ${accent} 6%, transparent)`,
                color: "var(--page-accent)",
                borderColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                boxShadow: "none",
              }}
              onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${accent}40` }}
              onBlur={(e) => { e.target.style.boxShadow = "none" }}
            />
            {error && <p className="text-sm text-coral" style={{ opacity: 0.9 }}>{error}</p>}
            <button
              type="submit"
              disabled={checking || !password}
              className="w-full h-11 rounded-xl text-sm font-medium disabled:opacity-40 transition-all hover:brightness-110"
              style={{ backgroundColor: accent, color: "var(--page-button-text)" }}
            >
              {checking ? "Checking..." : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const showAmbientGlow = theme.backgroundType === "solid" || !theme.backgroundType

  const avatar = (
    <div className={`p-[3px] avatar-ring ${avatarRadius}`}>
      <div
        className={`w-[94px] h-[94px] lg:w-[120px] lg:h-[120px] flex items-center justify-center text-3xl lg:text-4xl font-display font-bold overflow-hidden ${avatarRadius}`}
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
    </div>
  )

  const qrBlock = (
    <div className="flex flex-col items-center lg:items-start gap-3">
      <div className="rounded-xl p-2 shadow-sm inline-block" style={{ backgroundColor: "white" }}>
        <QRCodeCanvas value={pageUrl} size={80} level="L" />
      </div>
      <a
        href={pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:underline underline-offset-2 transition-all"
        style={{ color: "var(--page-accent)", opacity: 0.35 }}
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

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-20">

          <div
            className={`w-full lg:w-[280px] lg:shrink-0 lg:sticky lg:top-20 flex flex-col items-center lg:items-start text-center lg:text-left ${anim}`}
            style={getEntranceDelayStyle(0)}
          >
            {avatar}

            <h1 className="font-display text-xl lg:text-[22px] font-bold mt-5 leading-tight tracking-tight" style={{ color: "var(--page-accent)" }}>
              {displayName}
            </h1>

            {title && (
              <p className="text-sm text-center lg:text-left mt-1.5 leading-snug" style={{ color: "var(--page-accent)", opacity: 0.65 }}>
                {title}
              </p>
            )}

            {bio && (
              <p className="text-sm text-center lg:text-left mt-3 leading-relaxed max-w-[260px]" style={{ color: "var(--page-accent)", opacity: 0.5 }}>
                {bio}
              </p>
            )}

            {totalActive > 0 && (
              <p className="text-xs mt-4 tracking-wide" style={{ color: "var(--page-accent)", opacity: 0.35 }}>
                {totalActive} item{totalActive !== 1 ? "s" : ""}
              </p>
            )}

            <div className="hidden lg:block mt-10">{qrBlock}</div>
          </div>

          <div className={`w-full ${maxWidth} ${desktopMaxWidth} mx-auto lg:mx-0`}>
            <div className={`grid grid-cols-2 ${gap}`}>
              {visibleBlocks.map((block, i) => (
                <div key={block._id} className={getBlockSpanClass(block.type, block.data)}>
                  <BlockRenderer block={block} theme={theme} index={i} />
                </div>
              ))}
            </div>

            {visibleBlocks.length === 0 && (
              <p className="text-sm mt-4 text-center lg:text-left leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.4 }}>
                This page is still being set up.
              </p>
            )}

            <div className="pt-8 text-center lg:text-left">
              <Link
                href="/"
                className="text-xs hover:underline underline-offset-2 transition-all"
                style={{ color: "var(--page-accent)", opacity: 0.3 }}
              >
                LinkNest
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-12 flex flex-col items-center">{qrBlock}</div>
      </div>
    </div>
  )
}
