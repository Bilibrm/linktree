import type { BlockComponentProps } from "./block-renderer"
import { getEntranceAnimClass } from "@/lib/theme-utils"

export function DividerBlock({ theme }: BlockComponentProps) {
  const accent = theme.accentColor || "#16302A"
  return (
    <div className={`flex items-center justify-center py-3 ${getEntranceAnimClass(theme)}`} aria-hidden="true">
      <div className="flex-1 max-w-[120px] h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}40, transparent)` }} />
      <div className="mx-3 flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
      </div>
      <div className="flex-1 max-w-[120px] h-px" style={{ background: `linear-gradient(to left, transparent, ${accent}40, transparent)` }} />
    </div>
  )
}
