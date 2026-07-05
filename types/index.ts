export type BlockType = "link" | "header" | "text" | "divider" | "social" | "image" | "gallery" | "embed" | "form" | "countdown" | "button" | "spacer" | "video"

export type ThemePreset = "minimal" | "dark" | "vibrant" | "nature" | "ocean" | "sunset" | "mono" | "bold"

export interface ThemeConfig {
  preset: ThemePreset
  backgroundColor?: string
  backgroundType?: "solid" | "gradient" | "image" | "animated"
  backgroundValue?: string
  backgroundDirection?: string
  backgroundStops?: { color: string; position: number }[]
  font?: string
  buttonStyle?: "sharp" | "rounded" | "pill"
  buttonColor?: string
  buttonTextColor?: string
  accentColor?: string
  linkStyle?: "standard" | "card" | "minimal"
  linkHover?: "lift" | "underline" | "fill" | "none"
  socialIconStyle?: "outline" | "filled" | "minimal"
  borderRadius?: "sharp" | "soft" | "rounded" | "pill"
  shadow?: "none" | "subtle" | "medium" | "strong"
  avatarShape?: "circle" | "rounded" | "square"
  layoutWidth?: "narrow" | "normal" | "wide"
  animation?: "none" | "fade" | "slide" | "scale"
  backgroundBlur?: boolean
  spacingDensity?: "compact" | "comfortable" | "spacious"
  customCSS?: string
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
  data: BlockData
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
