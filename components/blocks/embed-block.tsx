import { safeHref, type BlockComponentProps } from "./block-props"

/** The players LinkNest embeds. Anything else shows as a plain link tile. */
function embedFor(url: string): { src: string; title: string } | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/)
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt[1]}`, title: "YouTube video" }
  const sp = url.match(/open\.spotify\.com\/(track|episode|playlist|album|show)\/([a-zA-Z0-9]+)/)
  if (sp) return { src: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`, title: "Spotify player" }
  return null
}

export function EmbedBlock({ data }: BlockComponentProps) {
  const url = safeHref(data.url)
  if (!url) return null
  const embed = embedFor(url)

  if (embed) {
    return (
      <div className="lp-embed">
        <iframe src={embed.src} title={embed.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="lp-tile">
      <span className="lp-tile-label">{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
    </a>
  )
}
