/**
 * Theme system v2 (DESIGN_SYSTEM.md §8.9). A theme is a composed recipe of layers.
 * This file is pure data and types: no React, no DOM, safe to import anywhere.
 */

export const LAYOUTS = ["stack", "editorial", "cover", "grid", "poster"] as const
export const BLOCK_STYLES = ["filled", "outline", "offset", "ticket", "soft", "underline"] as const
export const SHAPES = ["sharp", "soft", "round", "pill"] as const
export const AVATARS = ["circle", "rounded", "square"] as const
export const WIDTHS = ["narrow", "normal", "wide"] as const
export const DENSITIES = ["compact", "comfortable", "spacious"] as const
export const BACKGROUNDS = ["flat", "duotone", "halftone", "grain", "paper", "grid", "stripes", "confetti", "image", "drift", "blobs"] as const
export const ENTRANCES = ["print", "slide", "fade", "none"] as const
export const HOVERS = ["lift", "offset", "fill", "underline", "flicker", "none"] as const

export type Layout = (typeof LAYOUTS)[number]
export type BlockStyle = (typeof BLOCK_STYLES)[number]
export type Shape = (typeof SHAPES)[number]
export type AvatarShape = (typeof AVATARS)[number]
export type Width = (typeof WIDTHS)[number]
export type Density = (typeof DENSITIES)[number]
export type BackgroundKind = (typeof BACKGROUNDS)[number]
export type Entrance = (typeof ENTRANCES)[number]
export type Hover = (typeof HOVERS)[number]

/** Six-digit hex colors only. They are written into CSS, so nothing else is accepted. */
export type Palette = {
  background: string
  /** Fill of raised blocks: offset, ticket and soft tiles, cards, inputs. */
  surface: string
  text: string
  accent: string
  /** Text and icons on an accent fill. */
  accentText: string
}

/**
 * What an owner's page stores under `theme.v2`: a theme id plus only the layers they
 * changed. Everything is optional; `resolveTheme` fills the rest from the theme.
 */
export type ThemeV2 = {
  theme?: string
  palette?: Partial<Palette>
  font?: string
  layout?: string
  width?: string
  density?: string
  avatar?: string
  blockStyle?: string
  shape?: string
  background?: { kind?: string; ink?: string; image?: string }
  motion?: { entrance?: string; hover?: string }
}

/** The layers an owner can reset to the theme, one at a time. */
export const LAYERS = ["palette", "font", "layout", "blocks", "background", "motion"] as const
export type Layer = (typeof LAYERS)[number]

/** The v2 keys each layer owns. */
export const LAYER_KEYS: Record<Layer, (keyof ThemeV2)[]> = {
  palette: ["palette"],
  font: ["font"],
  layout: ["layout", "width", "density", "avatar"],
  blocks: ["blockStyle", "shape"],
  background: ["background"],
  motion: ["motion"],
}

export type FontPair = {
  id: string
  label: string
  /** CSS font-family lists, fallbacks included. */
  display: string
  body: string
  /** Google Fonts stylesheet, or null when the app already ships the files. */
  href: string | null
  displayWeight: number
  bodyWeight: number
  /** Weight of labels on tiles and buttons. */
  labelWeight: number
  displayStretch?: string
  displayTracking?: string
  displayCase?: "uppercase"
  /** Average glyph width in em, used to fit the poster layout's name to the page. */
  fit: number
}

export type ThemeDefinition = {
  id: string
  name: string
  /** One plain line for the picker and the landing page. */
  blurb: string
  /** Not offered in the picker (the stand-in for pages made before v2). */
  hidden?: boolean
  palette: Palette
  font: string
  layout: Layout
  width: Width
  density: Density
  avatar: AvatarShape
  blockStyle: BlockStyle
  shape: Shape
  background: { kind: BackgroundKind; ink: string }
  motion: { entrance: Entrance; hover: Hover }
}

export type ResolvedTheme = {
  id: string
  name: string
  palette: Palette
  /** Readable text color on `palette.surface` (the page text when it has enough contrast). */
  onSurface: string
  font: FontPair
  layout: Layout
  width: Width
  density: Density
  avatar: AvatarShape
  blockStyle: BlockStyle
  shape: Shape
  background: { kind: BackgroundKind; ink: string; image: string | null }
  motion: { entrance: Entrance; hover: Hover }
  customCSS: string
  /** Built from a pre-v2 document. */
  legacy: boolean
  /** Which layers differ from the theme's own. */
  changed: Record<Layer, boolean>
}
