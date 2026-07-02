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
