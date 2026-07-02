import type { BlockComponentProps } from "./block-renderer"
import { getAccentColor, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function HeaderBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const level = data.level || 2
  const text = data.text || "Header"

  const className = {
    1: "font-display text-2xl font-bold",
    2: "font-display text-xl font-bold",
    3: "font-display text-lg font-semibold",
  }[level as 1 | 2 | 3] || "font-display text-xl font-bold"

  return (
    <h2
      className={`${className} text-center ${getEntranceAnimClass(theme)}`}
      style={{ color: getAccentColor(theme), ...getEntranceDelayStyle(index) }}
    >
      {text}
    </h2>
  )
}
