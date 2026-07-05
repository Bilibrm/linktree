import { useMemo } from "react"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "./block-renderer"
import { getAvatarRadius, getLayoutMaxWidth, getSpacingGap, themeToCSSVars, getBackgroundStyle } from "@/lib/theme-utils"

export function PublicPreview({
  blocks,
  username,
  displayName,
  avatarUrl,
  bio,
  title,
  theme,
  editable,
}: {
  blocks: IBlock[]
  username: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  title?: string
  theme?: ThemeConfig
  editable?: boolean
}) {
  const visibleBlocks = useMemo(() => blocks.filter((b) => {
    if (!b.isActive) return false
    const now = new Date()
    if (b.startAt && new Date(b.startAt) > now) return false
    if (b.endAt && new Date(b.endAt) < now) return false
    return true
  }), [blocks])

  const t: ThemeConfig = theme || { preset: "minimal" }
  const name = displayName || username
  const cssVars = useMemo(() => themeToCSSVars(t), [t])
  const bgStyle = useMemo(() => getBackgroundStyle(t), [t])
  const avatarRadius = getAvatarRadius(t)
  const maxWidth = getLayoutMaxWidth(t)
  const gap = getSpacingGap(t)

  return (
    <div className="rounded-2xl overflow-hidden border border-white/5">
      <div
        className={`p-6 flex flex-col items-center ${editable ? "pointer-events-none" : ""}`}
        style={{ ...bgStyle, ...cssVars, fontFamily: "var(--page-font-family)" }}
      >
        <div className={`mx-auto w-full ${maxWidth} flex flex-col items-center`}>
          <div
            className={`w-16 h-16 flex items-center justify-center text-xl font-display font-bold mb-3 overflow-hidden ${avatarRadius}`}
            style={{ backgroundColor: avatarUrl ? "transparent" : "var(--page-accent)", color: "var(--page-button-text)" }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-base font-display font-bold" style={{ color: "var(--page-accent)" }}>@{username}</h1>
          {title && <p className="text-xs mt-0.5" style={{ color: "var(--page-accent)", opacity: 0.7 }}>{title}</p>}
          {bio && <p className="text-xs mt-2 text-center leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.6 }}>{bio}</p>}

          <div className={`w-full mt-5 flex flex-col ${gap}`}>
            {visibleBlocks.map((block, i) => (
              <BlockRenderer key={block._id} block={block} theme={t} index={i} />
            ))}
          </div>

          {visibleBlocks.length === 0 && (
            <p className="text-xs mt-6 text-center" style={{ color: "var(--page-accent)", opacity: 0.5 }}>
              Your page is empty so far.
            </p>
          )}

          <div className="mt-6 text-center">
            <span className="text-[10px]" style={{ color: "var(--page-accent)", opacity: 0.4 }}>LinkNest</span>
          </div>
        </div>
      </div>
    </div>
  )
}
