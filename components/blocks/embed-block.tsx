export function EmbedBlock({ data }: { data: any }) {
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

  if (embed) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
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
      className="flex items-center justify-between w-full rounded-xl border bg-card px-4 py-3 text-sm hover:bg-muted/50 transition-all"
    >
      <span>Open embedded content</span>
      <span className="text-muted-foreground">↗</span>
    </a>
  )
}
