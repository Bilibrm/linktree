import type { BlockComponentProps } from "./block-renderer"
import { getAccentColor, getSocialStyleClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

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

export function SocialBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const links = data.links || []
  const accent = getAccentColor(theme)
  const styleClass = getSocialStyleClass(theme)
  const filled = (theme.socialIconStyle || "outline") === "filled"

  return (
    <div className={`flex justify-center flex-wrap gap-3 ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      {links.map((link: any, i: number) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.platform}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-transform duration-200 hover:-translate-y-0.5 ${styleClass}`}
          style={
            filled
              ? { backgroundColor: accent, color: theme.buttonTextColor || "#fff" }
              : { borderColor: accent, color: accent, opacity: (theme.socialIconStyle || "outline") === "minimal" ? 0.7 : 1 }
          }
        >
          {platformIcons[link.platform?.toLowerCase()] || "◎"}
        </a>
      ))}
    </div>
  )
}
