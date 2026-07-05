import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"
import { ImageOff } from "lucide-react"

export function ImageBlock({ data, theme, index = 0 }: BlockComponentProps) {
  if (!data.src) return null

  return (
    <div className={`text-center ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      <div className={`overflow-hidden ${getCardRadius(theme)} ${getShadowClass(theme)} relative group`}>
        <img
          src={data.src}
          alt={data.alt || "Image"}
          loading="lazy"
          className="w-full object-cover max-h-96 transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-[1.02]"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.06] rounded-inherit pointer-events-none" />
      </div>
      {data.caption && (
        <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.55 }}>{data.caption}</p>
      )}
    </div>
  )
}
