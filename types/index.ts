import type { FlatBlockData } from "@/lib/validation"
import type { ThemeV2 } from "@/lib/themes/types"

export type BlockType = "link" | "header" | "text" | "divider" | "social" | "image" | "gallery" | "embed" | "form" | "countdown" | "button" | "spacer" | "video"

/**
 * A page's theme as stored. Two generations share the document:
 *
 * - v2 (DESIGN_SYSTEM.md §8.9): `preset` holds the theme id and `v2` the recipe.
 * - v1: `preset` is one of the eight old preset names and the flat fields below hold
 *   the look. Nothing writes these any more; they stay typed because production
 *   documents carry them and `resolveTheme` (lib/themes) reads them.
 *
 * Never render from this directly. Pass it through `resolveTheme`.
 */
export interface ThemeConfig {
  preset: string
  v2?: ThemeV2
  customCSS?: string
  backgroundColor?: string
  backgroundType?: string
  backgroundValue?: string
  backgroundDirection?: string
  backgroundStops?: { color: string; position: number }[]
  font?: string
  buttonStyle?: string
  buttonColor?: string
  buttonTextColor?: string
  accentColor?: string
  linkStyle?: string
  linkHover?: string
  socialIconStyle?: string
  borderRadius?: string
  shadow?: string
  avatarShape?: string
  layoutWidth?: string
  animation?: string
  backgroundBlur?: boolean
  spacingDensity?: string
}

export interface BlockData {
  link?: {
    title: string
    url: string
    icon?: string
    thumbnailUrl?: string
  }
  header?: {
    text: string
    level?: 1 | 2 | 3
  }
  text?: {
    content: string
    align?: "left" | "center" | "right"
  }
  social?: {
    links: { platform: string; url: string }[]
  }
  image?: {
    src: string
    alt?: string
    caption?: string
  }
  gallery?: {
    images: { src: string; alt?: string }[]
  }
  embed?: {
    url: string
    type?: "youtube" | "spotify" | "soundcloud" | "tiktok" | "other"
  }
  form?: {
    title?: string
    fields: { label: string; type: "text" | "email" | "textarea" | "select"; required: boolean; options?: string[] }[]
    buttonText?: string
  }
  countdown?: {
    title: string
    targetDate: string
    emoji?: string
  }
  button?: {
    label: string
    url: string
    variant?: "primary" | "outline" | "ghost"
    icon?: string
    fullWidth?: boolean
  }
  spacer?: {
    height?: number
  }
  video?: {
    src: string
    poster?: string
    caption?: string
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
  }
}

export interface IBlock {
  _id: string
  pageId: string
  type: BlockType
  order: number
  data: FlatBlockData
  startAt?: string | null
  endAt?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IPage {
  _id: string
  userId: string
  username: string
  title: string
  bio: string
  theme: ThemeConfig
  seo: {
    title?: string
    description?: string
    ogImageUrl?: string
  }
  isPublished: boolean
  visibility: "public" | "unlisted" | "password"
  pageHasPassword: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface IUser {
  _id: string
  email: string
  username: string
  name?: string
  avatarUrl?: string
  plan: string
  createdAt: string
}

export interface IClickEvent {
  _id: string
  blockId: string
  pageId: string
  timestamp: Date
  referrer?: string
}

export interface IFormSubmission {
  _id: string
  blockId: string
  pageId: string
  data: Record<string, string>
  submittedAt: Date
}
