import type { BlockComponentProps } from "./block-renderer"
import { getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function TextBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const align = data.align || "center"
  return (
    <p
      className={`text-sm leading-relaxed whitespace-pre-wrap ${getEntranceAnimClass(theme)}`}
      style={{ textAlign: align, color: "var(--page-accent)", opacity: 0.75, ...getEntranceDelayStyle(index) }}
    >
      {data.content || ""}
    </p>
  )
}
