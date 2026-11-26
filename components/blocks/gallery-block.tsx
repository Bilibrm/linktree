import type { BlockComponentProps } from "./block-props"

export function GalleryBlock({ data }: BlockComponentProps) {
  const images = ((data.images || []) as { src?: string; alt?: string }[]).filter((img) => img && img.src)
  if (images.length === 0) return null
  const count = images.length === 1 ? "1" : images.length === 2 ? "2" : "many"
  return (
    <div className="lp-gallery" data-count={count}>
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- owner-supplied image from any host
        <img key={i} src={img.src} alt={img.alt || ""} loading="lazy" decoding="async" />
      ))}
    </div>
  )
}
