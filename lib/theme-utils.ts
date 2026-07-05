import type { ThemeConfig } from "@/types"

/**
 * Every function here maps a theme field to a *literal* Tailwind class string
 * (never interpolated) so Tailwind's build-time scanner can always find it.
 */

const BUTTON_RADIUS: Record<string, string> = {
  sharp: "rounded-none",
  rounded: "rounded-xl",
  pill: "rounded-full",
}

const CARD_RADIUS: Record<string, string> = {
  sharp: "rounded-none",
  soft: "rounded-lg",
  rounded: "rounded-2xl",
  pill: "rounded-[28px]",
}

const SHADOW_CLASS: Record<string, string> = {
  none: "",
  subtle: "shadow-sm",
  medium: "shadow-md",
  strong: "shadow-xl",
}

const SPACING_GAP: Record<string, string> = {
  compact: "gap-2",
  comfortable: "gap-3",
  spacious: "gap-5",
}

const AVATAR_RADIUS: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-[28%]",
  square: "rounded-md",
}

const LAYOUT_WIDTH: Record<string, string> = {
  narrow: "max-w-[280px]",
  normal: "max-w-sm",
  wide: "max-w-md",
}

const DESKTOP_CONTENT_WIDTH: Record<string, string> = {
  narrow: "lg:max-w-sm",
  normal: "lg:max-w-md",
  wide: "lg:max-w-xl",
}

const ANIM_CLASS: Record<string, string> = {
  none: "",
  fade: "theme-anim-fade",
  slide: "theme-anim-slide",
  scale: "theme-anim-scale",
}

const HOVER_CLASS: Record<string, string> = {
  lift: "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg",
  underline: "transition-colors duration-200",
  fill: "transition-all duration-200 hover:brightness-110 hover:saturate-110",
  none: "",
}

const SOCIAL_STYLE_CLASS: Record<string, string> = {
  outline: "border bg-transparent",
  filled: "border-transparent shadow-sm",
  minimal: "border-transparent bg-transparent",
}

export function getButtonRadius(theme: ThemeConfig): string {
  return BUTTON_RADIUS[theme.buttonStyle || "rounded"] || BUTTON_RADIUS.rounded
}

export function getCardRadius(theme: ThemeConfig): string {
  return CARD_RADIUS[theme.borderRadius || "soft"] || CARD_RADIUS.soft
}

export function getShadowClass(theme: ThemeConfig): string {
  return SHADOW_CLASS[theme.shadow || "none"] ?? ""
}

export function getSpacingGap(theme: ThemeConfig): string {
  return SPACING_GAP[theme.spacingDensity || "comfortable"] || SPACING_GAP.comfortable
}

export function getAvatarRadius(theme: ThemeConfig): string {
  return AVATAR_RADIUS[theme.avatarShape || "circle"] || AVATAR_RADIUS.circle
}

export function getLayoutMaxWidth(theme: ThemeConfig): string {
  return LAYOUT_WIDTH[theme.layoutWidth || "normal"] || LAYOUT_WIDTH.normal
}

/** The content column's max-width at the lg+ breakpoint, used alongside getLayoutMaxWidth's mobile value. */
export function getDesktopContentMaxWidth(theme: ThemeConfig): string {
  return DESKTOP_CONTENT_WIDTH[theme.layoutWidth || "normal"] || DESKTOP_CONTENT_WIDTH.normal
}

export function getEntranceAnimClass(theme: ThemeConfig): string {
  return ANIM_CLASS[theme.animation || "none"] ?? ""
}

export function getEntranceDelayStyle(index: number): React.CSSProperties {
  return { animationDelay: `${Math.min(index * 0.06, 0.6)}s` }
}

export function getHoverClass(theme: ThemeConfig): string {
  return HOVER_CLASS[theme.linkHover || "lift"] || HOVER_CLASS.lift
}

export function getSocialStyleClass(theme: ThemeConfig): string {
  return SOCIAL_STYLE_CLASS[theme.socialIconStyle || "outline"] || SOCIAL_STYLE_CLASS.outline
}

/** Background + text color for a primary "button-like" element (link, form submit, countdown accents). */
export function getButtonColors(theme: ThemeConfig): { backgroundColor: string; color: string } {
  return {
    backgroundColor: theme.buttonColor || theme.accentColor || "#16302A",
    color: theme.buttonTextColor || "#F5F1E4",
  }
}

/** The theme's primary foreground/accent color, used for headings, icons, and borders. */
export function getAccentColor(theme: ThemeConfig): string {
  return theme.accentColor || "#16302A"
}

/**
 * A theme-tinted "glass" surface for card-like blocks (non-featured links, forms,
 * countdown, embed fallback). Tinted from the theme's own accent color via color-mix,
 * so it always reads as on-brand regardless of the page's background color/image —
 * no light/dark detection needed. Sets its own hover-target CSS var so the ".theme-surface"
 * hover state works without depending on any ancestor providing theme CSS vars.
 */
export function getSurfaceStyle(theme: ThemeConfig): React.CSSProperties {
  const accent = theme.accentColor || "#16302A"
  return {
    background: `color-mix(in srgb, ${accent} 7%, transparent)`,
    borderColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    ["--surface-hover-bg" as string]: `color-mix(in srgb, ${accent} 13%, transparent)`,
  } as React.CSSProperties
}

/** Google's public favicon service — no API key, used as a fallback icon for link blocks that have no explicit platform icon or thumbnail. */
export function getFaviconUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return null
  }
}

/**
 * Bento-grid span for a block on the public page. Links pair up two-per-row
 * (col-span-1 on a 2-col grid) so the page reads as a mosaic instead of a
 * stacked list; a featured link and every other block type takes the full row.
 */
export function getBlockSpanClass(type: string, data?: unknown): string {
  const featured = !!(data && typeof data === "object" && "featured" in data && (data as { featured?: boolean }).featured)
  if (type === "link" && !featured) return "col-span-1"
  return "col-span-2"
}


export function themeToCSSVars(theme: ThemeConfig): React.CSSProperties {
  const vars: Record<string, string> = {}

  vars["--page-accent"] = theme.accentColor || "#16302A"
  vars["--page-button-bg"] = theme.buttonColor || theme.accentColor || "#16302A"
  vars["--page-button-text"] = theme.buttonTextColor || "#F5F1E4"
  vars["--page-font-family"] = theme.font || "var(--font-body)"

  return vars as React.CSSProperties
}

/** Returns the background CSS value for the public page. */
export function getBackgroundStyle(theme: ThemeConfig): React.CSSProperties {
  const bg: React.CSSProperties = {}

  if (theme.backgroundType === "gradient" && theme.backgroundValue) {
    bg.background = theme.backgroundValue
  } else if (theme.backgroundType === "image" && theme.backgroundValue) {
    bg.backgroundImage = `url(${theme.backgroundValue})`
    bg.backgroundSize = "cover"
    bg.backgroundPosition = "center"
  } else if (theme.backgroundType === "animated") {
    if (theme.backgroundValue) {
      bg.background = theme.backgroundValue
    } else {
      bg.background = `linear-gradient(${theme.backgroundDirection || "135deg"}, ${theme.accentColor || "#16302A"}, ${theme.backgroundColor || "#ffffff"})`
    }
    bg.backgroundSize = "200% 200%"
    bg.animation = "gradient-shift 8s ease infinite"
  } else {
    bg.backgroundColor = theme.backgroundColor || "#ffffff"
  }

  if (theme.backgroundBlur && (theme.backgroundType === "gradient" || theme.backgroundType === "image")) {
    bg.backdropFilter = "blur(12px)"
  }

  return bg
}
