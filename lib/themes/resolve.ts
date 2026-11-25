import { DEFAULT_THEME, themeById } from "./catalog"
import { mix, normalizeHex, readableOn } from "./color"
import { fontPair, LEGACY_FONTS } from "./fonts"
import {
  AVATARS,
  BACKGROUNDS,
  BLOCK_STYLES,
  DENSITIES,
  ENTRANCES,
  HOVERS,
  LAYER_KEYS,
  LAYERS,
  LAYOUTS,
  SHAPES,
  WIDTHS,
  type Layer,
  type Palette,
  type ResolvedTheme,
  type ThemeDefinition,
  type ThemeV2,
} from "./types"

/**
 * Reading a stored theme (DESIGN_SYSTEM.md §8.9). `resolveTheme` takes whatever is in the
 * database, in any shape it has ever had, and returns a complete theme. It never throws
 * and never returns a hole: anything missing, unknown or malformed falls back to the
 * theme's own value, and a missing theme falls back to the default.
 *
 * Three shapes exist in production:
 * 1. v2: `{ preset, v2: { theme, ...changed layers }, customCSS }`.
 * 2. v1: `{ preset: "minimal" | "dark" | ..., backgroundColor, buttonStyle, ... }`.
 *    These are translated to a v2 recipe on the `legacy` theme, field by field.
 * 3. Nothing usable (null, a string, an empty object): the default theme.
 */

type Bag = Record<string, unknown>

function isBag(value: unknown): value is Bag {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function oneOf<T extends string>(list: readonly T[], value: unknown): T | undefined {
  return typeof value === "string" && (list as readonly string[]).includes(value) ? (value as T) : undefined
}

/** An https URL that is safe inside `url("...")`, or null. */
export function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  if (v.length > 2000 || !/^https:\/\/[^\s"'()\\<>]+$/i.test(v)) return null
  return v
}

/* ── v1 → v2 ── */

/** The colors each v1 preset wrote when it was clicked. Used only if a document names a preset but lost its colors. */
const V1_PRESET_COLORS: Record<string, { bg: string; accent: string; btn: string; text: string }> = {
  minimal: { bg: "#ffffff", accent: "#000000", btn: "#000000", text: "#ffffff" },
  dark: { bg: "#0a0a0a", accent: "#ffffff", btn: "#ffffff", text: "#0a0a0a" },
  vibrant: { bg: "#f0f0ff", accent: "#6366f1", btn: "#6366f1", text: "#ffffff" },
  nature: { bg: "#f0fdf4", accent: "#16a34a", btn: "#16a34a", text: "#ffffff" },
  ocean: { bg: "#f0f9ff", accent: "#0284c7", btn: "#0284c7", text: "#ffffff" },
  sunset: { bg: "#fef2f2", accent: "#e11d48", btn: "#e11d48", text: "#ffffff" },
  mono: { bg: "#fafafa", accent: "#525252", btn: "#525252", text: "#fafafa" },
  bold: { bg: "#000000", accent: "#facc15", btn: "#facc15", text: "#000000" },
}

export const V1_PRESETS = Object.keys(V1_PRESET_COLORS)

const V1_SHAPE: Record<string, string> = { sharp: "sharp", soft: "soft", rounded: "round", pill: "pill" }
const V1_ENTRANCE: Record<string, string> = { none: "none", fade: "fade", slide: "slide", scale: "print" }
const V1_HOVER: Record<string, string> = { lift: "lift", underline: "underline", fill: "fill", none: "none" }

/**
 * Translate a v1 document into a v2 recipe on the `legacy` theme. The aim is the closest
 * thing to what the page looked like: the owner's colors, corners, font and motion carry
 * over; the old two-column tile grid becomes the `grid` layout.
 */
export function legacyToV2(stored: Bag): ThemeV2 {
  const v2: ThemeV2 = { theme: "legacy" }
  // A v1 page with no stored colors drew white with a deep green ink, whatever its preset
  // said. A preset's own colors only stand in when the document never had the green look,
  // which is the case for the seven presets other than "minimal".
  const presetId = typeof stored.preset === "string" ? stored.preset : ""
  const preset = presetId !== "minimal" ? V1_PRESET_COLORS[presetId] : undefined

  const background = normalizeHex(stored.backgroundColor) ?? normalizeHex(preset?.bg)
  const text = normalizeHex(stored.accentColor) ?? normalizeHex(preset?.accent)
  const accent = normalizeHex(stored.buttonColor) ?? text ?? normalizeHex(preset?.btn)
  const accentText = normalizeHex(stored.buttonTextColor) ?? normalizeHex(preset?.text)

  const palette: Partial<Palette> = {}
  if (background) palette.background = background
  if (text) palette.text = text
  if (accent) palette.accent = accent
  if (accentText) palette.accentText = accentText
  // v1 tiles were the page ink at 7% over the page color.
  if (background || text) palette.surface = mix(text ?? "#16302a", background ?? "#ffffff", 0.07)
  if (Object.keys(palette).length) v2.palette = palette

  if (typeof stored.font === "string" && LEGACY_FONTS[stored.font]) v2.font = LEGACY_FONTS[stored.font]

  const width = oneOf(WIDTHS, stored.layoutWidth)
  if (width) v2.width = width
  const density = oneOf(DENSITIES, stored.spacingDensity)
  if (density) v2.density = density
  const avatar = oneOf(AVATARS, stored.avatarShape)
  if (avatar) v2.avatar = avatar

  if (stored.linkStyle === "minimal") v2.blockStyle = "underline"
  else if (stored.linkStyle === "card" && (stored.shadow === "medium" || stored.shadow === "strong")) v2.blockStyle = "offset"

  // Links and buttons took their corners from buttonStyle; cards from borderRadius.
  const shape = V1_SHAPE[stored.buttonStyle as string] ?? V1_SHAPE[stored.borderRadius as string]
  if (shape) v2.shape = shape

  const kind = stored.backgroundType
  if (kind === "gradient" || kind === "animated") {
    // Up to two inks: the page color and the last color the gradient named.
    const stops = Array.isArray(stored.backgroundStops) ? stored.backgroundStops : []
    const fromStops = stops.map((s) => (isBag(s) ? normalizeHex(s.color) : null)).filter((c): c is string => !!c)
    const fromValue = typeof stored.backgroundValue === "string" ? (stored.backgroundValue.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) ?? []) : []
    const colors = (fromStops.length ? fromStops : fromValue.map((c) => normalizeHex(c)).filter((c): c is string => !!c)) as string[]
    const ink = colors[colors.length - 1] ?? accent ?? undefined
    if (colors.length > 1 && !background) v2.palette = { ...v2.palette, background: colors[0] }
    v2.background = { kind: kind === "animated" ? "drift" : "duotone", ...(ink ? { ink } : {}) }
  } else if (kind === "image") {
    const image = safeImageUrl(stored.backgroundValue)
    if (image) v2.background = { kind: "image", image }
  }

  const entrance = V1_ENTRANCE[stored.animation as string]
  const hover = V1_HOVER[stored.linkHover as string]
  if (entrance || hover) v2.motion = { ...(entrance ? { entrance } : {}), ...(hover ? { hover } : {}) }

  return v2
}

/* ── validation ── */

/**
 * Keep only the parts of a v2 recipe that are valid. Used on write (after Zod) and on
 * read, so a value that should not reach CSS never does, whatever put it in the database.
 */
export function sanitizeV2(input: unknown): ThemeV2 {
  if (!isBag(input)) return {}
  const out: ThemeV2 = {}
  if (themeById(input.theme)) out.theme = input.theme as string

  if (isBag(input.palette)) {
    const palette: Partial<Palette> = {}
    for (const key of ["background", "surface", "text", "accent", "accentText"] as const) {
      const hex = normalizeHex(input.palette[key])
      if (hex) palette[key] = hex
    }
    if (Object.keys(palette).length) out.palette = palette
  }

  if (fontPair(input.font)) out.font = input.font as string
  const layout = oneOf(LAYOUTS, input.layout)
  if (layout) out.layout = layout
  const width = oneOf(WIDTHS, input.width)
  if (width) out.width = width
  const density = oneOf(DENSITIES, input.density)
  if (density) out.density = density
  const avatar = oneOf(AVATARS, input.avatar)
  if (avatar) out.avatar = avatar
  const blockStyle = oneOf(BLOCK_STYLES, input.blockStyle)
  if (blockStyle) out.blockStyle = blockStyle
  const shape = oneOf(SHAPES, input.shape)
  if (shape) out.shape = shape

  if (isBag(input.background)) {
    const background: NonNullable<ThemeV2["background"]> = {}
    const kind = oneOf(BACKGROUNDS, input.background.kind)
    if (kind) background.kind = kind
    const ink = normalizeHex(input.background.ink)
    if (ink) background.ink = ink
    const image = safeImageUrl(input.background.image)
    if (image) background.image = image
    if (Object.keys(background).length) out.background = background
  }

  if (isBag(input.motion)) {
    const motion: NonNullable<ThemeV2["motion"]> = {}
    const entrance = oneOf(ENTRANCES, input.motion.entrance)
    if (entrance) motion.entrance = entrance
    const hover = oneOf(HOVERS, input.motion.hover)
    if (hover) motion.hover = hover
    if (Object.keys(motion).length) out.motion = motion
  }

  return out
}

/** The v2 recipe behind a stored theme of any vintage, validated. */
export function storedToV2(stored: unknown): { v2: ThemeV2; legacy: boolean } {
  if (!isBag(stored)) return { v2: { theme: DEFAULT_THEME }, legacy: false }

  if (isBag(stored.v2) && Object.keys(stored.v2).length > 0) {
    const v2 = sanitizeV2(stored.v2)
    if (!v2.theme) v2.theme = themeById(stored.preset) ? (stored.preset as string) : DEFAULT_THEME
    return { v2, legacy: false }
  }

  // A v2 theme id in `preset` with no recipe: that theme, untouched.
  if (themeById(stored.preset)) return { v2: { theme: stored.preset as string }, legacy: stored.preset === "legacy" }

  // A v1 document is one that names a v1 preset or carries any v1 field.
  const hasV1 =
    (typeof stored.preset === "string" && V1_PRESETS.includes(stored.preset)) ||
    ["backgroundColor", "accentColor", "buttonColor", "buttonStyle", "linkStyle", "backgroundType", "font"].some((key) => stored[key] != null)
  if (hasV1) return { v2: sanitizeV2(legacyToV2(stored)), legacy: true }

  return { v2: { theme: DEFAULT_THEME }, legacy: false }
}

/* ── resolve ── */

function resolveFrom(base: ThemeDefinition, v2: ThemeV2, customCSS: string, legacy: boolean): ResolvedTheme {
  const palette: Palette = { ...base.palette, ...v2.palette }
  const kind = oneOf(BACKGROUNDS, v2.background?.kind) ?? base.background.kind
  const image = safeImageUrl(v2.background?.image)

  const changed = {} as Record<Layer, boolean>
  for (const layer of LAYERS) changed[layer] = LAYER_KEYS[layer].some((key) => v2[key] !== undefined)

  return {
    id: base.id,
    name: base.name,
    palette,
    onSurface: readableOn(palette.surface, [palette.text, palette.background]),
    font: fontPair(v2.font) ?? fontPair(base.font)!,
    layout: oneOf(LAYOUTS, v2.layout) ?? base.layout,
    width: oneOf(WIDTHS, v2.width) ?? base.width,
    density: oneOf(DENSITIES, v2.density) ?? base.density,
    avatar: oneOf(AVATARS, v2.avatar) ?? base.avatar,
    blockStyle: oneOf(BLOCK_STYLES, v2.blockStyle) ?? base.blockStyle,
    shape: oneOf(SHAPES, v2.shape) ?? base.shape,
    background: {
      // An image background with no usable image is the theme's own background.
      kind: kind === "image" && !image ? (base.background.kind === "image" ? "flat" : base.background.kind) : kind,
      ink: normalizeHex(v2.background?.ink) ?? base.background.ink,
      image,
    },
    motion: {
      entrance: oneOf(ENTRANCES, v2.motion?.entrance) ?? base.motion.entrance,
      hover: oneOf(HOVERS, v2.motion?.hover) ?? base.motion.hover,
    },
    customCSS,
    legacy,
    changed,
  }
}

/** Any stored theme → a complete, valid theme. Pure; never throws. */
export function resolveTheme(stored: unknown): ResolvedTheme {
  try {
    const { v2, legacy } = storedToV2(stored)
    const base = themeById(v2.theme) ?? themeById(DEFAULT_THEME)!
    const customCSS = isBag(stored) && typeof stored.customCSS === "string" ? stored.customCSS : ""
    return resolveFrom(base, v2, customCSS, legacy)
  } catch {
    return resolveFrom(themeById(DEFAULT_THEME)!, {}, "", false)
  }
}

/** A catalog theme exactly as designed (picker proofs, landing samples). */
export function resolveThemeId(id: string): ResolvedTheme {
  return resolveFrom(themeById(id) ?? themeById(DEFAULT_THEME)!, {}, "", false)
}

/** Strip what must never run from owner CSS. The result goes inside a `<style>` element. */
export function sanitizeCustomCSS(css: string): string {
  return css
    .replace(/<[^>]*>/g, "")
    // "<" alone is enough to stop a `</style>` breakout; ">" stays for child selectors.
    .replace(/</g, "")
    .replace(/@import\s[^;]+;?/gi, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/expression\s*\(/gi, "")
    .trim()
}
