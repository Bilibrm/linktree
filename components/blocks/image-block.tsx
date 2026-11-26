import type { BlockComponentProps } from "./block-props"

export function ImageBlock({ data }: BlockComponentProps) {
  if (!data.src) return null
  return (
    <figure className="lp-figure">
      {/* eslint-disable-next-line @next/next/no-img-element -- owner-supplied image from any host */}
      <img src={data.src} alt={data.alt || ""} loading="lazy" decoding="async" />
      {data.caption && <figcaption className="lp-caption">{data.caption}</figcaption>}
    </figure>
  )
}
