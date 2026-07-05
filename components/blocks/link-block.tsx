"use client"

import { trackClick } from "@/lib/actions/analytics"
import type { BlockComponentProps } from "./block-renderer"
import { getButtonRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle, getFaviconUrl } from "@/lib/theme-utils"
import { PlatformIcon } from "./platform-icons"

export function LinkBlock({ data, blockId, pageId, theme, index = 0 }: BlockComponentProps) {
  async function handleClick() {
    if (!blockId || !pageId) return
    const formData = new FormData()
    formData.append("blockId", blockId)
    formData.append("pageId", pageId)
    formData.append("referrer", document.referrer)
    await trackClick(formData)
  }

  const linkStyle = theme.linkStyle || "standard"
  const featured = !!data.featured
  const radius = getButtonRadius(theme)
  const shadow = getShadowClass(theme)
  const hover = getHoverClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const faviconUrl = !data.icon && !data.thumbnailUrl ? getFaviconUrl(data.url || "") : null
  const accent = theme.accentColor || "#16302A"

  const renderIcon = (size: string) => {
    if (data.icon) return <PlatformIcon platform={data.icon} className={size} />
    if (data.thumbnailUrl) return <img src={data.thumbnailUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
    if (faviconUrl) return <img src={faviconUrl} alt="" loading="lazy" className="w-full h-full object-contain p-1" />
    return null
  }

  // Minimal style stays a plain text link regardless of featured/tile treatment —
  // it exists specifically for people who want no visual weight at all.
  if (linkStyle === "minimal") {
    return (
      <a
        href={data.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{ color: "var(--page-button-bg)", ...delayStyle }}
        className={`group flex items-center justify-center gap-1.5 w-full py-2.5 ${featured ? "text-base font-bold" : "text-sm font-medium"} ${hover} ${anim}`}
      >
        {data.icon && <PlatformIcon platform={data.icon} className="w-4 h-4 shrink-0 opacity-70" />}
        <span className={theme.linkHover === "underline" ? "group-hover:underline underline-offset-4" : ""}>
          {data.title || "Untitled link"}
        </span>
        <span className="opacity-50 text-xs transition-transform group-hover:translate-x-0.5">↗</span>
      </a>
    )
  }

  // Featured: full-width banner, solid accent, decorative corner glow.
  if (featured) {
    return (
      <a
        href={data.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{ backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)", ...delayStyle }}
        className={`tile-shine group relative flex items-center gap-4 w-full ${radius} ${shadow || "shadow-lg"} overflow-hidden px-5 py-4 ${hover} ${anim}`}
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        {renderIcon("w-5 h-5") && (
          <div className="relative z-[2] w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden">
            {renderIcon("w-5 h-5")}
          </div>
        )}
        <div className="relative z-[2] flex-1 min-w-0">
          <span className="block text-[10px] uppercase tracking-wider font-semibold opacity-60 mb-0.5">Featured</span>
          <span className="block text-base font-bold truncate">{data.title || "Untitled link"}</span>
        </div>
        <span className="relative z-[2] shrink-0 opacity-70 group-hover:translate-x-1 transition-transform text-lg">↗</span>
      </a>
    )
  }

  const isCard = linkStyle === "card"
  const surfaceStyle = getSurfaceStyle(theme)

  // Regular link: compact bento tile — icon on top, title below, arrow tucked
  // in the corner. Designed to pair up two-per-row in the grid.
  return (
    <a
      href={data.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ ...surfaceStyle, color: "var(--page-accent)", ...delayStyle }}
      className={`tile-shine group relative flex flex-col justify-between gap-3 w-full h-full min-h-[112px] ${radius} border theme-surface overflow-hidden ${isCard ? shadow || "shadow-sm" : ""} p-4 ${hover} ${anim}`}
    >
      <div className="relative z-[2] flex items-center justify-between">
        {renderIcon("w-4 h-4") ? (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
          >
            {renderIcon("w-4 h-4")}
          </div>
        ) : <span />}
        <span className="opacity-40 text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
      </div>
      <span className="relative z-[2] text-sm font-semibold leading-snug line-clamp-2">{data.title || "Untitled link"}</span>
    </a>
  )
}
