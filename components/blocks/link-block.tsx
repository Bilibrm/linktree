"use client"

import { trackClick } from "@/lib/actions/analytics"
import type { BlockComponentProps } from "./block-renderer"
import { getButtonRadius, getShadowClass, getHoverClass, getButtonColors, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

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
  const radius = getButtonRadius(theme)
  const shadow = getShadowClass(theme)
  const hover = getHoverClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const colors = getButtonColors(theme)

  if (linkStyle === "minimal") {
    return (
      <a
        href={data.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{ color: colors.backgroundColor, ...delayStyle }}
        className={`group flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-medium ${hover} ${anim}`}
      >
        <span className={theme.linkHover === "underline" ? "group-hover:underline underline-offset-4" : ""}>
          {data.title || "Untitled link"}
        </span>
        <span className="opacity-50 text-xs transition-transform group-hover:translate-x-0.5">↗</span>
      </a>
    )
  }

  const isCard = linkStyle === "card"

  return (
    <a
      href={data.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ backgroundColor: colors.backgroundColor, color: colors.color, ...delayStyle }}
      className={`group flex items-center justify-between w-full ${radius} ${isCard ? shadow || "shadow-sm" : shadow} px-4 py-3.5 text-sm font-semibold ${hover} ${anim}`}
    >
      <span className="flex items-center gap-3 min-w-0">
        {data.thumbnailUrl && (
          <img src={data.thumbnailUrl} alt="" className={`w-7 h-7 object-cover flex-shrink-0 ${radius === "rounded-full" ? "rounded-full" : "rounded-md"}`} />
        )}
        <span className="truncate">{data.title || "Untitled link"}</span>
      </span>
      <span className={`flex-shrink-0 opacity-60 text-xs transition-transform ${theme.linkHover === "lift" ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : "group-hover:translate-x-0.5"}`}>↗</span>
    </a>
  )
}
