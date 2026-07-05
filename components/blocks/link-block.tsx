"use client"

import { trackClick } from "@/lib/actions/analytics"
import type { BlockComponentProps } from "./block-renderer"
import { getButtonRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle, getFaviconUrl } from "@/lib/theme-utils"
import { PlatformIcon } from "./platform-icons"
import { ArrowUpRight } from "lucide-react"

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

  if (linkStyle === "minimal") {
    return (
      <a
        href={data.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{ color: "var(--page-button-bg)", ...delayStyle }}
        className={`group flex items-center justify-center gap-2 w-full py-2.5 ${featured ? "text-base font-bold" : "text-sm font-medium"} ${hover} ${anim}`}
      >
          {data.icon && <PlatformIcon platform={data.icon} className="w-4 h-4 shrink-0 opacity-60" />}
        <span className={theme.linkHover === "underline" ? "group-hover:underline underline-offset-4 decoration-from-font" : ""}>
          {data.title || "Untitled link"}
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    )
  }

  if (featured) {
    return (
      <a
        href={data.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{ backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)", ...delayStyle }}
        className={`group relative flex items-center gap-4 w-full ${radius} ${shadow || "shadow-lg"} overflow-hidden px-5 py-4 ${hover} ${anim}`}
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        {renderIcon("w-5 h-5") && (
          <div className="relative z-[2] w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden">
            {renderIcon("w-5 h-5")}
          </div>
        )}
        <div className="relative z-[2] flex-1 min-w-0">
          <span className="block text-[10px] uppercase tracking-widest font-semibold opacity-50 mb-0.5">Featured</span>
          <span className="block text-base font-bold truncate">{data.title || "Untitled link"}</span>
        </div>
        <ArrowUpRight className="relative z-[2] shrink-0 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform w-4 h-4" />
      </a>
    )
  }

  const isCard = linkStyle === "card"
  const surfaceStyle = getSurfaceStyle(theme)

  return (
    <a
      href={data.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ ...surfaceStyle, color: "var(--page-accent)", ...delayStyle }}
      className={`group relative flex flex-col justify-between gap-3 w-full h-full min-h-[116px] ${radius} border theme-surface overflow-hidden ${isCard ? shadow || "shadow-sm" : ""} p-4 ${hover} ${anim}`}
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
        <ArrowUpRight className="opacity-30 w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <span className="relative z-[2] text-sm font-semibold leading-snug line-clamp-2">{data.title || "Untitled link"}</span>
    </a>
  )
}
