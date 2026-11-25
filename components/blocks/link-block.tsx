import { safeHref, trackAttrs, type BlockComponentProps } from "./block-props"
import { PlatformIcon } from "./platform-icons"

/** Google's public favicon service: no key. Used when a link has no icon or thumbnail. */
function faviconUrl(url: string): string | null {
  try {
    const { hostname, protocol } = new URL(url)
    if (protocol !== "https:" && protocol !== "http:") return null
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return null
  }
}

export function LinkBlock({ data, blockId, pageId }: BlockComponentProps) {
  const href = safeHref(data.url)
  const favicon = !data.icon && !data.thumbnailUrl && href ? faviconUrl(href) : null

  let icon: React.ReactNode = null
  if (data.icon) icon = <PlatformIcon platform={data.icon} className="size-5" />
  // eslint-disable-next-line @next/next/no-img-element -- owner-supplied thumbnail from any host
  else if (data.thumbnailUrl) icon = <img src={data.thumbnailUrl} alt="" loading="lazy" decoding="async" />
  // eslint-disable-next-line @next/next/no-img-element -- favicon of the owner's link
  else if (favicon) icon = <img src={favicon} alt="" width={20} height={20} loading="lazy" decoding="async" />

  return (
    <a
      href={href ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={data.featured ? "lp-tile ln-link lp-featured" : "lp-tile ln-link"}
      {...trackAttrs(blockId, pageId)}
    >
      {icon && (
        <span className="lp-tile-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="lp-tile-label">{data.title || "Untitled link"}</span>
    </a>
  )
}
