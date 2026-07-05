import type { BlockComponentProps } from "./block-renderer"
import { getSocialStyleClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"
import { PlatformIcon } from "./platform-icons"

export function SocialBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const links = data.links || []
  const styleClass = getSocialStyleClass(theme)
  const filled = (theme.socialIconStyle || "outline") === "filled"
  const accent = theme.accentColor || "#16302A"

  return (
    <div className={`flex justify-center flex-wrap gap-3 ${getEntranceAnimClass(theme)}`} style={getEntranceDelayStyle(index)}>
      {links.map((link: { platform: string; url: string }, i: number) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.platform}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:scale-105 ${styleClass}`}
          style={{
            transitionDelay: `${i * 30}ms`,
            ...(filled
              ? { backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }
              : {
                  background: `color-mix(in srgb, ${accent} 8%, transparent)`,
                  borderColor: `color-mix(in srgb, ${accent} 20%, transparent)`,
                  color: "var(--page-accent)",
                  opacity: (theme.socialIconStyle || "outline") === "minimal" ? 0.75 : 1,
                }),
          }}
        >
          <PlatformIcon platform={link.platform} className="w-[18px] h-[18px]" />
        </a>
      ))}
    </div>
  )
}
