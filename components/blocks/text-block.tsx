import type { BlockComponentProps } from "./block-renderer"
import { getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function TextBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const align = data.align || "center"
  return (
    <div className={`${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap tracking-normal"
        style={{ textAlign: align, color: "var(--page-accent)", opacity: 0.72 }}
      >
        {data.content || ""}
      </p>
    </div>
  )
}
