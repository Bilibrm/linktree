"use client"

import { trackClick } from "@/lib/actions/analytics"
import type { BlockComponentProps } from "./block-renderer"
import { getButtonRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"
import { PlatformIcon } from "./platform-icons"
import { ArrowRight } from "lucide-react"

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {},
  outline: {
    background: "transparent",
    border: "2px solid var(--page-button-bg)",
    color: "var(--page-accent)",
  },
  ghost: {
    background: "transparent",
    border: "none",
    color: "var(--page-accent)",
  },
}

export function ButtonBlock({ data, blockId, pageId, theme, index = 0 }: BlockComponentProps) {
  async function handleClick() {
    if (!blockId || !pageId) return
    const formData = new FormData()
    formData.append("blockId", blockId)
    formData.append("pageId", pageId)
    formData.append("referrer", document.referrer)
    await trackClick(formData)
  }

  const variant = data.variant || "primary"
  const radius = getButtonRadius(theme)
  const shadow = getShadowClass(theme)
  const hover = getHoverClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const isPrimary = variant === "primary"

  const customStyle: React.CSSProperties = isPrimary
    ? { backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }
    : variantStyles[variant] || variantStyles.primary

  return (
    <a
      href={data.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ ...customStyle, ...delayStyle }}
      className={`group relative flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold overflow-hidden ${radius} ${isPrimary ? shadow || "shadow-md" : ""} ${hover} ${anim}`}
    >
      {isPrimary && (
        <>
          <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <span className="absolute inset-0 ring-1 ring-inset ring-white/[0.08] rounded-inherit pointer-events-none" />
        </>
      )}
      {data.icon && <PlatformIcon platform={data.icon} className="w-4 h-4 shrink-0 relative z-[2]" />}
      <span className="relative z-[2]">{data.label || "Button"}</span>
      <ArrowRight className="relative z-[2] w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-transform shrink-0" />
    </a>
  )
}
