import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function ImageBlock({ data, theme, index = 0 }: BlockComponentProps) {
  if (!data.src) return null

  return (
    <div className={`text-center ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      <div className={`overflow-hidden ${getCardRadius(theme)} ${getShadowClass(theme)}`}>
        <img
          src={data.src}
          alt={data.alt || "Image"}
          loading="lazy"
          className="w-full object-cover max-h-80 transition-transform duration-500 hover:scale-[1.03]"
        />
      </div>
      {data.caption && (
        <p className="text-xs mt-1.5" style={{ color: "var(--page-accent)", opacity: 0.6 }}>{data.caption}</p>
      )}
    </div>
  )
}
