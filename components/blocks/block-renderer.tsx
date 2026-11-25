import type { IBlock } from "@/types"
import { LinkBlock } from "./link-block"
import { HeaderBlock } from "./header-block"
import { TextBlock } from "./text-block"
import { DividerBlock } from "./divider-block"
import { SocialBlock } from "./social-block"
import { ImageBlock } from "./image-block"
import { GalleryBlock } from "./gallery-block"
import { EmbedBlock } from "./embed-block"
import { FormBlock } from "./form-block"
import { CountdownBlock } from "./countdown-block"
import { ButtonBlock } from "./button-block"
import { SpacerBlock } from "./spacer-block"
import { VideoBlock } from "./video-block"
import type { BlockComponentProps } from "./block-props"

export type { BlockComponentProps } from "./block-props"

/**
 * One block as visitors see it. There is no theme prop: every block draws from the page
 * root's theme (`.lp` in app/themes.css), so the same markup serves the public page, the
 * editor proof, the Look picker and the landing samples.
 *
 * Server-safe (no directive). Only the form, countdown and video are client components.
 */
const renderers: Record<string, React.ComponentType<BlockComponentProps>> = {
  link: LinkBlock,
  header: HeaderBlock,
  text: TextBlock,
  divider: DividerBlock,
  social: SocialBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  embed: EmbedBlock,
  form: FormBlock,
  countdown: CountdownBlock,
  button: ButtonBlock,
  spacer: SpacerBlock,
  video: VideoBlock,
}

export function BlockRenderer({ block }: { block: IBlock }) {
  const Renderer = renderers[block.type]
  if (!Renderer) return null
  return <Renderer data={block.data ?? {}} blockId={block._id} pageId={block.pageId} />
}

/** Whether a block takes half a row where the layout has columns (grid, poster). */
export function blockIsHalf(block: Pick<IBlock, "type" | "data">): boolean {
  const data = (block.data ?? {}) as { featured?: boolean; fullWidth?: boolean }
  if (block.type === "link") return !data.featured
  if (block.type === "button") return !data.fullWidth
  return false
}
