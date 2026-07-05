"use client"

import type { IBlock, ThemeConfig } from "@/types"
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
import { ButtonBlock } from "./button-block"
import { SpacerBlock } from "./spacer-block"
import { VideoBlock } from "./video-block"

export type BlockComponentProps = {
  data: any
  blockId?: string
  pageId?: string
  theme: ThemeConfig
  index?: number
}

const renderers: Record<string, React.FC<BlockComponentProps>> = {
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
  button: ButtonBlock,
  spacer: SpacerBlock,
  video: VideoBlock,
}

const DEFAULT_THEME: ThemeConfig = { preset: "minimal" }

export function BlockRenderer({
  block,
  theme,
  index = 0,
}: {
  block: IBlock
  theme?: ThemeConfig
  index?: number
}) {
  const Renderer = renderers[block.type]
  if (!Renderer) return null

  return (
    <Renderer
      data={block.data}
      blockId={block._id}
      pageId={block.pageId}
      theme={theme || DEFAULT_THEME}
      index={index}
    />
  )
}
