"use client"

import { useEffect, useRef, useState } from "react"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { trackPageView } from "@/lib/actions/analytics"
import { verifyPagePassword } from "@/lib/actions/page"
import { QRCodeCanvas } from "qrcode.react"
import { Lock } from "lucide-react"

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

  return base
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
  const font = theme.font || "Geist"

  return (
    <div
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ ...bgStyle, fontFamily: font }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden"
          style={{
            backgroundColor: avatarUrl ? "transparent" : theme.accentColor || "#000",
            color: theme.buttonTextColor || "#fff",
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        <h1
          className="text-xl font-bold text-center"
          style={{ color: theme.accentColor || "#000" }}
        >
          {displayName}
        </h1>

        {title && (
          <p className="text-sm text-center mt-1 opacity-70" style={{ color: theme.accentColor || "#000" }}>
            {title}
          </p>
        )}

        {bio && (
          <p
            className="text-sm text-center mt-3 leading-relaxed max-w-xs"
            style={{ color: theme.accentColor || "#000", opacity: 0.6 }}
          >
            {bio}
          </p>
        )}

        <div className="w-full mt-6 space-y-3">
          {blocks.map((block) => (
            <BlockRenderer key={block._id} block={block} />
          ))}
        </div>

        {blocks.length === 0 && (
          <p className="text-sm opacity-50 mt-8 text-center" style={{ color: theme.accentColor || "#000" }}>
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
            className="text-xs opacity-40 hover:opacity-60 transition-opacity"
            style={{ color: theme.accentColor || "#000" }}
          >
            {pageUrl}
          </a>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs hover:underline"
            style={{ color: theme.accentColor || "#000", opacity: 0.4 }}
          >
            LinkNest
          </a>
        </div>
      </div>
    </div>
  )
}
