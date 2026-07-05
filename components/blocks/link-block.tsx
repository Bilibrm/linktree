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

  const icon = data.icon ? (
    <PlatformIcon platform={data.icon} className={featured ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0 opacity-80"} />
  ) : data.thumbnailUrl ? (
    <img src={data.thumbnailUrl} alt="" loading="lazy" className={`w-7 h-7 object-cover flex-shrink-0 ${radius === "rounded-full" ? "rounded-full" : "rounded-md"}`} />
  ) : faviconUrl ? (
    <img src={faviconUrl} alt="" loading="lazy" className="w-4 h-4 rounded-sm flex-shrink-0 opacity-90" />
  ) : null

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
        {icon}
        <span className={theme.linkHover === "underline" ? "group-hover:underline underline-offset-4" : ""}>
          {data.title || "Untitled link"}
        </span>
        <span className="opacity-50 text-xs transition-transform group-hover:translate-x-0.5">↗</span>
      </a>
    )
  }

  const isCard = linkStyle === "card"
  const surfaceStyle = !featured ? getSurfaceStyle(theme) : undefined

  return (
    <a
      href={data.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        ...(featured
          ? { backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }
          : { ...surfaceStyle, color: "var(--page-accent)" }),
        ...delayStyle,
      }}
      className={`group flex items-center justify-between w-full ${radius} ${
        featured ? `${shadow || "shadow-md"} px-5 py-4 text-base font-bold` : `border theme-surface ${isCard ? shadow || "shadow-sm" : ""} px-4 py-3.5 text-sm font-semibold`
      } ${hover} ${anim}`}
    >
      <span className="flex items-center gap-3 min-w-0">
        {icon}
        <span className="truncate">{data.title || "Untitled link"}</span>
      </span>
      <span className={`flex-shrink-0 opacity-60 text-xs transition-transform ${theme.linkHover === "lift" ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : "group-hover:translate-x-0.5"}`}>↗</span>
    </a>
  )
}
