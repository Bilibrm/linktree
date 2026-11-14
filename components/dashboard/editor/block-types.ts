import {
  AlignLeft,
  ClipboardList,
  Heading,
  Image as ImageIcon,
  Images,
  Link2,
  Minus,
  MousePointerClick,
  Play,
  Share2,
  SquareSplitVertical,
  Timer,
  Video,
  type LucideIcon,
} from "lucide-react"
import type { FlatBlockData } from "@/lib/validation"
import type { BlockType, IBlock } from "@/types"

export type BlockTypeInfo = {
  type: BlockType
  label: string
  icon: LucideIcon
  /** One line for the block picker: what a visitor gets. */
  description: string
  /** Extra words the picker search should match. */
  keywords: string
}

export const BLOCK_TYPES: BlockTypeInfo[] = [
  { type: "link", label: "Link", icon: Link2, description: "A tile that opens a web address", keywords: "url website" },
  { type: "social", label: "Social icons", icon: Share2, description: "A row of icons for your profiles", keywords: "instagram tiktok youtube profiles" },
  { type: "text", label: "Text", icon: AlignLeft, description: "A paragraph in your own words", keywords: "paragraph about note" },
  { type: "header", label: "Header", icon: Heading, description: "A heading that starts a section", keywords: "title heading section" },
  { type: "button", label: "Button", icon: MousePointerClick, description: "One strong call to act, such as Book or Buy", keywords: "cta action" },
  { type: "image", label: "Image", icon: ImageIcon, description: "One picture with an optional caption", keywords: "photo picture" },
  { type: "gallery", label: "Gallery", icon: Images, description: "Several pictures in a grid", keywords: "photos pictures grid" },
  { type: "video", label: "Video", icon: Video, description: "A video file that plays on your page", keywords: "mp4 clip film" },
  { type: "embed", label: "Embed", icon: Play, description: "A YouTube, Spotify, SoundCloud or TikTok player", keywords: "music player" },
  { type: "form", label: "Form", icon: ClipboardList, description: "Collect names, emails and messages", keywords: "contact signup newsletter lead" },
  { type: "countdown", label: "Countdown", icon: Timer, description: "Days, hours and minutes until a date", keywords: "timer launch event date" },
  { type: "divider", label: "Divider", icon: Minus, description: "A thin line between sections", keywords: "line rule separator" },
  { type: "spacer", label: "Spacer", icon: SquareSplitVertical, description: "Empty room between two blocks", keywords: "space gap padding" },
]

const byType = new Map(BLOCK_TYPES.map((info) => [info.type, info]))

export function blockTypeInfo(type: BlockType): BlockTypeInfo {
  return byType.get(type) ?? BLOCK_TYPES[0]
}

/** What a new block starts with, so it shows up on the proof before anything is typed. */
export function defaultBlockData(type: BlockType): FlatBlockData {
  switch (type) {
    case "link":
      return { title: "New link", url: "https://", icon: "", thumbnailUrl: "" }
    case "header":
      return { text: "New section", level: 2 as const }
    case "text":
      return { content: "Write something here.", align: "center" as const }
    case "divider":
      return {}
    case "social":
      return { links: [{ platform: "instagram", url: "https://" }] }
    case "image":
      return { src: "", alt: "", caption: "" }
    case "gallery":
      return { images: [{ src: "", alt: "" }] }
    case "embed":
      return { url: "https://", type: "youtube" as const }
    case "form":
      return { title: "Get in touch", fields: [{ label: "Name", type: "text", required: true }], buttonText: "Send" }
    case "countdown":
      return { title: "Countdown", targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16), emoji: "" }
    case "button":
      return { label: "Button", url: "https://", variant: "primary" as const, icon: "", fullWidth: true }
    case "spacer":
      return { height: 24 }
    case "video":
      return { src: "", poster: "", caption: "", autoplay: false, loop: false, muted: false }
  }
}

const hasAddress = (value?: string) => !!value && value.length > 8 && (value.startsWith("https://") || value.startsWith("http://"))

/**
 * What is still missing before a block shows anything to visitors, or null when it is ready.
 * The renderers draw nothing for these, so the proof needs a stand-in to select.
 */
export function blockMissing(block: IBlock): string | null {
  const d = block.data ?? {}
  switch (block.type) {
    case "image":
      return d.src ? null : "Add an image address to show it"
    case "gallery":
      return (d.images || []).some((img) => img.src) ? null : "Add image addresses to show them"
    case "video":
      return d.src ? null : "Add a video address to show it"
    case "embed":
      return hasAddress(d.url) ? null : "Paste a link to show the player"
    default:
      return null
  }
}

/** A short name for one block, for screen readers and announcements. */
export function blockSummary(block: IBlock): string {
  const d = block.data ?? {}
  const text = d.title || d.label || d.text || d.content || d.caption || ""
  const label = blockTypeInfo(block.type).label
  return text ? `${label}: ${String(text).slice(0, 60)}` : label
}
