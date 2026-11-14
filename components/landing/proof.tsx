"use client"

import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { getAvatarRadius, getBackgroundStyle, getBlockSpanClass, themeToCSSVars } from "@/lib/theme-utils"
import { SITE_HOST } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * A proof: a real page at phone width, drawn with the same renderers and theme helpers as
 * `/[username]`. No device chrome. The slug line on top is the page's address.
 *
 * The page inside is a sample, so it is `inert`: nothing in it takes focus or a click.
 */
export function Proof({
  blocks,
  theme,
  username,
  name,
  bio,
  className,
}: {
  blocks: IBlock[]
  theme: ThemeConfig
  username: string
  name: string
  bio?: string
  className?: string
}) {
  return (
    <figure
      className={cn("w-full max-w-[380px] overflow-hidden rounded-panel border border-ink bg-sheet shadow-offset", className)}
    >
      <figcaption className="type-micro tabular flex items-center justify-between gap-3 border-b border-ink bg-sheet px-3 py-2 text-ink">
        <span className="truncate">
          {SITE_HOST}/{username}
        </span>
        <span className="shrink-0 font-normal text-ink-soft">Sample page</span>
      </figcaption>
      <div
        inert
        className="px-5 pt-7 pb-6 transition-colors duration-200 ease-press"
        style={{ ...getBackgroundStyle(theme), ...themeToCSSVars(theme), fontFamily: "var(--page-font-family)" }}
      >
        <div data-compose-item className="flex flex-col items-center text-center" style={{ color: "var(--page-accent)" }}>
          <div
            className={cn("flex size-16 items-center justify-center text-2xl font-extrabold", getAvatarRadius(theme))}
            style={{ backgroundColor: "var(--page-accent)", color: theme.backgroundColor }}
            aria-hidden="true"
          >
            {name.charAt(0)}
          </div>
          <p className="type-title-3 mt-3">{name}</p>
          {bio && <p className="type-small mt-1 opacity-75">{bio}</p>}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {blocks.map((block, i) => (
            <div key={block._id} data-compose-item className={getBlockSpanClass(block.type, block.data)}>
              <BlockRenderer block={block} theme={theme} index={i} />
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
