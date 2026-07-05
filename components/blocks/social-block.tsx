import type { BlockComponentProps } from "./block-renderer"
import { getSocialStyleClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"
import { PlatformIcon } from "./platform-icons"

export function SocialBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const links = data.links || []
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
              ? { backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }
              : { borderColor: "var(--page-accent)", color: "var(--page-accent)", opacity: (theme.socialIconStyle || "outline") === "minimal" ? 0.7 : 1 }
          }
        >
          <PlatformIcon platform={link.platform} className="w-4 h-4" />
        </a>
      ))}
    </div>
  )
}
