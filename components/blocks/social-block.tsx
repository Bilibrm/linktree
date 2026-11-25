import { safeHref, type BlockComponentProps } from "./block-props"
import { PLATFORMS, PlatformIcon } from "./platform-icons"

function platformLabel(id: string): string {
  return PLATFORMS.find((p) => p.id === id.toLowerCase())?.label ?? id
}

export function SocialBlock({ data }: BlockComponentProps) {
  const links = ((data.links || []) as { platform?: string; url?: string }[]).flatMap((link) => {
    const href = link && link.platform ? safeHref(link.url) : null
    return href ? [{ platform: link.platform as string, href }] : []
  })
  if (links.length === 0) return null
  return (
    <ul className="lp-social">
      {links.map((link, i) => (
        <li key={i}>
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="lp-social-link" aria-label={platformLabel(link.platform)}>
            <PlatformIcon platform={link.platform} className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  )
}
