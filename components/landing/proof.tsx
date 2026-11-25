"use client"

import type { IBlock } from "@/types"
import type { ResolvedTheme } from "@/lib/themes"
import { ThemedPage } from "@/components/page/themed-page"
import { useThemeFonts } from "@/components/page/theme-fonts"
import { SITE_HOST } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * A proof: a real page at phone width, drawn by the same `ThemedPage` as `/[username]`.
 * No device chrome. The slug line on top is the page's address.
 *
 * The page inside is a sample, so it is `inert`: nothing in it takes focus or a click.
 */
export function Proof({
  blocks,
  theme,
  username,
  name,
  bio,
  still = true,
  compose,
  className,
}: {
  blocks: IBlock[]
  theme: ResolvedTheme
  username: string
  name: string
  bio?: string
  /** Off to let the theme's entrance and ambient motion play. */
  still?: boolean
  /** Mark the header and blocks for the hero's compose timeline. */
  compose?: boolean
  className?: string
}) {
  useThemeFonts([theme.font.href])
  return (
    <figure className={cn("w-full max-w-[380px] overflow-hidden rounded-panel border border-ink bg-sheet shadow-offset", className)}>
      <figcaption className="type-micro tabular flex items-center justify-between gap-3 border-b border-ink bg-sheet px-3 py-2 text-ink">
        <span className="truncate">
          {SITE_HOST}/{username}
        </span>
        <span className="shrink-0 font-normal text-ink-soft">{theme.name}</span>
      </figcaption>
      <div inert>
        <ThemedPage theme={theme} header={{ name, bio }} blocks={blocks} still={still} nameAs="p" composeItems={compose} />
      </div>
    </figure>
  )
}
