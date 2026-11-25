import { contrast, isDark, mix } from "./color"
import type { ResolvedTheme } from "./types"

/**
 * A resolved theme as the attributes and custom properties of the page root (`.lp`).
 * Everything the stylesheet (`app/themes.css`) needs is here, so the public page, the
 * editor proof, the Look picker and the landing samples all draw from the same source.
 * Plain strings only: this crosses the server/client boundary as props.
 */
export type ThemeRootProps = {
  style: Record<string, string>
  attrs: Record<string, string>
}

/**
 * Secondary text: the page text thinned toward the page color, but never below AA. Themes
 * whose two inks are close in value (blue on orange) keep nearly the full ink.
 */
export function mutedText(text: string, background: string): string {
  for (let amount = 0.72; amount < 1; amount += 0.04) {
    const candidate = mix(text, background, amount)
    if (contrast(candidate, background) >= 4.5) return candidate
  }
  return text
}

export function themeRootProps(theme: ResolvedTheme): ThemeRootProps {
  const { palette, font, background } = theme
  const style: Record<string, string> = {
    "--lp-bg": palette.background,
    "--lp-surface": palette.surface,
    "--lp-on-surface": theme.onSurface,
    "--lp-text": palette.text,
    "--lp-muted": mutedText(palette.text, palette.background),
    "--lp-on-surface-muted": mutedText(theme.onSurface, palette.surface),
    "--lp-accent": palette.accent,
    "--lp-accent-text": palette.accentText,
    "--lp-ink2": background.ink,
    "--lp-font-display": font.display,
    "--lp-font-body": font.body,
    "--lp-display-weight": String(font.displayWeight),
    "--lp-display-stretch": font.displayStretch ?? "100%",
    "--lp-display-tracking": font.displayTracking ?? "0em",
    "--lp-display-case": font.displayCase ?? "none",
    "--lp-body-weight": String(font.bodyWeight),
    "--lp-label-weight": String(font.labelWeight),
    "--lp-fit": String(font.fit),
  }
  if (background.kind === "image" && background.image) style["--lp-image"] = `url("${background.image}")`

  return {
    style,
    attrs: {
      "data-theme": theme.legacy ? "legacy" : theme.id,
      "data-layout": theme.layout,
      "data-width": theme.width,
      "data-density": theme.density,
      "data-avatar": theme.avatar,
      "data-block": theme.blockStyle,
      "data-shape": theme.shape,
      "data-bg": background.kind,
      "data-entrance": theme.motion.entrance,
      "data-hover": theme.motion.hover,
      "data-tone": isDark(palette.background) ? "dark" : "light",
    },
  }
}

/** Longest word of a name, bounded, for fitting the poster layout's name to the page. */
export function nameFitLength(name: string): number {
  const longest = name.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0)
  return Math.min(Math.max(longest, 4), 16)
}
