import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function GalleryBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const images = (data.images || []).filter((img: { src?: string }) => img.src)
  if (images.length === 0) return null

  const radius = getCardRadius(theme)
  const shadow = getShadowClass(theme)

  const cols = images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"

  return (
    <div className={`grid ${cols} gap-2 ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      {images.map((img: { src: string; alt?: string }, i: number) => (
        <div
          key={i}
          className={`overflow-hidden aspect-square ${radius} ${shadow} relative group ${images.length >= 3 && i === 0 ? "col-span-2 row-span-2" : ""}`}
        >
          <img
            src={img.src}
            alt={img.alt || `Gallery ${i + 1}`}
            loading="lazy"
            className="object-cover w-full h-full transition-all duration-700 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.06] rounded-inherit pointer-events-none" />
        </div>
      ))}
    </div>
  )
}
