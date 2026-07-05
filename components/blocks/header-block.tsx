import type { BlockComponentProps } from "./block-renderer"
import { getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

const headings = {
  1: "h1",
  2: "h2",
  3: "h3",
} as const

export function HeaderBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const level = (data.level as keyof typeof headings) || 2
  const text = data.text || "Header"
  const Tag = headings[level] || "h2"
  const accent = theme.accentColor || "#16302A"

  const className = {
    1: "font-display text-[26px] lg:text-[30px] font-bold tracking-tight",
    2: "font-display text-xl lg:text-2xl font-bold tracking-tight",
    3: "font-display text-lg lg:text-xl font-semibold tracking-tight",
  }[level] || "font-display text-xl font-bold tracking-tight"

  return (
    <div className={`flex flex-col items-center py-2 ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      <span className="w-8 h-[3px] rounded-full mb-3" style={{ background: `color-mix(in srgb, ${accent} 40%, transparent)` }} />
      <Tag className={`${className} text-center leading-tight`} style={{ color: "var(--page-accent)" }}>
        {text}
      </Tag>
    </div>
  )
}
