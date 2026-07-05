import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle } from "@/lib/theme-utils"

export function EmbedBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const url = data.url || ""

  if (!url) return null

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1]
      if (id) return { src: `https://www.youtube.com/embed/${id}`, title: "YouTube" }
    }
    if (url.includes("open.spotify.com")) {
      const match = url.match(/spotify\.com\/(track|episode|playlist)\/([a-zA-Z0-9]+)/)
      if (match) return { src: `https://open.spotify.com/embed/${match[1]}/${match[2]}`, title: "Spotify" }
    }
    return null
  }

  const embed = getEmbedUrl(url)
  const radius = getCardRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)

  if (embed) {
    return (
      <div className={`aspect-video overflow-hidden ${radius} ${shadow} ${anim}`} style={delayStyle}>
        <iframe
          src={embed.src}
          title={embed.title}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...getSurfaceStyle(theme), color: "var(--page-accent)", ...delayStyle }}
      className={`flex items-center justify-between w-full ${radius} border theme-surface px-4 py-3 text-sm font-medium ${getHoverClass(theme)} ${anim}`}
    >
      <span>Open embedded content</span>
      <span className="opacity-60">↗</span>
    </a>
  )
}
