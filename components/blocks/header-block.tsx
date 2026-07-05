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

  const className = {
    1: "font-display text-2xl font-bold",
    2: "font-display text-xl font-bold",
    3: "font-display text-lg font-semibold",
  }[level] || "font-display text-xl font-bold"

  return (
    <Tag
      className={`${className} text-center ${getEntranceAnimClass(theme)}`}
      style={{ color: "var(--page-accent)", ...getEntranceDelayStyle(index) }}
    >
      {text}
    </Tag>
  )
}
