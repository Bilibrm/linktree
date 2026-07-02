"use client"

import type { IBlock } from "@/types"
import { LinkBlock } from "./link-block"
import { HeaderBlock } from "./header-block"
import { TextBlock } from "./text-block"
import { DividerBlock } from "./divider-block"
import { SocialBlock } from "./social-block"
import { ImageBlock } from "./image-block"
import { GalleryBlock } from "./gallery-block"
import { EmbedBlock } from "./embed-block"
import { FormBlock as FormBlockComponent } from "./form-block"
import { CountdownBlock } from "./countdown-block"

const renderers: Record<string, React.FC<{ data: any; blockId?: string; pageId?: string }>> = {
  link: LinkBlock,
  header: HeaderBlock,
  text: TextBlock,
  divider: DividerBlock,
  social: SocialBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  embed: EmbedBlock,
  form: FormBlockComponent,
  countdown: CountdownBlock,
}

export function BlockRenderer({ block }: { block: IBlock }) {
  const Renderer = renderers[block.type]
  if (!Renderer) return null

  return <Renderer data={block.data} blockId={block._id} pageId={block.pageId} />
}
