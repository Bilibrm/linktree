import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getAccentColor, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function ImageBlock({ data, theme, index = 0 }: BlockComponentProps) {
  if (!data.src) return null

  return (
    <div className={`text-center ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      <img
        src={data.src}
        alt={data.alt || "Image"}
        className={`w-full object-cover max-h-80 ${getCardRadius(theme)} ${getShadowClass(theme)}`}
      />
      {data.caption && (
        <p className="text-xs mt-1.5" style={{ color: getAccentColor(theme), opacity: 0.6 }}>{data.caption}</p>
      )}
    </div>
  )
}
