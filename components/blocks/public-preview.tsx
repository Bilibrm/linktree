import { useMemo } from "react"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "./block-renderer"
import { getAvatarRadius, getLayoutMaxWidth, getSpacingGap, getBlockSpanClass, themeToCSSVars, getBackgroundStyle } from "@/lib/theme-utils"

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

  const t: ThemeConfig = useMemo(() => theme || { preset: "minimal" }, [theme])
  const name = displayName || username
  const cssVars = useMemo(() => themeToCSSVars(t), [t])
  const bgStyle = useMemo(() => getBackgroundStyle(t), [t])
  const avatarRadius = getAvatarRadius(t)
  const maxWidth = getLayoutMaxWidth(t)
  const gap = getSpacingGap(t)

  return (
    <div className="rounded-[20px] overflow-hidden border border-white/[0.06] shadow-xl shadow-black/20 bg-black/40 backdrop-blur-[2px]">
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[18px] bg-black/80 rounded-b-xl z-10 flex items-center justify-center gap-1.5">
          <div className="w-[6px] h-[6px] rounded-full bg-white/20" />
          <div className="w-[30px] h-[3px] rounded-full bg-white/30" />
        </div>
        <div
          className={`p-6 pt-8 flex flex-col items-center ${editable ? "pointer-events-none select-none" : ""}`}
          style={{ ...bgStyle, ...cssVars, fontFamily: "var(--page-font-family)" }}
        >
          <div className={`mx-auto w-full ${maxWidth} flex flex-col items-center`}>
            <div className={`p-[2.5px] avatar-ring ${avatarRadius} mb-3`}>
              <div
                className={`w-14 h-14 flex items-center justify-center text-lg font-display font-bold overflow-hidden ${avatarRadius}`}
                style={{ backgroundColor: avatarUrl ? "transparent" : "var(--page-accent)", color: "var(--page-button-text)" }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <h1 className="text-sm font-display font-bold" style={{ color: "var(--page-accent)" }}>@{username}</h1>
            {title && <p className="text-[11px] mt-0.5" style={{ color: "var(--page-accent)", opacity: 0.7 }}>{title}</p>}
            {bio && <p className="text-[11px] mt-2 text-center leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.6 }}>{bio}</p>}

            <div className={`w-full mt-4 grid grid-cols-2 ${gap}`}>
              {visibleBlocks.map((block, i) => (
                <div key={block._id} className={getBlockSpanClass(block.type, block.data)}>
                  <BlockRenderer block={block} theme={t} index={i} />
                </div>
              ))}
            </div>

            {visibleBlocks.length === 0 && (
              <p className="text-[11px] mt-6 text-center" style={{ color: "var(--page-accent)", opacity: 0.5 }}>
                Your page is empty so far.
              </p>
            )}

            <div className="mt-5 mb-1 text-center">
              <span className="text-[9px]" style={{ color: "var(--page-accent)", opacity: 0.35 }}>LinkNest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
