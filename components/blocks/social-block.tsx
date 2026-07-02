const platformIcons: Record<string, string> = {
  twitter: "𝕏",
  x: "𝕏",
  github: "⌂",
  instagram: "◻",
  youtube: "▶",
  linkedin: "▣",
  tiktok: "♫",
  facebook: "f",
  discord: "♦",
  twitch: "►",
  spotify: "♫",
  website: "◎",
}

export function SocialBlock({ data }: { data: any }) {
  const links = data.links || []

  return (
    <div className="flex justify-center gap-3">
      {links.map((link: any, i: number) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border flex items-center justify-center text-sm hover:bg-muted transition-colors"
          title={link.platform}
        >
          {platformIcons[link.platform?.toLowerCase()] || "◎"}
        </a>
      ))}
    </div>
  )
}
