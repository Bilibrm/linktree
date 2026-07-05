import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getHoverClass, getSurfaceStyle, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function EmbedBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const url = data.url || ""

  if (!url) return null

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1]
      if (id) return { src: `https://www.youtube.com/embed/${id}`, title: "YouTube" }
    }
    if (url.includes("open.spotify.com")) {
      const id = url.match(/spotify\.com\/(track|episode|playlist)\/([a-zA-Z0-9]+)/)?.[0]
      if (id) return { src: `https://open.spotify.com/embed/${id}`, title: "Spotify" }
    }
    return null
  }

  const embed = getEmbedUrl(url)
  const radius = getCardRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const accent = theme.accentColor || "#16302A"

  if (embed) {
    return (
      <div
        className={`p-1.5 ${radius} ${shadow} ${anim}`}
        style={{ background: `color-mix(in srgb, ${accent} 10%, transparent)`, ...delayStyle }}
      >
        <div className={`aspect-video overflow-hidden ${radius}`}>
          <iframe
            src={embed.src}
            title={embed.title}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
          />
        </div>
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
