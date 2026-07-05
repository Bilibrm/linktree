import type { BlockComponentProps } from "./block-renderer"
import { getEntranceAnimClass } from "@/lib/theme-utils"

export function DividerBlock({ theme }: BlockComponentProps) {
  const accent = theme.accentColor || "#16302A"
  return (
    <div className={`flex items-center justify-center gap-1.5 py-2 ${getEntranceAnimClass(theme)}`} aria-hidden="true">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.35 }} />
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.35 }} />
    </div>
  )
}
