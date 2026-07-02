import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function GalleryBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const images = (data.images || []).filter((img: any) => img.src)
  if (images.length === 0) return null

  const radius = getCardRadius(theme)
  const shadow = getShadowClass(theme)

  return (
    <div className={`grid grid-cols-2 gap-2 ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      {images.map((img: any, i: number) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt || `Gallery ${i + 1}`}
          className={`object-cover aspect-square ${radius} ${shadow}`}
        />
      ))}
    </div>
  )
}
